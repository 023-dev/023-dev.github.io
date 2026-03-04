---
visible: true
title: "GitHub Actions에서 Private 인스턴스로 점프하기"
date: 2025-03-20 02:00:00
tags: ["Engineering", "DevOps"]
---

진행하고 있는 프로젝트에서 보안 이슈가 빈번히 발생했고, 이를 해결하기 위한 방안 중 하나로 인스턴스들을 Private Subnet으로 숨길 필요성이 생겼다.
그래서 모든 인스턴스들을 Private Instance로 변경하고, SSH 접근을 위해 Bastion Host를 구축했다.
이에 따라 기존 CI/CD 파이프라인에서도 접속 방식에 대한 수정이 필요했다.

이 글에서는 GitHub Actions에서 Bastion Host를 Proxy로 활용해 Private 인스턴스에 배포하는 방법을 단계별로 설명하겠다.

## GitHub Actions의 IP 허용 문제

보통 보안을 위해 AWS 인스턴스의 보안 그룹 인바운드 규칙에서 SSH 접근을 개인 IP로만 제한한다.
이렇게 설정하면 CI/CD에 사용 중인 GitHub Actions의 연결도 당연히 차단된다.
GitHub Actions에서 할당받는 Public IP는 매 실행마다 유동적이기 때문에, 고정된 IP를 인바운드 규칙에 추가하는 방식은 사용할 수 없다.

[GitHub Actions에서 사용하는 IP 범위](https://api.github.com/meta)

물론 위 링크에서 GitHub Actions의 Public IP 범위를 공개하고 있기 때문에, 이를 일괄 추가하는 방법도 있다.
하지만 허용할 IP 범위가 너무 많아 관리가 비효율적이고, 보안상으로도 권장되지 않는다.
그래서 실행 시마다 현재 IP만 동적으로 추가하고, 배포가 끝나면 곧바로 삭제하는 방식을 선택했다.

먼저, `haythem/public-ip@v1.2` 액션을 사용하여 GitHub Actions에서 할당받은 Public IP를 확인하고 변수로 할당한다.

```yaml
- name: Get GitHub Actions Public IP
  id: ip
  uses: haythem/public-ip@v1.2
```

이제 IP를 얻었으니 인바운드 규칙을 추가해야 한다.
추가하기 전에 먼저 `aws-actions/configure-aws-credentials@v1`을 사용해 AWS에 연결해야 한다.

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}
```

AWS에 연결했으니, `mnavarrocarter/aws-security-group-inbound-rule-action@v1.0.0` 액션을 사용하여 Security Group에 Inbound Rule을 추가한다.

- `SECURITY_GROUP_ID` : 설정할 Security Group의 ID
- `SSH_PROTOCOL` : SSH 프로토콜
- `SSH_PORT` : SSH 포트

```yaml
 - name: Add GitHub Actions IP to Security Group
   run: |
      aws ec2 authorize-security-group-ingress \
        --group-id ${{ secrets.SECURITY_GROUP_ID }} \
        --protocol ${{ secrets.SSH_PROTOCOL }} \
        --port ${{ secrets.SSH_PORT }} \
        --cidr ${{ steps.ip.outputs.ipv4 }}/32
```

## ECR에서 컨테이너 당기기

다음으로 AWS ECR에 빌드된 이미지를 올리기 위해 인증 과정을 거쳐야 한다.

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

인증이 완료되면 이미지를 빌드하고 ECR에 푸시한다.
빌드 방법은 AWS ECR 콘솔의 도움말을 참고하면 된다.

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

## 점프 호스트를 통한 배포

이제 이 글의 핵심인 Private Instance에 배포 과정이다.
현재 사용하는 파이프라인 구조는 다음과 같다.

```yaml
+--------+       +----------+      +--------+
| Client | <-->  | Jumphost | <--> | Server |
+--------+       +----------+      +--------+
```

배포는 EC2 배포 시 자주 사용되는 `appleboy/ssh-action`을 활용한다.
기존 설정과의 차이점은 `proxy` 설정 블록인데, 여기에 Jump Host인 Bastion Host의 접속 정보를 입력하면 된다.
이렇게 하면 GitHub Actions이 Bastion Host를 경유해 Private Instance에 SSH로 접근하여 스크립트를 실행하게 된다.
다른 부분은 기존 ssh-action과 동일하게 하면 된다.

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

## 뒷정리하기

배포가 끝나면 보안을 위해 추가했던 인바운드 규칙을 반드시 삭제해야 한다.
`if: always()`를 사용해 배포 성공 여부와 관계없이 항상 실행되도록 설정한다.

```yaml
- name: Remove GitHub Actions IP from Security Group
  if: always()
  run: |
    aws ec2 revoke-security-group-ingress \
      --group-id ${{ secrets.SECURITY_GROUP_ID }} \
      --protocol ${{ secrets.SSH_PROTOCOL }} \
      --port ${{ secrets.SSH_PORT }} \
      --cidr ${{ steps.ip.outputs.ipv4 }}/32
```

## 참고

[appleboy, SSL Action](https://github.com/appleboy/ssh-action)

[About YAML syntax for GitHub Actions](https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions)

[appleboy, SSH for GitHub Actions](https://github.com/marketplace/actions/ssh-remote-commands)

[mnavarrocarter, AWS Security Group Inbound Rule Action](https://github.com/marketplace/actions/aws-security-group-inbound-rule-action)

[chaudharykiran, dial tcp ***:22: i/o timeout](https://github.com/appleboy/ssh-action/issues/78)

[stack overflow, How can I find the right inbound rule for my Github action to deploy on my AWS EC2 server?](https://stackoverflow.com/questions/63642807/how-can-i-find-the-right-inbound-rule-for-my-github-action-to-deploy-on-my-aws-e)