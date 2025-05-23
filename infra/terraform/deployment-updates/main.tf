provider "aws" {
  region = "us-west-2"
}

resource "aws_iam_role" "lambda_role" {
  name = "deployment-updates-lambda-role"

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
  name = "deployment-updates-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_dynamodb_table" "deployments" {
  name           = "Deployments"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "repoName"

  attribute {
    name = "repoName"
    type = "S"
  }

  tags = {
    Environment = "production"
    Project     = "cloudsmith"
  }
}

resource "aws_lambda_function" "deployment_updates" {
  function_name = "deployment-updates"
  filename      = "deployment-updates.zip" # Zip your service folder
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn
}

resource "aws_apigatewayv2_api" "deployment_updates_api" {
  name          = "deployment-updates-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "deployment_updates_integration" {
  api_id           = aws_apigatewayv2_api.deployment_updates_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.deployment_updates.invoke_arn
}

resource "aws_apigatewayv2_route" "deployment_updates_route" {
  api_id    = aws_apigatewayv2_api.deployment_updates_api.id
  route_key = "POST /update-stage"
  target    = "integrations/${aws_apigatewayv2_integration.deployment_updates_integration.id}"
}

resource "aws_lambda_permission" "allow_apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvokeDeploymentUpdates"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.deployment_updates.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.deployment_updates_api.execution_arn}/*/*"
}
