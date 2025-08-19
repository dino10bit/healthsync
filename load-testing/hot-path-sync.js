import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Test options
export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp-up to 100 virtual users over 1 minute
    { duration: '5m', target: 100 }, // Stay at 100 virtual users for 5 minutes
    { duration: '1m', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_failed': ['rate<0.01'],   // Error rate must be less than 1%
  },
};

// The base URL of the API under test
const API_BASE_URL = 'https://api.sync-well.com'; // This should be configured for the target environment

// A placeholder for acquiring a JWT. In a real test, this would involve
// a setup function to log in a test user via Firebase REST APIs.
const AUTH_TOKEN = 'your-placeholder-jwt';

export default function () {
  const url = `${API_BASE_URL}/v1/sync-jobs`;

  const payload = JSON.stringify({
    sourceConnectionId: 'conn_12345_fitbit',
    destinationConnectionId: 'conn_67890_strava',
    dataType: 'steps',
    mode: 'manual',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Idempotency-Key': uuidv4(),
    },
  };

  const res = http.post(url, payload, params);

  // Check if the request was successful
  check(res, {
    'is status 202 Accepted': (r) => r.status === 202,
  });

  sleep(1); // Wait for 1 second between iterations
}
