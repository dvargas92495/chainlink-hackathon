terraform {
    backend "remote" {
        hostname = "app.terraform.io"
        organization = "VargasArts"
        workspaces {
            prefix = "wings"
        }
    }
}

variable "secret" {
    type = string
}

variable "rds_password" {
    type = string
}

provider "aws" {
    region = "us-east-1"
}

module "aws-static-site" {
    source  = "dvargas92495/static-site/aws"
    version = "1.0.0"

    domain = "wings.davidvargas.me"
    secret = var.secret
    tags = {
        Application = "Wings"
    }
}

provider "github" {
    owner = "dvargas92495"
}

resource "github_actions_secret" "deploy_aws_access_key" {
  repository       = "wings"
  secret_name      = "DEPLOY_AWS_ACCESS_KEY_ID"
  plaintext_value  = module.aws-static-site.deploy-id
}

resource "github_actions_secret" "deploy_aws_access_secret" {
  repository       = "wings"
  secret_name      = "DEPLOY_AWS_SECRET_ACCESS_KEY"
  plaintext_value  = module.aws-static-site.deploy-secret
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "image-id"
    values = ["ami-085925f297f89fce1"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"]
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.medium"
  key_name = "Wings-Chainlink-Node"

  tags = {
    Application = "Wings"
  }
}

resource "aws_db_instance" "psql" {
  allocated_storage            = 20
  max_allocated_storage        = 1000
  storage_type                 = "gp2"
  engine                       = "postgres"
  engine_version               = "11.5"
  identifier                   = "wings"
  instance_class               = "db.t3.micro"
  name                         = "wings-chainlink-node"
  username                     = "wings"
  password                     = var.rds_password
  parameter_group_name         = "default.postgres11"
  port                         = 5432
  publicly_accessible          = true
  skip_final_snapshot          = true
  storage_encrypted            = true
  deletion_protection          = true
  performance_insights_enabled = true
  tags                         = {
    Application = "Wings"
  }
}
