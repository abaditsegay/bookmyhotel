# Variables for AWS deployment
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "bookmyhotel"
}

variable "owner_email" {
  description = "Email of the project owner"
  type        = string
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# EC2 Configuration
variable "instance_type" {
  description = "EC2 instance type for the application server"
  type        = string
  default     = "t3.medium"
}

variable "ec2_instance_type" {
  description = "EC2 instance type for backend (alias for consistency)"
  type        = string
  default     = "t3.medium"
}

variable "key_pair_name" {
  description = "Name of the AWS key pair for EC2 access"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for EC2 instances (leave empty for latest Amazon Linux 2)"
  type        = string
  default     = ""
}

variable "ssh_public_key" {
  description = "SSH public key content for EC2 access"
  type        = string
  default     = ""
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = ["10.0.0.0/8"]
}

# Auto Scaling Configuration
variable "asg_min_size" {
  description = "Minimum number of instances in Auto Scaling Group"
  type        = number
  default     = 1
}

variable "asg_max_size" {
  description = "Maximum number of instances in Auto Scaling Group"
  type        = number
  default     = 3
}

variable "asg_desired_capacity" {
  description = "Desired number of instances in Auto Scaling Group"
  type        = number
  default     = 2
}

# RDS Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "bookmyhotel"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "bookmyhotel"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_engine_version" {
  description = "MySQL engine version"
  type        = string
  default     = "8.0.35"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS in GB"
  type        = number
  default     = 100
}

variable "db_backup_retention_days" {
  description = "Number of days to retain database backups"
  type        = number
  default     = 7
}

variable "enable_performance_insights" {
  description = "Enable RDS Performance Insights"
  type        = bool
  default     = false
}

variable "enable_enhanced_monitoring" {
  description = "Enable RDS enhanced monitoring"
  type        = bool
  default     = false
}

# Application Configuration
variable "app_version" {
  description = "Version of the application to deploy"
  type        = string
  default     = "latest"
}

variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ARN of SSL certificate in ACM (optional)"
  type        = string
  default     = ""
}

# S3 Configuration
variable "s3_bucket_force_destroy" {
  description = "Force destroy S3 buckets even if not empty"
  type        = bool
  default     = false
}

# Monitoring Configuration
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

# Security Configuration
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Restrict this in production
}

variable "enable_waf" {
  description = "Enable AWS WAF for CloudFront"
  type        = bool
  default     = false
}
