provider "aws" {
  region = "us-west-2" # Change if needed
}

# VPC
resource "aws_vpc" "cloudsmith_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "cloudsmith-vpc"
  }
}

# Subnet (2 public subnets for Fargate)
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.cloudsmith_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = true

  tags = {
    Name = "cloudsmith-subnet-a"
  }
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id                  = aws_vpc.cloudsmith_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-west-2b"
  map_public_ip_on_launch = true

  tags = {
    Name = "cloudsmith-subnet-b"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.cloudsmith_vpc.id

  tags = {
    Name = "cloudsmith-igw"
  }
}

# Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.cloudsmith_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "cloudsmith-public-rt"
  }
}

# Associate Subnets
resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "b" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group (open HTTP + allow Jenkins deployments)
resource "aws_security_group" "cloudsmith_sg" {
  name        = "cloudsmith-sg"
  description = "Allow HTTP inbound"
  vpc_id      = aws_vpc.cloudsmith_vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Django Dev Server"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cloudsmith-sg"
  }
}

# ECR Repository
resource "aws_ecr_repository" "cloudsmith_ecr" {
  name = "cloudsmith"
}

# ECS Cluster
resource "aws_ecs_cluster" "cloudsmith_cluster" {
  name = "cloudsmith-deployments"
}
