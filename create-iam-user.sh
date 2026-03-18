#!/bin/bash

# Quick IAM User Creation Script
# Run this script locally if you have AWS CLI configured with admin permissions

echo "🔐 Creating IAM User for BookMyHotel S3 Integration"
echo "=================================================="

USER_NAME="bookmyhotel-s3-user"
POLICY_NAME="BookMyHotel-S3-Access"
BUCKET_NAME="bookmyhotel-images"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first or create the user manually via AWS Console."
    exit 1
fi

# Check if user already exists
if aws iam get-user --user-name $USER_NAME &> /dev/null; then
    echo "✅ User $USER_NAME already exists"
else
    echo "👤 Creating IAM user: $USER_NAME"
    aws iam create-user --user-name $USER_NAME
    if [ $? -eq 0 ]; then
        echo "✅ User created successfully"
    else
        echo "❌ Failed to create user"
        exit 1
    fi
fi

# Create the policy
echo "📋 Creating IAM policy: $POLICY_NAME"
cat > policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME",
                "arn:aws:s3:::$BUCKET_NAME/*"
            ]
        }
    ]
}
EOF

# Create or update the policy
POLICY_ARN="arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$POLICY_NAME"
if aws iam get-policy --policy-arn $POLICY_ARN &> /dev/null; then
    echo "✅ Policy $POLICY_NAME already exists"
else
    aws iam create-policy --policy-name $POLICY_NAME --policy-document file://policy.json
    if [ $? -eq 0 ]; then
        echo "✅ Policy created successfully"
    else
        echo "❌ Failed to create policy"
        exit 1
    fi
fi

# Attach policy to user
echo "🔗 Attaching policy to user"
aws iam attach-user-policy --user-name $USER_NAME --policy-arn $POLICY_ARN
if [ $? -eq 0 ]; then
    echo "✅ Policy attached successfully"
else
    echo "❌ Failed to attach policy"
fi

# Create access key
echo "🔑 Creating access key for user"
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name $USER_NAME)
if [ $? -eq 0 ]; then
    echo "✅ Access key created successfully"
    echo ""
    echo "📋 IMPORTANT: Save these credentials securely!"
    echo "=============================================="
    echo "Access Key ID: $(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')"
    echo "Secret Access Key: $(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Save these credentials in a secure location"
    echo "2. Use these credentials to run ./setup-aws-credentials.sh"
    echo "3. Update your S3 bucket policy with the correct user ARN"
else
    echo "❌ Failed to create access key"
fi

# Clean up
rm -f policy.json

echo ""
echo "✅ IAM user setup completed!"
echo "User ARN: arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):user/$USER_NAME"