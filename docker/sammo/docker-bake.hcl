variable "REGISTRY" {
  default = "ghcr.io"
}

variable "IMAGE_NAME" {
  default = "peppone-choi/open-samguk"
}

variable "TAG" {
  default = "latest"
}

group "default" {
  targets = ["api", "engine", "web", "setup"]
}

target "api" {
  context = "."
  dockerfile = "docker/sammo/Dockerfile"
  target = "api"
  tags = ["${REGISTRY}/${IMAGE_NAME}/api:${TAG}"]
}

target "engine" {
  context = "."
  dockerfile = "docker/sammo/Dockerfile"
  target = "engine"
  tags = ["${REGISTRY}/${IMAGE_NAME}/engine:${TAG}"]
}

target "web" {
  context = "."
  dockerfile = "docker/sammo/Dockerfile"
  target = "web"
  tags = ["${REGISTRY}/${IMAGE_NAME}/web:${TAG}"]
}

target "setup" {
  context = "."
  dockerfile = "docker/sammo/Dockerfile"
  target = "setup"
  tags = ["${REGISTRY}/${IMAGE_NAME}/setup:${TAG}"]
}
