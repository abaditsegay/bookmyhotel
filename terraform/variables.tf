# Variables for BookMyHotel AWS Infrastructure

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., test, prod)"
  type        = string
  default     = "test"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "bookmyhotel"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "root_volume_size" {
  description = "Size of the root EBS volume in GB"
  type        = number
  default     = 30
}

variable "public_key" {
  description = "Public key for SSH access"
  type        = string
}

variable "ssh_cidr_block" {
  description = "CIDR block for SSH access (your IP)"
  type        = string
  default     = "0.0.0.0/0"  # Change this to your IP for security
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "www.251solutions.com"
}

# Application Configuration
variable "mysql_root_password" {
  description = "MySQL root password"
  type        = string
  sensitive   = true
  default     = "BookMyHotel@2024!"
  
  validation {
    condition     = length(var.mysql_root_password) >= 12
    error_message = "MySQL password must be at least 12 characters long."
  }
}

variable "jwt_secret_key" {
  description = "JWT secret key for authentication"
  type        = string
  sensitive   = true
  default     = "bookmyhotelverylongsecretkeythatisatleast512bitslongforsecuritywithjwtandhs512algorithmthisisasupersecurekey2024bookmyhotelapp"
}

# Microsoft Graph OAuth2 Configuration
variable "microsoft_graph_client_id" {
  description = "Microsoft Graph OAuth2 Client ID"
  type        = string
  default     = "8e1e8dd6-e1df-48a9-9ffd-499aa6b04130"
}

variable "microsoft_graph_tenant_id" {
  description = "Microsoft Graph OAuth2 Tenant ID"
  type        = string
  default     = "d7e8b101-46f9-4942-8442-45e0903b9467"
}

variable "microsoft_graph_client_secret" {
  description = "Microsoft Graph OAuth2 Client Secret"
  type        = string
  sensitive   = true
  default     = "REPLACE_WITH_YOUR_CLIENT_SECRET"
}

# Stripe Configuration
variable "stripe_secret_key" {
  description = "Stripe secret key for payments"
  type        = string
  sensitive   = true
  default     = "sk_test_your_stripe_secret_key"
}

# Email Configuration
variable "app_email_from" {
  description = "From email address for application notifications"
  type        = string
  default     = "noreply@251solutions.com"
}
