---
title: "쿠키(Cookie)와 세션(Session)의 차이"
date: 2025-05-20 23:00:00
tags: 
  - Server
---

쿠키(Cookie)와 세션(Session)은 HTTP의 무상태(stateless) 특성을 보완하여 웹 애플리케이션에서 클라이언트와 서버 간의 상태를 유지하기 위해 사용되는 메커니즘이다. 
하지만, 이 두 가지는 서로 다른 방식으로 작동하며 각각의 장단점이 있다.

## 데이터 저장 위치

쿠키는 클라이언트 측 브라우저에 저장되는 반면, 세션은 서버 측에 저장된다.
세션은 서버에 데이터를 저장하고 클라이언트에게는 세션 ID를 쿠키로 전달하여 클라이언트가 서버에 요청할 때마다 이 세션 ID를 사용하여 서버에서 해당 세션 데이터를 조회한다.
n
## 보안성

쿠키는 위에서 언급한 것처럼 클라이언트에 저장되므로 사용자가 직접 접근하거나 수정할 수 있어 보안에 취약하다.
반면 세션은 서버에 저장되어 상대적으로 안전하다고 볼 수 있다.

## 용량 제한

쿠키는 일반적으로 브라우저당 도메인별로 4KB 정도의 용량 제한이 있다.
세션은 서버의 리소스에 의존하므로 상황에 따라 다르지만 상대적으로 쿠키보다 더 많은 데이터를 저장할 수 있다.

## 라이프사이클

쿠키는 개발자가 설정한 만료 시간까지 유지되며, 만료 시간을 설정하지 않으면 브라우저를 닫을 때 삭제된다.
세션은 서버의 설정에 따라 관리되며, 일정 시간 동안 사용되지 않으면 서버에서 자동으로 만료되는 경우가 일반적이다.

## 성능 영향

쿠키는 모든 HTTP 요청에 함께 전송되므로 쿠키가 많을수록 네트워크 대역폭을 차지하게 된다.
그러므로 네트워크 트래픽 또한 증가하게 된다.
세션은 서버 메모리를 사용하므로, 서버에서 관리하는 사용자의 세션이 많아질수록 서버의 메모리 사용량이 증가하게 되어 서버 부하가 증가할 수 있다.

일반적으로 사용자 선호 설정이나 로그인 하지 않은 상태에서의 장바구니 정보 등의 비민감 데이터는 쿠키에 저장하고,
로그인 정보와 같은 민감한 데이터는 세션에 저장하는 것이 적합하다.
최근에는 JWT(JSON Web Token)와 같은 토큰 기반 인증 방식이 많이 사용되고 있다.

## 참고

- [쿠키와 세션의 차이점 및 보안 고려사항](https://f-lab.kr/insight/cookie-vs-session)
- [쿠키(Cookie)와 세션(Session)의 차이, 쿠키란? 세션이란?](https://code-lab1.tistory.com/298)