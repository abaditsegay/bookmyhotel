# Outputs for BookMyHotel AWS Infrastructure

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.web_server.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.web_server.public_dns
}

output "elastic_ip" {
  description = "Elastic IP address"
  value       = aws_eip.web_server.public_ip
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.web_server.public_ip}"
}

output "application_url" {
  description = "URL to access the application"
  value       = "https://${var.domain_name}/bookmyhotel"
}

output "api_base_url" {
  description = "Base URL for API access through Nginx proxy"
  value       = "https://${var.domain_name}/bookmyhotel/api"
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.web_server.id
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.web_server.id
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.bookmyhotel.name
}

output "deployment_info" {
  description = "Important deployment information"
  value = {
    instance_ip    = aws_eip.web_server.public_ip
    domain         = var.domain_name
    app_path       = "/bookmyhotel"
    api_path       = "/bookmyhotel/api"
    mysql_port     = "3306 (internal only)"
    backend_port   = "8080 (internal only)"
    frontend_port  = "3000 (internal only)"
    public_ports   = "80, 443"
  }
}
