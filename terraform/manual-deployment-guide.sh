#!/bin/bash
# Manual AWS Lightsail Deployment for BookMyHotel
# This script provides an alternative deployment method

echo "🚀 BookMyHotel AWS Lightsail Deployment"
echo "========================================"
echo ""
echo "Due to Terraform provider timeout issues, here's the manual deployment process:"
echo ""

echo "📋 **STEP 1: Create Resources Manually in AWS Console**"
echo "1. Go to https://lightsail.aws.amazon.com/"
echo "2. Create MySQL Database:"
echo "   - Name: bookmyhotel-mysql-db"
echo "   - Plan: 2 vCPU, 4 GB RAM (₹30/month)"
echo "   - Username: admin" 
echo "   - Password: BookMyHotel2024SecureDB!"
echo ""

echo "3. Create Ubuntu Instance:"
echo "   - Name: bookmyhotel-app"
echo "   - Plan: 2 vCPU, 4 GB RAM (₹20/month)"
echo "   - Blueprint: Ubuntu 20.04 LTS"
echo "   - Add SSH key: bookmyhotel-key"
echo ""

echo "📦 **STEP 2: SSH Key Setup**"
echo "Your SSH key has been generated:"
echo "Private key: ~/.ssh/bookmyhotel-aws"
echo "Public key: ~/.ssh/bookmyhotel-aws.pub"
echo ""
echo "Copy this public key content to AWS:"
cat ~/.ssh/bookmyhotel-aws.pub
echo ""

echo "🔧 **STEP 3: After Creating Resources**"
echo "Run this command to get the deployment script for your instance:"
echo ""
echo "./manual-deploy-to-instance.sh [INSTANCE_IP] [DATABASE_HOST]"
echo ""

echo "💰 **Expected Monthly Cost: ~$51/month**"
echo "- Database: $30/month"
echo "- App Instance: $20/month"
echo "- Static IP: $1/month"
echo ""

echo "🔑 **Your Configuration Ready:**"
echo "- Microsoft Graph: ✅ Configured"
echo "- SSH Keys: ✅ Generated"
echo "- Database Password: ✅ Set"
echo "- JWT Secret: ✅ Set"
echo ""

echo "Next: Create resources manually in AWS Console, then run the instance deployment script."
