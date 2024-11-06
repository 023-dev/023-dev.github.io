---
layout: post
title: "Java의 Annotation 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

이 글에서는 `Annotation`에 대해서 자세히 알아본다.
# Java에서 Annotation이란 무엇인가?
- **어노테이션(Annotation)** 은 메타데이터로, 컴파일러에게 정보를 제공하거나, 리플렉션을 통해 런타임 시 특수한 동작을 수행할 수 있게 해줍니다. 예: @Override, @Deprecated.
# Annotation을 왜 사용할까?
- 주석처럼 코드를 설명하는 것 이상의 구체적인 메타 정보를 제공하여, 프레임워크나 API에서 설정 및 구성을 단순화하고, 런타임 시 동작을 제어하기 위해 사용합니다.
# Reflection이란 무엇인가?
- **리플렉션(Reflection)** 은 런타임에 클래스, 메서드, 필드 정보를 탐색하거나 접근할 수 있는 메커니즘으로, 어노테이션 메타 데이터 분석 등에 사용됩니다. java.lang.reflect 패키지에서 제공됩니다.
# 리플렉션을 활용한 어노테이션 메타 데이터 가져오기 경험
실제로 리플렉션을 활용해 커스텀 어노테이션의 메타 데이터를 추출하고, 자동 주입 로직을 구현한 경험이 있습니다.