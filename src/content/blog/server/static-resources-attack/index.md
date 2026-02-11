---
visible: false
title: "디렉토리 스캔 공격은 어떻게 대응해야 할까?"
date: 2025-02-28 23:00:00
tags: 
  - Server
  - Nginx
  - Fail2Ban
  - TroubleShooting
---

최근 개발 중인 서버에 무수히 많은 에러 로그와 트래픽이 발생하는 이슈가 발생했다.
이는 찾아보니 디렉토리 스캔 공격이었고,
이 글에서는 이러한 이슈를 어떻게 대응했는지에 대해 기록하고자 한다.
그리고 이를 통해 다른 개발자들이 비슷한 이슈에 대해 대응하는데 도움이 되길 바란다.

## 어떤 로그가 있었나?

CI/CD 파이프 라인을 구축하고 개발 서버 로그를 확인하던 중, 다음과 같은 로그를 발견했다.

```bash
193.41.206.72 - - [28/Feb/2025:11:59:01 +0000] "GET /.env HTTP/1.1" 301 178 "-" "-" "-""0.000"
193.41.206.72 - - [28/Feb/2025:11:59:02 +0000] "GET .env HTTP/1.1" 400 166 "-" "-" "-""0.249"
193.41.206.72 - - [28/Feb/2025:11:59:03 +0000] "GET /vendor/.env HTTP/1.1" 400 102 "-" "-" "-""0.008"
193.41.206.72 - - [28/Feb/2025:11:59:03 +0000] "GET /prod/.env.bak HTTP/1.1" 400 102 "-" "-" "-""0.011"
193.41.206.72 - - [28/Feb/2025:11:59:03 +0000] "GET /prod/config.env HTTP/1.1" 400 102 "-" "-" "-""0.006"
193.41.206.72 - - [28/Feb/2025:11:59:03 +0000] "GET /prod/.env.dist HTTP/1.1" 400 102 "-" "-" "-""0.004"
193.41.206.72 - - [28/Feb/2025:11:59:04 +0000] "GET /prod/.env.dev HTTP/1.1" 400 102 "-" "-" "-""0.006"
193.41.206.72 - - [28/Feb/2025:11:59:04 +0000] "GET /product/.env.bak HTTP/1.1" 400 102 "-" "-" "-""0.005"
193.41.206.72 - - [28/Feb/2025:11:59:04 +0000] "GET /product/config.env HTTP/1.1" 400 102 "-" "-" "-""0.011"
193.41.206.72 - - [28/Feb/2025:11:59:04 +0000] "GET /product/.env.dist HTTP/1.1" 400 102 "-" "-" "-""0.005"
193.41.206.72 - - [28/Feb/2025:11:59:05 +0000] "GET /product/.env.dev HTTP/1.1" 400 102 "-" "-" "-""0.006"
193.41.206.72 - - [28/Feb/2025:11:59:05 +0000] "GET /production/.env.bak HTTP/1.1" 400 102 "-" "-" "-""0.007"
193.41.206.72 - - [28/Feb/2025:11:59:05 +0000] "GET /production/config.env HTTP/1.1" 400 102 "-" "-" "-""0.008"
193.41.206.72 - - [28/Feb/2025:11:59:05 +0000] "GET /production/.env.dist HTTP/1.1" 400 102 "-" "-" "-""0.006"
```

현재 프로젝트와 전혀 무관한 정적 리소스 파일 경로였고, 비정상 적이게 많은 요청이 발생했다.
위에 로그는 5초 동안의 로그이며, 1분간 계속해서 이러한 로그가 발생했다.
특히, .env 같은 민감한 정보의 파일을 요청하는 로그가 많았다.
만약 해당 파일이 노출된다면, 데이터베이스 접속 정보나 API 키 등이 유출될 수 있어 보안에 치명적인 문제가 될 수 있다.
그래서 정황상 봇(bot)으로 자동화된 스캔 공격 시도로 판단하고, 이에 대한 대응을 진행하기로 했다.

## 그래서 어떻게 대응했나?

