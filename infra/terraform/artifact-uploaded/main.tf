provider "aws" {
  region = "us-west-2"
}

resource "aws_dynamodb_table" "artifacts" {
  name         = "Artifacts"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "artifactId"

  attribute {
    name = "artifactId"
    type = "S"
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "artifact-uploader-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "artifact-uploader-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "dynamodb:PutItem"
        ],
        Effect   = "Allow",
        Resource = aws_dynamodb_table.artifacts.arn
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect   = "Allow",
        Resource = "*"
      }
    ]
  })
}

resource "aws_lambda_function" "artifact_uploaded" {
  function_name = "artifact-uploaded"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = "artifact-uploaded.zip"
  source_code_hash = filebase64sha256("artifact-uploaded.zip")
  environment {
    variables = {
      ARTIFACTS_TABLE = aws_dynamodb_table.artifacts.name
    }
  }
}

resource "aws_apigatewayv2_api" "artifact_api" {
  name          = "artifact-uploaded-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "artifact_integration" {
  api_id           = aws_apigatewayv2_api.artifact_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.artifact_uploaded.invoke_arn
}

resource "aws_apigatewayv2_route" "artifact_route" {
  api_id    = aws_apigatewayv2_api.artifact_api.id
  route_key = "POST /artifact-uploaded"
  target    = "integrations/${aws_apigatewayv2_integration.artifact_integration.id}"
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.artifact_uploaded.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.artifact_api.execution_arn}/*/*"
}

output "artifact_upload_api_url" {
  value = aws_apigatewayv2_api.artifact_api.api_endpoint
}
