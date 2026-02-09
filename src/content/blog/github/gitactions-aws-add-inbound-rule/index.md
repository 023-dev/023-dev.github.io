---
title: "AWS Security Group의 Inbound Rule에 GitHub Actions의 Public IP 추가하기"
date: 2025-03-21 02:00:00
tags:
  - DevOps
---

보통 안전을 위해 AWS에서 배포 중인 인스턴스의 인바운드 규칙에서 SSH에 대한 접근 허용을 개인 아이피에 대해 설정할 것이다.
이렇게 하면 CI/CD로 사용 중인 GitHub Actions이 연결도 당연히 차단될 것이다.
GitHub Actions의 Public IP는 유동적이기 때문에 인바운드 규칙에 추가하는 방식을 고민할 것이다.

[Metadata syntax for GitHub Actions](https://api.github.com/meta)

물론 위에서 GibHub Actions의 Public IP의 범위를 공개해주기에 그렇게만 추가하는 방식도 있다.
하지만 이 방법은 위험하고, 너무 많은 IP를 추가하고 관리해야 하기 떄문에 비효율적이다.
그래서 매번 변경될 때마다 인바운드 규칙을 수정해야 한다고 생각했다.

찾아보니 이미 GitHub Actions에서 제공하는 액션이 존재했다.
이 글에서는 이러한 액션을 활용해 GitHub Actions에서 Security Group에 Inbound Rule 추가하는 방법을 설명하겠다.

## GitHub Actions에서 할당받은 Public IP 확인하기

먼저, `haythem/public-ip@v1.2` 액션을 사용하여 GitHub Actions에서 할당받은 Public IP를 확인하고 변수 선언 및 할당을 해준다.

```yaml
- name: Get GitHub Actions Public IP
  id: ip
  uses: haythem/public-ip@v1.2
```

## GitHub Actions에서 AWS 연결하기

이제 아이피를 얻었으니 인바운드 규칙을 추가해야 한다.
추가하기 전에 먼저 `aws-actions/configure-aws-credentials@v1` AWS에 연결해야 한다.

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}
```

## Security Group에 Inbound Rule 추가하기

이제 AWS에 연결했으니, `mnavarrocarter/aws-security-group-inbound-rule-action@v1.0.0` 액션을 사용하여 Security Group에 Inbound Rule을 추가하면 된다.

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

## Security Group에 추가한 Inbound Rule 삭제하기

이제 인바운드 규칙을 추가했으니, 배포가 끝나면 안전상 삭제해야 한다.

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

[About YAML syntax for GitHub Actions](https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions)

[appleboy, SSH for GitHub Actions](https://github.com/marketplace/actions/ssh-remote-commands)

[mnavarrocarter, AWS Security Group Inbound Rule Action](https://github.com/marketplace/actions/aws-security-group-inbound-rule-action)

[chaudharykiran, dial tcp ***:22: i/o timeout](https://github.com/appleboy/ssh-action/issues/78)

[stack overflow, How can I find the right inbound rule for my Github action to deploy on my AWS EC2 server?](https://stackoverflow.com/questions/63642807/how-can-i-find-the-right-inbound-rule-for-my-github-action-to-deploy-on-my-aws-e)