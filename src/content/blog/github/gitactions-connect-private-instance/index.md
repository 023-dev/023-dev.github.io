---
visible: false
title: "GitHub Actions에서 SSH로 Private 인스턴스에 접근하기"
date: 2025-03-20 02:00:00
tags:
  - DevOps
---

진행하고 있는 프로젝트에서 보안 이슈가 빈번히 발생했고, 이를 해결하기 위한 방안 중 하나로 인스턴스들을 Private Subnet으로 숨길 필요성이 생겼다.
그래서 모든 인스턴스들을 Private Instance로 변경하고, SSH 접근을 하기 위해 Bastion Host를 구축했다.
이에 따라 CI/CD 파이프라인에서 접속 방법에 대한 수정이 필요했다.
이 글에서는 GitHub Actions에서 SSH로 Proxy Host를 통해 Private 인스턴스에 배포하는 방법을 설명하겠다.

## Login to AWS ECR

먼저 AWS ECR에 빌드된 이미지를 올리기 위해 인증과정을 거쳐야 한다.
스크립트는 다음과 같이 만들 수 있을 것 같다.

```yaml
 - name: Login to AWS ECR
  env:
    AWS_REGION: "${{ secrets.AWS_REGION }}"
    AWS_ACCOUNT_ID: "${{ secrets.AWS_ACCOUNT_ID }}"
    AWS_ACCESS_KEY_ID: "${{ secrets.AWS_ACCESS_KEY_ID }}"
    AWS_SECRET_ACCESS_KEY: "${{ secrets.AWS_SECRET_ACCESS_KEY }}"
  run: |
    aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

## Build and Push Docker Image to AWS ECR

이제 AWS ECR에 접근해서 다음과 같은 스크립트를 작성하면 된다.
이 부분은 AWS ECR 페이지에 배포 방법에 대해 도움말이 있으니 참고하면 된다.

```yaml
- name: Build & Push Docker Image to AWS ECR
  env:
    AWS_REGION: "${{ secrets.AWS_REGION }}"
    AWS_ACCOUNT_ID: "${{ secrets.AWS_ACCOUNT_ID }}"
    ECR_REPO_NAME: "${{ secrets.AWS_ECR_REPO_NAME }}"
  run: |
    IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest"
    docker build -t $IMAGE_URI .
    docker push $IMAGE_URI
```

## Deploy to EC2

이제 이번 글의 핵심 이슈인 Private Instance에 배포 과정을 진행해야 한다.
현재 사용하는 파이프라인 구조는 다음과 같을 것이다.

```yaml
+--------+       +----------+      +-----------+
| Laptop | <-->  | Jumphost | <--> | FooServer |
+--------+       +----------+      +-----------+
```

접속은 다음처럼 하면 되는데 보통 EC2에 배포할 때 사용하는 appleboy님의 ssh-action을 사용하면 된다.
차이점은 proxy config 부분인데 현재 Jump Host인 Bastion Host의 정보를 넣으면 된다.
다른 부분은 기존 ssh-action과 동일하게 하면 된다.
이렇게 하면 Jump Host를 통해 Private Host로 접근하여 script를 수행하게 될 것이다.
자세한 내용은 참고 링크를 확인하면 되겠다.

```yaml
- name: Deploy to EC2
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.EC2_HOST }}
    username: ${{ secrets.EC2_USERNAME }}
    key: ${{ secrets.EC2_PRIVATE_KEY }}
    proxy_host: ${{ secrets.PROXY_HOST }}
    proxy_username: ${{ secrets.PROXY_USERNAME }}
    proxy_key: ${{ secrets.PROXY_KEY }}
    script: |
#      scripts...
```

## 참고

[appleboy, SSL Action](https://github.com/appleboy/ssh-action)
