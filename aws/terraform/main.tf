# Terraform configuration for AWS deployment
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
  
  # Backend for storing state - update with your S3 bucket
  backend "s3" {
    bucket = "bookmyhotel-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
    
    # Optional: DynamoDB table for state locking
    # dynamodb_table = "bookmyhotel-terraform-locks"
    encrypt = true
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = var.owner_email
    }
  }
}
