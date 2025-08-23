#!/bin/bash

# BookMyHotel Password Generator and Security Setup
# This script generates secure passwords and handles credential management

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to generate secure password
generate_password() {
    local length=${1:-16}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to generate MySQL password
generate_mysql_password() {
    # Generate a 20-character password with special characters
    local password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-20)
    echo "BookMyHotel_${password}!"
}

# Function to generate JWT secret
generate_jwt_secret() {
    # Generate a 64-character JWT secret
    openssl rand -hex 64
}

# Function to create secure terraform.tfvars
create_secure_tfvars() {
    local public_key="$1"
    local user_ip="$2"
    
    print_info "Generating secure passwords..."
    
    local mysql_password=$(generate_mysql_password)
    local jwt_secret=$(generate_jwt_secret)
    
    print_info "Creating secure terraform.tfvars..."
    
    cat > terraform.tfvars << EOF
# BookMyHotel Secure Configuration
# Generated on $(date)
# KEEP THIS FILE SECURE - Contains sensitive credentials

# AWS Configuration
aws_region = "us-east-1"
environment = "test"

# EC2 Configuration  
instance_type = "t3.small"
root_volume_size = 30

# SSH Configuration
ssh_cidr_block = "${user_ip}/32"
public_key = "${public_key}"

# Domain Configuration
domain_name = "www.251solutions.com"

# SECURE CREDENTIALS - Auto-generated
mysql_root_password = "${mysql_password}"
jwt_secret_key = "${jwt_secret}"

# Microsoft Graph OAuth2 (Your provided values)
microsoft_graph_client_id = "8e1e8dd6-e1df-48a9-9ffd-499aa6b04130"
microsoft_graph_tenant_id = "d7e8b101-46f9-4942-8442-45e0903b9467"
microsoft_graph_client_secret = "REPLACE_WITH_YOUR_CLIENT_SECRET"

# Stripe Configuration (update with your actual keys)
stripe_secret_key = "sk_test_your_stripe_secret_key_here"

# Email Configuration
app_email_from = "noreply@251solutions.com"
EOF

    # Secure the file
    chmod 600 terraform.tfvars
    
    print_info "Secure credentials generated:"
    echo "🔐 MySQL Password: ${mysql_password}"
    echo "🔑 JWT Secret: ${jwt_secret:0:20}..."
    echo ""
    print_warning "IMPORTANT: Save these credentials securely!"
    print_warning "File created: terraform.tfvars (permissions: 600)"
}

# Function to show security recommendations
show_security_recommendations() {
    echo ""
    echo "=================================================="
    echo "🔐 SECURITY RECOMMENDATIONS"
    echo "=================================================="
    echo ""
    echo "✅ IMPLEMENTED AUTOMATICALLY:"
    echo "  • Generated strong MySQL password (24+ chars)"
    echo "  • Generated secure JWT secret (128 chars)"
    echo "  • MySQL only accessible from localhost"
    echo "  • Backend only accessible via Nginx proxy"
    echo "  • Security groups restrict network access"
    echo "  • Environment files have restricted permissions"
    echo ""
    echo "🔧 MANUAL SECURITY STEPS:"
    echo "  1. Update Stripe secret key with your actual key"
    echo "  2. Change SSH CIDR to your specific IP"
    echo "  3. Enable AWS CloudTrail for audit logging"
    echo "  4. Consider using AWS Secrets Manager for production"
    echo "  5. Set up regular database backups"
    echo "  6. Monitor access logs regularly"
    echo ""
    echo "📋 CREDENTIALS STORAGE:"
    echo "  • terraform.tfvars - Contains all secrets (chmod 600)"
    echo "  • Never commit terraform.tfvars to git"
    echo "  • Use different passwords for production"
    echo ""
    echo "🚨 PRODUCTION RECOMMENDATIONS:"
    echo "  • Use AWS RDS instead of EC2 MySQL"
    echo "  • Implement AWS Secrets Manager"
    echo "  • Enable database encryption at rest"
    echo "  • Set up SSL/TLS for database connections"
    echo "  • Use IAM roles for AWS service access"
    echo ""
}

# Function to validate existing terraform.tfvars
validate_tfvars() {
    if [ ! -f "terraform.tfvars" ]; then
        print_error "terraform.tfvars not found"
        return 1
    fi
    
    print_info "Validating terraform.tfvars security..."
    
    # Check file permissions
    local perms=$(stat -f "%Lp" terraform.tfvars 2>/dev/null || stat -c "%a" terraform.tfvars)
    if [ "$perms" != "600" ]; then
        print_warning "terraform.tfvars has insecure permissions: $perms"
        print_info "Fixing permissions..."
        chmod 600 terraform.tfvars
    fi
    
    # Check password strength
    local mysql_pass=$(grep "mysql_root_password" terraform.tfvars | cut -d'"' -f2)
    if [ ${#mysql_pass} -lt 12 ]; then
        print_warning "MySQL password is too short (< 12 characters)"
    fi
    
    # Check JWT secret length
    local jwt_secret=$(grep "jwt_secret_key" terraform.tfvars | cut -d'"' -f2)
    if [ ${#jwt_secret} -lt 64 ]; then
        print_warning "JWT secret is too short (< 64 characters)"
    fi
    
    print_info "Validation completed"
}

# Function to backup credentials
backup_credentials() {
    if [ -f "terraform.tfvars" ]; then
        local backup_file="terraform.tfvars.backup.$(date +%Y%m%d_%H%M%S)"
        cp terraform.tfvars "$backup_file"
        chmod 600 "$backup_file"
        print_info "Credentials backed up to: $backup_file"
    fi
}

# Main function
main() {
    local command="${1:-help}"
    
    echo "=================================================="
    echo "🔐 BookMyHotel Security & Password Manager"
    echo "=================================================="
    echo ""
    
    case "$command" in
        "generate")
            local public_key="$2"
            local user_ip="${3:-$(curl -s ifconfig.me 2>/dev/null || echo "0.0.0.0")}"
            
            if [ -z "$public_key" ]; then
                print_error "Public key required. Usage: $0 generate 'ssh-rsa AAAA...'"
                exit 1
            fi
            
            backup_credentials
            create_secure_tfvars "$public_key" "$user_ip"
            show_security_recommendations
            ;;
        "validate")
            validate_tfvars
            ;;
        "backup")
            backup_credentials
            ;;
        "recommendations")
            show_security_recommendations
            ;;
        *)
            echo "Usage: $0 [COMMAND]"
            echo ""
            echo "Commands:"
            echo "  generate <public_key> [ip]  Generate secure terraform.tfvars"
            echo "  validate                    Validate existing terraform.tfvars"
            echo "  backup                      Backup current credentials"
            echo "  recommendations             Show security recommendations"
            echo ""
            echo "Examples:"
            echo "  $0 generate 'ssh-rsa AAAA...' '192.168.1.100'"
            echo "  $0 validate"
            echo "  $0 backup"
            ;;
    esac
}

# Run main function
main "$@"
