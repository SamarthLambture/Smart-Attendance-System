resource "aws_s3_bucket" "terraform_state" {
  bucket = "attendo-s3-bucket"

  tags = {
    Name        = "attendo-s3-bucket"
    Environment = "dev"
  }
}
