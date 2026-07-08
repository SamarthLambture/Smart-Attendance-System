terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 6.52.0"
        }
        http = {
            source  = "hashicorp/http"
            version = "~> 3.0"
        }
    }
    backend "s3" {
        bucket = "attendo-s3-bucket"
        key    = "terraform.tfstate"
        region = "ap-south-2"
	use_lockfile = true
        encrypt      = true
    }
}

provider "aws" {
    region = "ap-south-2"
}
