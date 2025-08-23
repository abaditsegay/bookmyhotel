#!/bin/bash

# BookMyHotel AWS Deployment Script
# This script helps deploy BookMyHotel to AWS using Terraform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Terraform
    if ! command_exists terraform; then
        print_error "Terraform not found. Please install Terraform first."
        echo "Visit: https://terraform.io/downloads"
        exit 1
    fi
    
    # Check AWS CLI
    if ! command_exists aws; then
        print_warning "AWS CLI not found. Install it for easier AWS management."
        echo "Visit: https://aws.amazon.com/cli/"
    fi
    
    print_success "Prerequisites check completed"
}

# Function to setup SSH key
setup_ssh_key() {
    local key_path="$HOME/.ssh/bookmyhotel_key"
    
    if [ ! -f "$key_path" ]; then
        print_info "Generating SSH key pair for BookMyHotel..."
        ssh-keygen -t rsa -b 4096 -f "$key_path" -N ""
        print_success "SSH key generated: $key_path"
    else
        print_info "SSH key already exists: $key_path"
    fi
    
    # Get public key content
    local public_key_content=$(cat "${key_path}.pub")
    echo "$public_key_content"
}

# Function to create terraform.tfvars
create_tfvars() {
    local public_key="$1"
    
    if [ -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars already exists. Backing it up..."
        ./security.sh backup
    fi
    
    print_info "Creating secure terraform.tfvars configuration..."
    
    # Get user's IP address
    local user_ip=$(curl -s ifconfig.me 2>/dev/null || echo "0.0.0.0")
    
    # Use security script to generate secure credentials
    ./security.sh generate "$public_key" "$user_ip"
    
    print_success "Secure terraform.tfvars created with your IP: $user_ip"
    print_warning "Please review and update Stripe secret key in terraform.tfvars"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    print_info "Starting Terraform deployment..."
    
    # Initialize Terraform
    print_info "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    print_info "Planning deployment..."
    terraform plan -out=tfplan
    
    # Ask for confirmation
    echo ""
    print_warning "Review the plan above. Do you want to proceed with deployment?"
    read -p "Type 'yes' to continue: " confirm
    
    if [ "$confirm" = "yes" ]; then
        # Apply deployment
        print_info "Applying Terraform configuration..."
        terraform apply tfplan
        
        # Get outputs
        local elastic_ip=$(terraform output -raw instance_public_ip)
        local ssh_command=$(terraform output -raw ssh_command)
        
        print_success "Infrastructure deployed successfully!"
        echo ""
        echo "=================================================="
        echo "📋 DEPLOYMENT INFORMATION"
        echo "=================================================="
        echo "🌐 Public IP: $elastic_ip"
        echo "🔗 SSH Command: $ssh_command"
        echo "📱 App URL: https://www.251solutions.com/bookmyhotel"
        echo "🔌 API URL: https://www.251solutions.com/bookmyhotel/api"
        echo "=================================================="
        echo ""
        
        print_info "Next steps:"
        echo "1. Configure DNS: Point www.251solutions.com to $elastic_ip"
        echo "2. Wait for DNS propagation (5-15 minutes)"
        echo "3. SSH into server and run: sudo /opt/bookmyhotel/setup-ssl.sh"
        echo "4. Check application status: sudo /opt/bookmyhotel/status-check.sh"
        
    else
        print_info "Deployment cancelled"
        rm -f tfplan
    fi
}

# Function to show status
show_status() {
    print_info "Getting deployment status..."
    
    if [ ! -f "terraform.tfstate" ]; then
        print_error "No Terraform state found. Have you deployed yet?"
        exit 1
    fi
    
    local elastic_ip=$(terraform output -raw instance_public_ip 2>/dev/null || echo "N/A")
    local ssh_command=$(terraform output -raw ssh_command 2>/dev/null || echo "N/A")
    
    echo "=================================================="
    echo "📊 CURRENT DEPLOYMENT STATUS"
    echo "=================================================="
    echo "🌐 Public IP: $elastic_ip"
    echo "🔗 SSH Command: $ssh_command"
    echo "📱 App URL: https://www.251solutions.com/bookmyhotel"
    echo "🔌 API URL: https://www.251solutions.com/bookmyhotel/api"
    echo "=================================================="
    
    if [ "$elastic_ip" != "N/A" ]; then
        print_info "Testing server connectivity..."
        if ping -c 1 "$elastic_ip" >/dev/null 2>&1; then
            print_success "Server is reachable"
        else
            print_warning "Server is not responding to ping"
        fi
    fi
}

# Function to destroy infrastructure
destroy_infrastructure() {
    print_warning "This will destroy ALL AWS resources created by Terraform!"
    print_warning "This action cannot be undone!"
    echo ""
    read -p "Type 'destroy' to confirm: " confirm
    
    if [ "$confirm" = "destroy" ]; then
        print_info "Destroying infrastructure..."
        terraform destroy -auto-approve
        print_success "Infrastructure destroyed"
    else
        print_info "Destruction cancelled"
    fi
}

# Function to show help
show_help() {
    echo "BookMyHotel AWS Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy infrastructure to AWS"
    echo "  status    Show current deployment status"
    echo "  security  Show security recommendations and validate config"
    echo "  destroy   Destroy all AWS resources"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy     # Deploy BookMyHotel to AWS"
    echo "  $0 status     # Check deployment status"
    echo "  $0 security   # Review security configuration"
    echo "  $0 destroy    # Remove all AWS resources"
}

# Main script logic
main() {
    local command="${1:-help}"
    
    echo "=================================================="
    echo "🏨 BookMyHotel AWS Deployment Script"
    echo "=================================================="
    echo ""
    
    case "$command" in
        "deploy")
            check_prerequisites
            local public_key=$(setup_ssh_key)
            create_tfvars "$public_key"
            deploy_infrastructure
            ;;
        "status")
            show_status
            ;;
        "security")
            print_info "Running security validation and recommendations..."
            ./security.sh validate
            ./security.sh recommendations
            ;;
        "destroy")
            destroy_infrastructure
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"
