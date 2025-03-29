---
title: "GitHub Actions에서 SSH로 Private 인스턴스에 접근하기"
date: 2025-03-20 02:00:00
tags:
  - Git
  - GitHub
  - SSH
  - AWS
---

진행하고 있는 프로젝트에서 보안 이슈가 빈번히 발생했고, 이를 해결하기 위한 방안 중 하나로 인스턴스들을 Private으로 숨길 필요성이 생겼다.
그래서 모든 인스턴스들을 Private으로 변경하고, SSH 접근을 하기 위해 Bastion Host를 구축했다.

구축하고자 하는 파이프라인 구조는 GitHub Actions + AWS ECR + Bastion 서버 + EC2를 활용한 구조이다.
이 글에서는 이러한 파이프라인을 통해 GitHub Actions에서 SSH로 Private 인스턴스에 배포하는 방법을 설명하겠다.

## 참고

[mnavarrocarter, AWS Security Group Inbound Rule Action](https://github.com/marketplace/actions/aws-security-group-inbound-rule-action)

[API GiHub meta](https://api.github.com/meta)

[stack overflow, How can I find the right inbound rule for my Github action to deploy on my AWS EC2 server?](https://stackoverflow.com/questions/63642807/how-can-i-find-the-right-inbound-rule-for-my-github-action-to-deploy-on-my-aws-e)