---
visible: false
title: "HTTP와 HTTPS의 차이"
date: 2025-05-23 23:00:00
tags: 
  - Server
---

HTTP(Hypertext Transfer Protocol) 는 웹에서 클라이언트와 서버 간 통신을 위한 통신 규약인 프로토콜 중 하나다. 
하지만, HTTP는 암호화되지 않는 평문 데이터를 전송하기 때문에 제 3자가 정보를 조회할 수 있다는 위험이 있다. 
예를 들어, 아래처럼 사용자가 로그인 정보를 입력할 때 HTTP를 통해 전송되면, 이 정보는 암호화되지 않은 상태인 평문으로 전송되어 제 3자가 쉽게 볼 수 있다.

```http request
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
username=username
password=password1234
```

만약 이러한 민감한 정보가 노출되면, 개인 정보 유출이나 해킹 등의 심각한 보안 문제가 발생할 것이다.
이를 해결하기 위해서 HTTPS가 등장다.

HTTPS(Hyertext Transfer Protocol Secure) 는 HTTP에 데이터 암호화가 추가되었다. 
암호화된 데이터를 전송하기 때문에 제 3자가 볼 수 없도록 할 수 있다.

```http request
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
username: qhgVtu0873LqtiOhhGGD5h/41638bVghRFg
password: wsdrTGD65fTV&87Bgh8Bgr6JI9IL8g990nB
```

## HTTPS는 어떻게 적용할 수 있나?

HTTPS를 적용하기 위해서는 인증된 기관(Certificate Authority, CA)에게 인증서를 발급받아야 한다. 
CA에 인증서를 요청하면 CA 이름, 서버의 공개키, 서버의 정보를 활용하여 인증서를 생성하고 이를 CA 개인 키로 암호화하여 서버로 전송한다. 
이때 인증서는 CA 개인 키로 암호화되니 신뢰성을 확보할 수 있다. 
이러한 인증서를 서버측에서 발급받으면 HTTPS를 적용할 수 있다.

## HTTPS 동작 원리는 뭘까?

클라이언트가 서버로 최초로 요청할 때 암호화 알고리즘, 프로토콜 버전, 무작위 값을 전달한다. 
이를 받은 서버는 클라이언트에게 암호화 알고리즘, 인증서, 무작위 값을 전달하며, 클라이언트는 서버의 인증서를 CA의 공개키로 복호화하여 검증한다. 
검증이 끝난 이후에는 클라이언트와 서버에서 생성된 무작위 값을 조합하여 Pre Master Secret 값을 생성하여 서버 공개키로 암호화하여 전달한다.

서버는 전달받은 암호화된 데이터를 개인 키로 복호화하여 Pre Master Secret를 얻는다. 
클라이언트와 서버는 일련의 과정을 통해 Pre Master Secret를 Master Secret으로 변경하고, 해당 정보를 이용해 세션 키를 생성한다. 
이러한 과정을 TLS 핸드 쉐이크라고 하며, 이후부터 클라이언트와 서버는 세션 키를 활용한 대칭키 암호화 방식으로 데이터 송수신을 수행한다.

## 참고

- [[10분 테코톡] 리니의 HTTPS](https://youtube.com/playlist?list=PLuHgQVnccGMD-9lk4xmb6EG1XK1OmwC3u&si=hQhP1ensUUWyDoe_)