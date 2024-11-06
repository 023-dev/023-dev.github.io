---
layout: post
title: "Java의 Lambda와 Stream 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

이 글에서는 `Lambda`와 `Stream`에 대해서 자세히 알아본다.
# Lambda란 무엇인가
- **람다(Lambda)** 는 자바 8부터 도입된 익명 함수 표현식으로, 함수형 프로그래밍 스타일을 제공합니다. 코드의 간결성을 높이고, 메서드를 변수처럼 전달할 수 있게 해줍니다.
# Stream이란 무엇인가?
- 스트림은 Java 8에서 추가된 API로, 데이터 처리 작업을 선언적으로 표현하여 컬렉션 데이터를 필터링, 매핑, 집계하는 등의 연산을 쉽게 수행할 수 있도록 도와줍니다.
# Lambda와 Stream의 필요성
- 람다와 스트림은 간결한 코드, 병렬 처리 지원, 순수 함수로 인한 사이드 이펙트 최소화, 데이터의 가독성과 처리 성능을 높이는 목적으로 도입되었습니다.