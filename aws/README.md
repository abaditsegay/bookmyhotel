# AWS Deployment Configuration

This directory contains all the configuration files needed to deploy BookMyHotel to AWS.

## 🏗️ Architecture Overview

- **Frontend**: React app deployed to AWS S3 + CloudFront
- **Backend**: Spring Boot app on AWS EC2 (or ECS)  
- **Database**: AWS RDS MySQL
- **Infrastructure**: Managed via Terraform
- **CI/CD**: GitHub Actions for automated deployment

## 📁 Directory Structure

```
aws/
├── terraform/           # Infrastructure as Code
├── scripts/            # Deployment and utility scripts
├── configs/            # Environment-specific configurations
├── github-actions/     # CI/CD workflows
└── docs/              # Deployment documentation
```

## 🚀 Deployment Options

### Option 1: EC2 Deployment (Recommended for MVP)
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 instance with Spring Boot JAR
- **Database**: RDS MySQL
- **Cost**: Low to medium
- **Complexity**: Medium

### Option 2: Container Deployment (Scalable)
- **Frontend**: S3 + CloudFront  
- **Backend**: ECS Fargate with Docker
- **Database**: RDS MySQL
- **Cost**: Medium
- **Complexity**: Higher

### Option 3: Serverless (Future Enhancement)
- **Frontend**: S3 + CloudFront
- **Backend**: Lambda + API Gateway
- **Database**: RDS Aurora Serverless
- **Cost**: Pay-per-use
- **Complexity**: High

## 🔧 Environment Configuration

The deployment supports multiple environments:

- **Development**: `dev.tfvars`
- **Staging**: `staging.tfvars`  
- **Production**: `prod.tfvars`

## 📋 Prerequisites

1. AWS Account with appropriate permissions
2. Terraform >= 1.0
3. AWS CLI configured
4. Domain name (optional, for custom domain)
5. SSL Certificate in AWS Certificate Manager

## 🚦 Quick Start

1. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

2. **Set up environment variables**:
   ```bash
   cp aws/configs/dev.tfvars.example aws/configs/dev.tfvars
   # Edit the values in dev.tfvars
   ```

3. **Deploy infrastructure**:
   ```bash
   cd aws/terraform
   terraform init
   terraform plan -var-file="../configs/dev.tfvars"
   terraform apply -var-file="../configs/dev.tfvars"
   ```

4. **Deploy applications**:
   ```bash
   ./aws/scripts/deploy-all.sh dev
   ```

## 🔒 Security Features

- VPC with private/public subnets
- Security groups with minimal required access
- RDS in private subnet
- WAF for CloudFront (optional)
- Encrypted storage and data in transit
- IAM roles with least privilege principle

## 📊 Monitoring & Logging

- CloudWatch for application logs
- Application Load Balancer health checks
- RDS monitoring and backups
- Cost monitoring and alerts

## 🔄 CI/CD Pipeline

GitHub Actions workflow automatically:
1. Builds and tests the application
2. Creates Docker images (if using containers)
3. Deploys to staging environment
4. Runs integration tests
5. Promotes to production (manual approval)

## 📞 Support

See individual README files in each subdirectory for detailed instructions.
