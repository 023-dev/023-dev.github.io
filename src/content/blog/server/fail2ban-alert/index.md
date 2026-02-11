---
visible: false
title: "Fail2Ban의 상태를 Slack Webhhook 처리하기"
date: 2025-03-04 23:00:00
tags: 
  - Server
  - AWS
---

저번에 서버에 대한 악성 공격으로 인한 대응 처리를 했다.
Fail2Ban을 통해 악성 공격을 차단하는 방법을 사용했는데 사실 이게 잘 작동하는지 확인하려면 로그를 계속 확인해야 했다.
그래서 이번에는 Fail2Ban이 잘 동작하고 있는지, 그리고 서버에 대한 상태를 체크하고 알림을 받아 미리 대응할 수 있도록 해보려고 한다.
이 글에서는 이러한 알림 서비스를 만들어서 서버에 대한 상태를 체크하는 방법에 대해 기록하고 유사한 상황에 놓인 다른 개발자들에게 도움을 드리고자 정리한다.

## 슬랙 웹훅 생성

먼저 Slack에서 알림을 받을 채널을 생성한 후, Webhook URL을 발급받아야 한다.

1. Slack Webhook에서 Incoming Webhooks 추가
2. Webhook을 설정한 채널 선택 후, Webhook URL을 생성
3. 생성된 URL을 복사하여 사용한다. 

URL은 `https://hooks.slack.com/services/~` 이런 형식이다.

### 스크립트 작성

이제 알림을 받을 곳을 설정했으니, 알림을 보낼 스크립트를 작성해야 한다.
Fail2Ban이 특정 IP를 차단할 때 Slack으로 알림을 보내도록 설정하려면,
Fail2Ban의 action.d 디렉터리에 새로운 액션을 추가해야 한다.
경로는 `/etc/fail2ban/action.d/`이다.

```shell
[Definition]
# Option:  actionstart
# Notes.:  command executed once at the start of Fail2Ban.
# Values:  CMD
#
actionstart = curl -s -o /dev/null -X POST --data-urlencode "payload={\"text\": \"Fail2Ban (<name>) jail has started\", \"channel\": \"#<slack_channel>\" }" <slack_webhook_url>

# Option:  actionstop
# Notes.:  command executed once at the end of Fail2Ban
# Values:  CMD
#
actionstop = curl -s -o /dev/null -X POST --data-urlencode "payload={\"text\": \"Fail2Ban (<name>) jail has stopped\", \"channel\": \"#<slack_channel>\" }" <slack_webhook_url>

# Option:  actioncheck
# Notes.:  command executed once before each actionban command
# Values:  CMD
#
actioncheck =

# Option:  actionban
# Notes.:  command executed when banning an IP. Take care that the
#          command is executed with Fail2Ban user rights.
# Tags:    <ip>  IP address
#          <failures>  number of failures
#          <time>  unix timestamp of the ban time
# Values:  CMD
#
actionban = curl -s -o /dev/null -X POST --data-urlencode "payload={\"text\": \"Fail2Ban Alert(<name>)\n Banned IP: *<ip>*\n Failures: <failures> failure(s)\n Timestap: <time>\"}" <slack_webhook_url>

# Option:  actionunban
# Notes.:  command executed when unbanning an IP. Take care that the
#          command is executed with Fail2Ban user rights.
# Tags:    <ip>  IP address
#          <failures>  number of failures
#          <time>  unix timestamp of the ban time
# Values:  CMD
#
actionunban = curl -s -o /dev/null -X POST --data-urlencode "payload={\"text\": \"Fail2Ban Alert(<name>)\n Unbanned IP: *<ip>*\"}" <slack_webhook_url>

[Init]

init = 'Sending notification to Slack'

# Put the values here without quotation marks
# The channel name should be without the leading # too!
slack_webhook_url = "https://hooks.slack.com/services/~"
```

위 스크립트의 구성을 간단히 설명하면 다음과 같다. 

- `actionstart`: Fail2Ban이 시작될 때 알림을 보낸다.
- `actionstop`: Fail2Ban이 종료될 때 알림을 보낸다.
- `actionban`: IP가 차단될 때 알림을 보낸다.
- `actionunban`: IP가 차단 해제될 때 알림을 보낸다.
- `slack_webhook_url`: Slack Webhook URL을 설정한다.

이제 행위를 정의했으니, 이제 Fail2Ban 설정 파일에 이를 적용해야 한다.

## Fail2Ban 설정

Fail2Ban 설정 파일은 `/etc/fail2ban/jail.local`에 위치해 있다.
이 파일을 열어서 다음과 같이 설정을 추가한다.

```shell
[nginx-bad-request]
enabled = true
filter = nginx-bad-request
logpath = /var/log/nginx/access.log
maxretry = 10
findtime = 1m
bantime = 10m
action = slack-notify
```

위 설정을 간단히 설명하자면 다음과 같다.

- `enabled`: 해당 설정을 사용할지 여부를 나타낸다.
- `filter`: 사용할 필터를 지정한다.
- `logpath`: 필터링할 로그 파일을 지정한다.
- `maxretry`: 허용할 최대 실패 횟수를 의미한다.
- `findtime`: 실패 횟수를 체크할 시간을 의미한다.
- `bantime`: 차단 시간을 의미한다.
- `action`: 사용할 액션을 지정한다.
- `slack-notify`: 액션을 사용할 때 설정한 이름이다.

이렇게 설정을 했으면 이제 Fail2Ban을 재시작하면 된다.

```shell
sudo systemctl restart fail2ban
```

이제 Nginx에서 400, 403과 같은 비정상적인 요청을 감지하면 Slack으로 알림이 전송된다.

그리고 혹시 테스트를 해보고 싶으면 다음과 같이하면 된다.

```shell
sudo fail2ban-client set nginx-bad-request banip 1.2.3.4
```

위 명령어를 실행하면 해당 IP가 차단되고, Slack으로 알림이 전송될 것이다.

```shell
Fail2Ban Alert(nginx-bad-request)
Unbanned IP: 1.2.3.4
```

## 참고

- [Reddit, This is how we are using fail2ban notifications and Slack](https://www.reddit.com/r/linuxadmin/comments/3xslx0/this_is_how_we_are_using_fail2ban_notifications/)
- [Nihisil, Send notifications to the Slack from fail2ban](https://gist.github.com/Nihisil/29fd2971c9dd109ae245)
- [Cole Turner, fail2ban-slack-action](https://github.com/coleturner/fail2ban-slack-action)