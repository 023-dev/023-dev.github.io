---
title: "?"
date: 2025-03-04 23:00:00
tags: 
  - Server
  - AWS
---

저번에 서버에 대한 악성 공격으로 인한 대응 처리를 했다.
하지만 다른 요인에 대해서도 대응이 필요하다고 생각했다.
실제로 OOM(Out Of Memory) 이슈로 인해 서버가 다운되었던 경험이 있었기 때문이다.
타이밍이 좋게 최근에 팀내에 슬랙 도입에 대한 건의를 올렸고, 덕분에 슬랙을 사용하게 되었다.
예전에 슬랙 웹훅을 통해 서버에 대한 상태를 체크하고 알림을 받았던 경험이 있어서 이번에도 슬랙을 통해 알림을 받기로 했다.

이 글에서는 이러한 알림 서비스를 만들어서 서버에 대한 상태를 체크하는 방법에 대해 기록하고자 한다.

## 어떤 알림이 필요한가?



## 그래서 어떻게 만들었나?

### 슬랙 웹훅 생성

### 스크립트 작성

### 크론탭 설정


## 참고

- [Reddit, This is how we are using fail2ban notifications and Slack](https://www.reddit.com/r/linuxadmin/comments/3xslx0/this_is_how_we_are_using_fail2ban_notifications/)
- [Nihisil, Send notifications to the Slack from fail2ban](https://gist.github.com/Nihisil/29fd2971c9dd109ae245)
- [Cole Turner, fail2ban-slack-action](https://github.com/coleturner/fail2ban-slack-action)