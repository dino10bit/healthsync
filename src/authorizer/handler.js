/**
 * @file This file contains a sample implementation for the AWS Lambda Authorizer.
 * Its primary responsibilities are:
 * 1. Validate the incoming JWT from Firebase Authentication.
 * 2. Generate a unique `correlationId` for the request.
 * 3. Write a mapping of `userId` -> `correlationId` to a secure DynamoDB table for a short period.
 * 4. Return an IAM policy that allows the request to proceed to the backend.
 *
 * This code is a blueprint and assumes the use of the AWS SDK for JavaScript v3.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'crypto';

// It is a best practice to initialize SDK clients outside the handler function
// to take advantage of connection reuse.
const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// The name of the secure lookup table, passed in via environment variables.
const BREAK_GLASS_TABLE_NAME = process.env.BREAK_GLASS_TABLE_NAME;

// --- Structured Logger ---
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LOG_LEVEL = LogLevel[process.env.LOG_LEVEL?.toUpperCase() || 'INFO'];

function log(level, message, context = {}) {
  if (level >= CURRENT_LOG_LEVEL) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: Object.keys(LogLevel).find(key => LogLevel[key] === level),
      message,
      ...context,
    };
    // Using console.log for all levels to output the JSON structure.
    // CloudWatch Logs will parse this and allow for structured querying.
    console.log(JSON.stringify(logEntry));
  }
}
// --- End Structured Logger ---


/**
 * Main handler for the Lambda Authorizer.
 * @param {object} event The event object from API Gateway.
 * @returns {Promise<object>} An IAM policy document.
 */
export const handler = async (event) => {
  const correlationId = randomUUID();
  const base_context = { correlationId };
  log(LogLevel.INFO, `Starting authorization for request.`, base_context);

  try {
    const token = getToken(event);
    if (!token) {
      log(LogLevel.WARN, `No token found in request.`, base_context);
      throw new Error('Unauthorized'); // This will result in a 401 response
    }

    // In a real implementation, this function would contain the logic to
    // validate the JWT signature, issuer, audience, and expiration.
    // This typically involves fetching the public keys (JWKS) from the issuer.
    // For this example, we will assume validation is successful and returns a decoded token.
    const decodedToken = await validateJwt(token, base_context);
    const userId = decodedToken.sub; // 'sub' claim usually contains the user ID
    const user_context = { ...base_context, userId };

    // Asynchronously write the mapping to the break-glass index.
    // We do not `await` this promise, as it is not on the critical path for
    // returning the authorization policy. This is a fire-and-forget operation.
    // The Lambda execution context will keep the function alive until the promise settles.
    writeToBreakGlassIndex(userId, correlationId).catch(err => {
      // It is critical to catch and log any errors here so that a failure
      // in our debugging mechanism does not cause the user's request to fail.
      log(LogLevel.ERROR, `Failed to write to break-glass index`, { ...user_context, error: err.message });
    });

    log(LogLevel.INFO, `Successfully authorized user`, user_context);

    // Return the IAM policy that allows the request to proceed.
    // The `principalId` is set to the user's unique ID.
    // The `context` object can pass additional information to the backend,
    // including the `correlationId` for end-to-end tracing.
    return generatePolicy(userId, 'Allow', event.methodArn, {
      correlationId: correlationId,
    });

  } catch (error) {
    log(LogLevel.ERROR, `Authorization failed`, { ...base_context, error: error.message });
    // In case of any error, explicitly deny access.
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

/**
 * Writes the mapping of userId to correlationId to the break-glass DynamoDB table.
 * @param {string} userId The user's unique identifier.
 * @param {string} correlationId The unique ID for the current request.
 */
async function writeToBreakGlassIndex(userId, correlationId) {
  // TTL set to 24 hours from now (in seconds)
  const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

  const params = {
    TableName: BREAK_GLASS_TABLE_NAME,
    Item: {
      'userId': { S: `USER#${userId}` },
      'timestamp': { S: new Date().toISOString() },
      'correlationId': { S: correlationId },
      'ttl': { N: String(ttl) },
    },
  };

  const command = new PutItemCommand(params);
  await dynamoDBClient.send(command);
}

/**
 * Extracts the token from the authorization header.
 * @param {object} event The API Gateway event.
 * @returns {string|null} The JWT or null if not found.
 */
function getToken(event) {
  if (event.authorizationToken && event.authorizationToken.split(' ')[0] === 'Bearer') {
    return event.authorizationToken.split(' ')[1];
  }
  return null;
}

/**
 * A placeholder for a real JWT validation function.
 * @param {string} token The JWT to validate.
 * @param {object} context Logging context
 * @returns {Promise<object>} The decoded token payload.
 */
async function validateJwt(token, context) {
  // In a real application, this would use a library like 'jsonwebtoken' or 'aws-jwt-verify'
  // to verify the token against the Firebase public keys (JWKS).
  // For this example, we'll return a mock decoded token.
  log(LogLevel.DEBUG, 'Simulating JWT validation', { ...context, token: token.substring(0, 15) + '...' });
  return {
    sub: 'user-123-abc', // Mock user ID
    iss: 'https://securetoken.google.com/your-firebase-project',
    aud: 'your-firebase-project',
    // ... other claims
  };
}

/**
 * Generates an IAM policy document for the API Gateway authorizer response.
 * @param {string} principalId The principal ID for the policy.
 * @param {string} effect 'Allow' or 'Deny'.
 * @param {string} resource The ARN of the resource being accessed.
 * @param {object} context An optional context object to pass to the backend.
 * @returns {object} The IAM policy document.
 */
function generatePolicy(principalId, effect, resource, context = {}) {
  const authResponse = {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: context,
  };
  return authResponse;
}