먼저 요청이 들어오는 입구를 도메인을 통한 요청으로만 중앙화하고,
중앙화된 요청을 필터링을 통하여 관리하기로 했다.
그래서 제일 먼저 AWS 보안 그룹 설정을 변경했다.
HTTPS 전환 전까지 사용했던 HTTP(80) 포트를 삭제하고, HTTPS(443)만 허용하도록 변경했다.
그리고 8080 포트를 VPC 내부에서만 접근 가능하도록 수정했고, 모든 트래픽 허용 규칙도 삭제했다.
이들은 모두 앞서 진행했던 인프라 작업 후 불필요하게 열려있던 포트들이었다.
설정을 마친 후 테스트도 진행했다.

```bash
curl -I http://dev.unretired.co.kr  # 접속 제한
```

AWS Layer에서는 우선 이렇게 처리하고, 본격적으로 Nginx에서 보안 설정을 하고자했다.
하지만, 혹시 모를 경우에 대비하여 근본적으로 현재 실행 중인 애플리케이션인 Spring Boot의 application.yml 설정을 변경하여 정적 리소스 서빙을 비활성화했다.

```yaml
spring.web.resources.add-mappings: false
```

이제 Nginx만 설정하면 당장 대응이 가능할 것으로 판단했다.
위의 로그들을 보고 공격을 감행하던 경로를 패턴으로 설정하고, 해당 경로로 요청이 들어오면 403 Forbidden을 반환하도록 설정했다.

```nginx
location ~* \.(env|config\.env|aws/credentials|git|bak|old|dist|dev|local)$ {
    deny all;
    return 403;
}
```

이렇게 설정을 마치고, curl 테스트를 진행했다.

```bash
HTTP/1.1 403 Forbidden
Server: nginx/1.24.0 (Ubuntu)
Date: Fri, 28 Feb 2025 14:11:51 GMT
Content-Type: text/html
Content-Length: 162
Connection: keep-alive
```

이제 Nginx 설정은 잘 작동하는 것 같다.

## 아직 끝이 아니다

현재까지는 확인된 공격에 한해서만 대응한 것이었다.
설정을 마친 후, 얼마 안가 Nginx 로그를 확인하니 다른 공격 시도가 있었다.
그래서 이를 방지하기 위해 고민을 했고, 이렇게만 대응하면 안될 것 같아 찾아보았다.

두 가지 방법을 찾았는데, AWS WAF(AWS Web Application Firewall)와 Fail2Ban이었다.
AWS WAF는 악성 트래픽을 차단하는 AWS의 서비스로, 적용하는 방법도 간단했다.
하지만 이렇게 설정하면 당연하게도 비용이 발생하고, 현재 상황에서는 이 정도의 대응이 필요한지 판단이 어려웠다.

그래서 비정상적인 요청을 필터링 기능과 금전적인 자원이 들지 않는 선에서 다른 방법을 고민하게 되었고, Fail2Ban을 적용하기로 했다.
Fail2Ban은 로그를 모니터링하고, 설정한 패턴에 맞는 IP를 자동으로 차단하는 오픈소스 프로그램으로
이를 통해 공격 시도를 차단할 수 있을 것으로 판단했다.

## Fail2Ban 설정

Fail2Ban 구조에 대해 간단히 설명하자면 클라이언트와 서버로 이루어져 있다.
여기서 서버는 멀티스레드이며 소켓을 받아 명령을 실행한다.
그리고 클라이언트는 서버 구성 및 동작을 하기 위한 명령어들을 보낸다.
그렇기에 이를 통해서 Fail2Ban의 기능들을 설정할 수 있다.

실제로 차단(Ban)하는 방법에 대한 정책 규정은 `jail.local` 파일에 설정할 수 있다.
사용자가 지정한 로그 파일들을 대상으로 필터링을 해서 규칙에 맞는 로그가 발생하면 해당 IP를 차단한다.
기본적으로 많은 정책들이 있고, 이를 통해 다양한 공격 시도에 대응할 수 있다.
추가로 감지 횟수와 차단 시간을 설정할 수 있어서, 이를 통해 더욱 세밀한 대응이 가능하다.
이후 커스텀 액션이라는 개념이 존재해 정책에 맞는 작업을 수행하고 이메일 전송 같은 작업도 가능하게 되어있다.

