---
layout: post
title: "자바에서 System.out.println 대신 로그를 사용해야 하는 이유"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

이 글에서는 자바에서 성능이 좋게 출력하는 방법에 대해서 자세히 알아본다.
# System.out.println 클래스는 성능이 좋지 않은 이유
- System.out.println은 **동기화(synchronized)**가 적용된 메서드로, 멀티스레드 환경에서 출력 시 성능 저하가 발생할 수 있습니다. 또한, 콘솔 출력은 I/O 작업이므로 속도가 느립니다. 대량의 로그 처리가 필요한 경우 비동기 로깅 라이브러리(예: Log4j, SLF4J)를 사용하는 것이 더 효율적입니다.