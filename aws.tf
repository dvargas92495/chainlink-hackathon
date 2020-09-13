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
