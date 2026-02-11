---
visible: false
title: "URI, URL, URN의 차이"
date: 2025-05-21 23:00:00
tags: 
  - Server
---

URI(Uniform Resource Identifier), URL(Uniform Resource Locator), URN(Uniform Resource Name)은 모두 웹 자원을 식별하는 방법이다. 
하지만 이들은 서로 다른 개념으로, 각각의 용도와 특징이 있다.

## URI (Uniform Resource Identifier)

URI는 웹 자원을 식별하는 고유한 문자열이다. URI는 URL과 URN을 포함하는 포괄적인 개념이다.
즉, 특정 자원을 식별하기 위한 포괄적인 방법을 제공하며, 자원의 위치나 이름을 나타낼 수 있다.

## URL (Uniform Resource Locator)

URL은 URI의 한 형태로, 인터넷상에서 자원의 위치(주소)를 나타낸다.
자원이 어디에 위치하는지를 명확하게 지정하며, 자원에 접근하기 위한 프로토콜(예: HTTP, FTP 등)도 포함된다.
예를 들어, 웹페이지의 URL은 `https://www.example.com/index.html` 같은 형태로 해당 페이지가 위치한 서버의 주소와 접근 방법을 포함한다.

## URN (Uniform Resource Name)

URN은 또다른 URI의 한 형태로, 자원의 위치와 상관없이 자원의 이름을 나타내어 식별하는 방식이다.
자원의 위치가 변하더라도 동일한 식별자를 사용하여 자원을 참조할 수 있다.
특정 스키마를 따르며, 자원에 대한 영구적인 식별자를 제공한다.
예를 들어, ISBN(International Standard Book Number)은 책을 식별하기 위한 URN의 예이다.


## 참고

- [URI, URL 그리고 URN](https://hudi.blog/uri-url-urn/)
- [URL이 이상해요! Java와 Spring 중 범인은 누구?](https://tech.kakaopay.com/post/url-is-strange/)