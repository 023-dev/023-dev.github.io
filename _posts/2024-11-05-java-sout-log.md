---
layout: post
title: "자바에서 System.out.println 대신 로그를 사용해야 하는 이유"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

프로그래밍을 처음 배우면 `System.out.println("Hello World");`와 같이 콘솔에 출력을 시도하게 된다. 
콘솔 창에 "프로그램이 정상적으로 동작함을 확인하는 과정은 모든 개발자가 겪는 경험일 것이다. 
우리는 원하는 기능을 구현한 후, 값이 제대로 출력되는지 확인하기 위해 종종 `System.out.println`을 사용한다.

그러나 `System.out.println`을 무차별적으로 사용해서는 안 된다. 그 이유는 무엇인지 아래에서 자세히 알아보자.

# System.out.println이란 무엇인가?

`System.out.println`은 자바에서 디버깅 용도로 콘솔에 정보를 출력하기 위해 사용하는 메서드이다. 

이를 간단히 설명하자면:
- `System`: 자바의 `java.lang` 패키지에 내장된 `final` 클래스이다.
- `out`: `System` 클래스의 정적 멤버 필드로, `PrintStream` 객체이다.
- `println`: `PrintStream` 클래스의 메서드로, 표준 콘솔에 전달된 인자를 출력하며 자동으로 줄바꿈을 추가한다.

이렇게 `System.out.println`을 통해 출력이 이루어지지만, 여러 가지 이유로 인해 이를 사용하지 않는 것이 좋다.

# System.out.println을 사용하면 안 되는 이유

## 성능 문제

`System.out.println`을 사용하는 것은 성능에 악영향을 줄 수 있다. 
그 주요 이유는 블로킹 I/O와 멀티스레드 환경에서의 락 발생이다. 
`System.out.println`이 호출될 때는 메서드 내부의 `synchronized` 블록이 락을 걸기 때문에, 해당 메서드가 끝날 때까지 다른 스레드들은 기다려야 한다. 
이로 인해 불필요한 성능 저하가 발생한다.

아래 코드에서 `System.out.println("hello Wor``ld")`를 사용하는 예시를 보자.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("hello World");
    }
}

public void println(String x) { 
    if (getClass() == PrintStream.class) {
        writeln(String.valueOf(x));
     } else {
        synchronized (this) {
            print(x);
            newLine();
        }
        s = 33
    }
 }

```

위 코드에서 `println` 메서드는 `synchronized` 블록을 사용하고 있는데, 이는 여러 스레드가 동시에 접근하지 못하도록 락을 걸기 때문이다. 
이로 인해 `System.out.println`이 콘솔에 출력될 때 성능 저하가 발생할 수 있다.

## 로그 레벨 관리가 어려움

`System.out.println`은 로그 레벨을 지정할 수 없으므로 디버깅 용도로 사용할 때도 로그가 어떤 수준에서 출력되는지 구분하기 어렵다. 
로그 레벨이 제대로 관리되지 않으면, 프로덕션 환경에서도 불필요한 디버깅 정보가 그대로 노출될 수 있다. 
이러한 정보는 시스템의 안정성과 보안에 문제가 생길 수 있는 요인이 된다.

## 유지보수성 저하

출력 메시지가 코드에 하드코딩되어 있으면, 나중에 메시지를 수정하거나 삭제하는 작업이 어렵다. 
특히 큰 프로젝트나 협업 환경에서 유지보수성에 큰 영향을 미친다.

## System.out.println 사용 개선 전후 성능 비교

`System.out.println`을 사용하는 코드와 이를 로거로 대체하거나 제거한 후의 성능을 비교해 보자.

|               | 응답 시간 | 개선율 |
|---------------|-----------|--------|
| 변경 전       | 1,242ms   | -      |
| 변경 1        | 893ms     | 39%    |
| 변경 2        | 504ms     | 146%   |

- **변경 1**: 로깅 프레임워크를 사용하여 로그 출력을 `false`로 설정
- **변경 2**: 모든 로깅 코드를 주석 처리하고 `System.out.println`을 제거

변경 1에서 성능이 39% 개선되었고, 변경 2에서 146%까지 개선된 것을 볼 수 있다. 
즉, 로그 메시지를 콘솔에 출력하는 것만으로도 시스템 성능에 상당한 영향을 미칠 수 있음을 알 수 있다.

# 로그를 남기면 안 되는가?

<hr>

그렇다면 로그를 남기는 것은 아예 피해야 할까? 아니다. 
대신 로그를 남길 때는 `System.out.println` 대신 로거(Logger)를 사용하는 것이 좋다. 
로컬 환경에서 간단히 확인하는 용도로 `System.out.println`을 사용할 수 있지만, 실수로 배포 단계에서도 출력이 남지 않도록 로거를 사용하는 습관을 들이는 것이 중요하다.

`logback`이나 `log4j`와 같은 **로깅 프레임워크**를 사용해 로그 레벨을 관리하며 체계적으로 로그를 남기는 방식이 이상적이다.

[참고](https://systemdata.tistory.com/21): 