이제 설정해보자. 먼저 Fail2Ban을 설치하겠다.

```bash
sudo apt-get install fail2ban
```

그리고 필터링 설정 파일을 수정해야 한다.
파일들은 기본적으로 `/etc/fail2ban/filter.d/`에 위치해있다.
지금은 Nginx에 들어오는 로그를 필터링하고 차단하는 설정을 해야한다.
이러한 설정은 `nginx-bad-request.conf`에서 기본 설정을 제공해주고 있다.
400 Bad Request와 403 Forbidden 로그를 필터링해야 하기에 다음과 같이 설정했다.

```ini
[Definition]
failregex = ^<HOST> .* "(GET|POST|HEAD|OPTIONS|PUT|DELETE|PATCH).*" 400
            ^<HOST> .* "(GET|POST|HEAD|OPTIONS|PUT|DELETE|PATCH).*" 403
ignoreregex =
```

설명하자면 `failregex`는 필터링할 로그의 패턴을 정의하는 부분이다.
`<HOST>`는 IP를 의미하며, `400`과 `403`은 HTTP 상태 코드를 의미한다.
이렇게 설정하면 400 Bad Request와 403 Forbidden 로그를 필터링할 수 있다.

이제 설정 파일을 만들어야 한다.
`/etc/fail2ban/jail.local` 파일을 만들어서 설정을 추가하자.
jail.local 파일은 jail.conf 파일을 오버라이드하는 설정 파일이다.
이 파일에 설정을 추가하면 jail.conf 파일에 있는 설정을 덮어쓰게 된다.
고로 jail.local 파일에 설정을 추가하자.

```ini
[nginx-bad-request]
enabled = true
filter = nginx-bad-request
logpath = /var/log/nginx/access.log
maxretry = 10
findtime = 1m
bantime = 10m
```

이 부분도 간단히 설명하자면 `enabled`는 해당 설정을 사용할지 여부를 나타내며, `filter`는 사용할 필터를 지정한다.
`logpath`는 필터링할 로그 파일을 지정하고, `maxretry`는 허용할 최대 실패 횟수를 의미한다.
`findtime`은 `maxretry`를 적용할 시간을 의미하며, `bantime`은 차단할 시간을 의미한다.
여기서 설정 내용은 1분 동안 10번 이상의 400 Bad Request와 403 Forbidden 로그가 발생하면 해당 IP를 10분 동안 차단한다는 의미이다.
왜 1분 동안 10번 이상으로 했냐하면 개발 서버이기에 프론트 서버 응답에 대한 테스트를 진행하고 있기 때문이다.
배포였다면 좀 더 타이트하게 잡았을 것 같다.

이렇게 해서 설정을 마치고, 적용하겠다.

```bash
systemctl restart fail2ban
fail2ban-client add nginx-bad-request
fail2ban-client status nginx-bad-request
```

잘 돌아가는 지 상태 로그를 확인해보자.

```bash
Status for the jail: nginx-bad-request
|- Filter
|  |- Currently failed:	0
|  |- Total failed:	26
|  `- File list: nginx-bad-request
`- Actions
   |- Currently banned:	3
   |- Total banned:	5
   `- Banned IP list:
```

이렇게 뜨면 설정이 잘 적용된 것이다.
이제 이를 통해 공격 시도를 차단할 수 있을 것으로 기대한다.
물론 근본적인 해결책은 아니기에 적용 후에도 문제가 된다면 WAF 등을 도입해볼 계획이다.

## 참고

- [How to define a location regex matching block in nginx.conf](https://stackoverflow.com/questions/65650622/how-to-define-a-location-regex-matching-block-in-nginx-conf)
- [Nginx Security Best Practices](https://stackoverflow.com/questions/65650622/how-to-define-a-location-regex-matching-block-in-nginx-conf)
- [AWS WAF Official Docs](https://docs.aws.amazon.com/waf/latest/developerguide/)
- [Fail2Ban GitHub](https://github.com/fail2ban/fail2ban)
- [Fail2Ban Official Docs](https://www.fail2ban.org/wiki/index.php/Main_Page)
- [Sharing of fail2ban banned IPs](https://serverfault.com/questions/625656/sharing-of-fail2ban-banned-ips)
