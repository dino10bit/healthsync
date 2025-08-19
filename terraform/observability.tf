# Terraform Configuration for Observability Infrastructure
#
# This file defines resources related to monitoring, logging, and debugging,
# including the secure "Break-Glass" lookup index.

# -----------------------------------------------------------------------------
# Break-Glass Lookup Index DynamoDB Table
#
# This table maps a permanent userId to temporary correlationIds for a short
# period, enabling the audited "break-glass" debugging procedure.
# -----------------------------------------------------------------------------
resource "aws_dynamodb_table" "break_glass_index" {
  name           = "SyncWellBreakGlassIndex"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "timestamp"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "SyncWellBreakGlassIndex"
    Environment = "All"
    Purpose     = "Secure debugging lookup"
  }
}

# -----------------------------------------------------------------------------
# IAM Role & Policy for the Authorizer Lambda to write to the index
# -----------------------------------------------------------------------------
resource "aws_iam_role_policy" "authorizer_writes_to_break_glass_index" {
  name = "AuthorizerWritesToBreakGlassIndex"
  # This assumes the authorizer's role is defined elsewhere, and we are
  # attaching a policy to it. If not, we would define the role here.
  role = "aws_iam_role.authorizer_lambda_role.id" # Placeholder for the actual role ID

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:PutItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.break_glass_index.arn
      },
    ]
  })
}

# -----------------------------------------------------------------------------
# IAM Role for authorized operators to read from the index
#
# This role should only be assumable by a specific group of authorized
# engineers, enforced by MFA.
# -----------------------------------------------------------------------------
resource "aws_iam_role" "break_glass_reader" {
  name = "BreakGlassReaderRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          # This should be locked down to a specific IAM user group for operators
          AWS = "arn:aws:iam::123456789012:root"
        }
        Action = "sts:AssumeRole"
        Condition = {
          "Bool" = {
            "aws:MultiFactorAuthPresent" = "true"
          }
        }
      },
    ]
  })

  tags = {
    Purpose = "For audited break-glass debugging procedure"
  }
}

resource "aws_iam_role_policy" "break_glass_reader_policy" {
  name = "BreakGlassReaderCanReadIndex"
  role = aws_iam_role.break_glass_reader.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:Query"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.break_glass_index.arn
      },
    ]
  })
}
