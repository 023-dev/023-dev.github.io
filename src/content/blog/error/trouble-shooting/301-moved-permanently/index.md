---
visible: false
title: "301 Moved Permanently"
date: 2025-04-02 02:00:00
tags:
  - Error
---

## Problem

Flutter 환경에서 소셜 로그인 시도 시 301 에러가 발생했다.
에러 로그는 다음과 같다.

```dart
flutter: [ERR] [POST] http://dev.site.co.kr/api/auth/signin/open-id
flutter: <html>
<head><title>301 Moved Permanently</title></head>
<body>
<center><h1>301 Moved Permanently</h1></center>
<hr><center>nginx/1.24.0 (Ubuntu)</center>
</body>
</html>
```

## Possible Causes

[MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301)에서 보면 301은 "Moved Permanently"라는 의미로, 요청한 URL이 영구적으로 다른 URL로 이동했음을 나타낸다.

Flutter에서 `http://dev.site.co.kr/api/...` 로 보내는 요청  확인해보면, HTTP 요청이 HTTPS로 리디렉션되고 있었다.
HTTP 요청 시, Nginx가 HTTPS로 강제 리디렉션(301 Moved Permanently)하게 해주게끔 설정했었다.

```bash
location / {
    return 301 https://$host$request_uri;
}
```

근데 React Native 환경에서는 문제가 없었기에 이게 왜 문제가 되나 싶었다.
그래서 리디렉션을 따르지 않는 이유를 찾아보니, 
Flutter의 HTTP 패키지는 기본적으로 리디렉션을 따르지 않는 다는 것이었다.
찾아본 자료는 아래 링크에 있다.

### references

[Stackoverflow, Flutter does not handle http redirect correctly](https://stackoverflow.com/questions/69965972/flutter-does-not-handle-http-redirect-correctly)

[Dart lang, #issuecomment-417639249](https://github.com/dart-lang/http/issues/157#issuecomment-417639249)

[Data tracker, #section-10.3.2](https://datatracker.ietf.org/doc/html/rfc2616#section-10.3.2)

[pub.dev Documentation, followRedirects property](https://pub.dev/documentation/http/latest/http/BaseRequest/followRedirects.html)


## Solution

그래서 근본적인 원인은 Flutter 환경에서 HTTP로 요청하는 것이 문제이므로, HTTPS로 요청하도록 수정 요청을 해서 해결하게 되었다.