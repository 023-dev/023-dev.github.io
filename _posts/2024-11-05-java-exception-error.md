---
layout: post
title: "Java의 Exception 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

Java에서 `String`은 문자열 데이터를 다루기 위해 사용한다. 

이 글에서는 `String`에 대해서 자세히 알아본다.

# Java Exception
# Exception과 Error의 차이
- Exception: 애플리케이션 코드에서 발생할 수 있으며, 예외 처리(try-catch)로 복구가 가능합니다. 예: NullPointerException, IOException.
- Error: 주로 시스템에서 발생하며, 심각한 문제로 인해 애플리케이션에서 복구하기 어렵습니다. 예: OutOfMemoryError, StackOverflowError.
# Exception 클래스의 예시
- `NullPointerException`: null 값에 대한 메서드 호출 시 발생. 
- `ArrayIndexOutOfBoundsException`: 배열의 유효한 인덱스 범위를 벗어난 접근 시 발생. 
- `IOException`: 입출력 관련 작업 시 발생할 수 있는 예외.
# Checked Exception과 Unchecked Exception의 차이
- `Checked Exception`: 컴파일 시점에서 검사가 필요한 예외로, 예외 처리가 강제됩니다. 예: IOException, SQLException.
- `Unchecked Exception`: 런타임에 발생하는 예외로 컴파일러가 검사하지 않습니다. 예: NullPointerException, ArithmeticException.
# throw와 throws의 차이
- `throw`: 메서드 내부에서 직접 예외를 발생시키는 키워드.
- `throws`: 메서드 선언부에서 해당 메서드가 예외를 던질 수 있음을 선언하는 키워드.
# try~catch~finally 구문에서 finally의 역할
- `finally` 블록은 예외 발생 여부와 관계없이 항상 실행됩니다. 주로 자원 정리(예: 파일 닫기, DB 연결 해제)에 사용됩니다.
# Throwable과 Exception의 차이
- Throwable: Error와 Exception의 최상위 클래스입니다. 모든 예외와 에러를 나타냅니다.
- Exception: Throwable을 상속받은 하위 클래스 중 하나로, 애플리케이션에서 예외 처리가 가능합니다.
