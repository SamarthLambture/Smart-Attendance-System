output "bastion_host_public_ip" {
  value = aws_instance.bastion_host.public_ip
  description = "Public IP address of the bastion host"
}

output "vpc_id" {
  value = module.vpc.vpc_id
  description = "ID of the VPC"
}

output "cluster_name" {
  value = module.eks.cluster_name
  description = "Name of the EKS cluster"
}
