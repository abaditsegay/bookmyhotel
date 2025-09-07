# Simplified variables for Lightsail + S3/CloudFront deployment

variable "aws_region" {
  description = "AWS region for S3 and CloudFront deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
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
  default     = ""
}

variable "domain_name" {
  description = "Custom domain name for CloudFront (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ARN of SSL certificate in ACM for custom domain (optional)"
  type        = string
  default     = ""
}

# Lightsail configuration (for reference only - not managed by Terraform)
variable "lightsail_backend_ip" {
  description = "Public IP address of your Lightsail instance"
  type        = string
  default     = ""
}

variable "lightsail_db_endpoint" {
  description = "Endpoint of your Lightsail MySQL database"
  type        = string
  default     = ""
}
