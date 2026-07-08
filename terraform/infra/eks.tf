resource "aws_security_group" "eks-additional-sg" {
    name = "eks-additional-sg"
    vpc_id = module.vpc.vpc_id
    ingress {
        description = "HTTPS from bastion host"
        from_port = 443
        to_port = 443
        protocol = "tcp"
        security_groups = [aws_security_group.bastion_sg.id]
    }
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
    tags = {
        Name = "eks-additional-sg"
    }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = "attendo-eks"
  kubernetes_version = "1.33"

  addons = {
    coredns                = {}
    eks-pod-identity-agent = {
      before_compute = true
    }
    kube-proxy             = {}
    vpc-cni                = {
      before_compute = true
    }
  }

  # Optional
  endpoint_public_access = false

  # Optional: Adds the current caller identity as an administrator via cluster access entry
  enable_cluster_creator_admin_permissions = true

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  additional_security_group_ids = [aws_security_group.eks-additional-sg.id]

  # EKS Managed Node Group(s)
  eks_managed_node_groups = {
    attendo-node-group = {
      # Starting on 1.30, AL2023 is the default AMI type for EKS managed node groups
      ami_type       = "AL2023_x86_64_STANDARD"
      instance_types = ["t3.medium"]

      min_size     = 2
      max_size     = 10
      desired_size = 2
    }
  }

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}
