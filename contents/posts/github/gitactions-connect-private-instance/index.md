---
title: "GitHub Actions에서 SSH로 Private 인스턴스에 접근하기"
date: 2025-03-20 02:00:00
tags:
  - DevOps
---

진행하고 있는 프로젝트에서 보안 이슈가 빈번히 발생했고, 이를 해결하기 위한 방안 중 하나로 인스턴스들을 Private Subnet으로 숨길 필요성이 생겼다.
그래서 모든 인스턴스들을 Private으로 변경하고, SSH 접근을 하기 위해 Bastion Host를 구축했다.
이에 따른 CI/CD 파이프라인도 수정이 필요했다.
이 글에서는 이러한 파이프라인을 통해 GitHub Actions에서 SSH로 Private 인스턴스에 배포하는 방법을 설명하겠다.

## 

```yaml
- name: Deploy to EC2
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.EC2_HOST_DEV }}
    username: ${{ secrets.EC2_USER }}
    key: ${{ secrets.EC2_PRIVATE_KEY }}
    proxy_host: ${{ secrets.PROXY_HOST }}
    proxy_username: ${{ secrets.PROXY_USERNAME }}
    proxy_key: ${{ secrets.EC2_PRIVATE_KEY }}
```

## 참고

[appleboy, SSL Action](https://github.com/appleboy/ssh-action)
