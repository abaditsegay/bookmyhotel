# Terraform outputs for AWS Lightsail deployment

output "s3_bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_bucket_website_endpoint" {
  description = "Website endpoint for S3 bucket"
  value       = aws_s3_bucket.frontend.website_endpoint
}

output "s3_bucket_website_domain" {
  description = "Website domain for S3 bucket"
  value       = aws_s3_bucket.frontend.website_domain
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  value       = aws_cloudfront_distribution.frontend.hosted_zone_id
}

output "frontend_url" {
  description = "Frontend URL (CloudFront or custom domain)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "deployment_summary" {
  description = "Summary of deployment URLs and next steps"
  value = {
    frontend_cdn_url     = "https://${aws_cloudfront_distribution.frontend.domain_name}"
    s3_bucket_name      = aws_s3_bucket.frontend.bucket
    cloudfront_dist_id  = aws_cloudfront_distribution.frontend.id
    lightsail_backend_ip = var.lightsail_backend_ip
    next_steps = [
      "1. Run the setup script on your Lightsail instance",
      "2. Deploy backend using deploy-backend.sh script",
      "3. Deploy frontend using deploy-frontend.sh script",
      "4. Update CORS settings with CloudFront URL",
      "5. Configure custom domain (optional)"
    ]
  }
}
