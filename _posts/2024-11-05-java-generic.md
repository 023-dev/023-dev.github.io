---
layout: post
title: "Java의 Generic 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

이 글에서는 `Generic`에 대해서 자세히 알아본다.
# Java Generic
# Generic은 무엇이고, 왜 사용하는가?
- 제네릭은 타입을 매개변수로 지정하여 타입 안정성을 보장하는 방법입니다. 컴파일 시 타입 검사를 수행해 불필요한 형 변환을 피하고, 런타임 ClassCastException을 방지합니다.
# Generic을 사용한 경험
- ArrayList 대신 ArrayList<String>을 사용하여, 컴파일 시점에서 타입 안정성을 확보한 경험이 있습니다. 이를 통해 ClassCastException 발생 가능성을 제거했습니다.