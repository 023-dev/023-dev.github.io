---
visible: false
title: "Spring에서 Event 처리하기"
date: 2026-01-21 09:00:00
tags: ["Engineering", "Backend"]
---

### 스프링 이벤트가 왜 필요할까?

회원가입하기 메서드를 예시로 들어보자.

```java
public void 회원가입() {
		회원가입_처리();
}
```

과연 이걸로 끝이 날까?

```java
public void 회원가입() {
		회원가입_처리();
		emailService.이메일_보내기();
}
```

이메일만 있을까? 카카오톡으로도 보낼 수 있을 것이고, 회원가입 시 포인트를 지급하는 정책이 있을 수도 있을 것이다.

```java
public void 회원가입() {
		회원가입_처리();
		emailService.이메일_보내기();
		talkService.톡_알림_보내기();
		pointService.포인트_지급하기();
}
```

이런 일이 비일비재할 것이다.
여기서 우리가 집중할 것은 회원가입 처리를 하는 것이다.

하지만 예시 코드처럼 부가적인 기능이나 핵심 로직와 거리가 있는 후속 로직들이 많이 붙어있다.
이러한 코드는 문제점이 있다.
먼저, SRP(단일책임원칙) 위반이다. 딱 봐도 단일책임이 아닌 것을 알 수 있다. 
이렇게 되면 서비스간 강한 결합이 생겨 의존성이 생기고, 코드 복잡도가 올라가고, 유지보수가 어려워질 것같다.

또한, 성능에도 문제가 있어보인다. 모든 로직에 대해서 10초가 소요된다면 회원가입을 하고 10초 후에나 알림을 받을 것이다.
이 부분을 어떻게 해결할 수 있을까?
아래 코드처럼 이벤트를 통해 해결할 수 있다.

```java
public void 회원가입() {
		회원가입_처리();
        eventPublisher.이벤트_발행(new 회원가입_이벤트());
}
```

이게 바로 `@EventListener`가 동작하는 방식이다. 예시 코드처럼 하면 해당 이벤트를 구독하는 곳에서 이를 후속처리한다.

- email 패키지

    ```java
    @EventListener(회원가입_이벤트)
    public void 회원가입_이벤트_처리기() {
    		emailService.이메일_보내기();
    }
    ```

- talk 패키지

    ```java
    @EventListener(회원가입_이벤트)
    public void 회원가입_이벤트_처리기() {
    		talkService.톡_알림_보내기();
    }
    ```

- point 패키지

    ```java
    @EventListener(회원가입_이벤트)
    public void 회원가입_이벤트_처리기() {
    		pointService.포인트_지급하기();
    }
    ```


아래 코드처럼  `@Order(1)`, `@Order(2)` 으로 순서를 지정해줄 수 있다.

- email 패키지

    ```java
    @EventListener(회원가입_이벤트)
    @Order(1)
    public void 회원가입_이벤트_처리기() {
    		emailService.이메일_보내기();
    }
    ```

- talk 패키지

    ```java
    @EventListener(회원가입_이벤트)
    @Order(2)
    public void 회원가입_이벤트_처리기() {
    		talkService.톡_알림_보내기();
    }
    ```


`@EventListener`로 구현을 하여 얻는 장점은 다음과 같다.

- 서비스간 낮은 결합도 및 의존성 유지.
- 관심사 분리
- 성능 문제 해결 가능성(이벤트 비동기 처리 시)

구현하는 방법에 대해서 좀 더 구체적으로 알아보자.

1. `ApplicationEventPublisher`를 통해 이벤트 객체를 발행한다.
    ```java
    public void 회원가입() {
    		회원가입_처리();
    		eventPublisher.이벤트_발행(new 회원가입_이벤트());
    }
    ```
2. `ApplicationEventMulticaster`에서 해당 타입을 처리할 수 있는 리스너만 골라 브로드 캐스트 방식으로 전파한다. 이때 상속관계에 대해서 설정도 가능하다.
3. 이벤트 수신 및 실행을 한다.

    ```java
    @EventListener(회원가입_이벤트)
    public void 회원가입_이벤트_처리기() {
    		emailService.이메일_보내기();
    }
    ```


### @EventListener의 실행 시점

`@EventListener`는 언제 실행될까?
`eventPublisher.publishEvent(new 회원가입Event());` 라인에서 바로 실행이 될까?

```java
public void 회원가입() {
		회원가입_처리();
		eventPublisher.이벤트_발행(new 회원가입_이벤트());
}
```

```java
@EventListener(회원가입_이벤트)
public void 회원가입_이벤트_처리기() {
		emailService.이메일_보내기();
}
```

그렇다. 이벤트가 발행되는 즉시 수신하고 실행한다.
그렇다면 만약 다음과 같은 상황은 어떨까?

```java
@Transactional
public void 회원가입() {
		회원가입_처리();
		약관동의_저장();
	  // 기타 등등 회원가입 로직
		eventPublisher.이벤트_발행(new 회원가입_이벤트());
}
```

회원가입 로직에 약관동의저장 같은 로직이 추가가 되면 데이터의 원자성을 위해 트랜잭션으로 실행하고 싶을 것이다. 
하지만 여기서 `@EventListenr`의 문제점이 발생한다. `@Transactional` 과 무관하게 이벤트가 발행되고 실행된다.

트랜잭션을 붙였을 시 커밋 시 문제가 발생할 수 있다. 
DB 제약조건으로 실패를 할 수도 있고, 커넥션이 끊기거나, JPA를 사용한다면 커밋 직전에 플러시가 되기 때문에 지연 로딩 관련 오류나 쿼리 오류 등 많은 상황에서 커밋 시 예외가 발생할 수 있다. 

즉 커밋이 안될 수 있는데 그와 무관하게 이벤트를 발행한다는 것이다.
다음 예시 상황을 보자.

1. 회원가입 시작(`@Transactional`)
2. 회원가입 이벤트 발행
3. 이벤트 수신(`@EventListener`)
    - 이메일 보내기
    - 카카오톡 알림
    - 포인트 지금
4. 커밋 직전에 회원 가입 롤백

위와 같은 상황에서는 마지막에 롤백이 되면서 발생하는 문제점을 확실히 보여준다. 
회원가입이 안되었지만, 이메일도 보내주고 카카오톡도 보내주고 포인트로 지급해줬다.

이렇듯 데이터 정합성 및 사용자 경험 측면에서 매우 치명적인 문제점을 가지고 있다.
이러한 문제점을 해결해주는 것이 바로 `@TransactionalEventListener` 이다.

### @TransactionalEventListener

`@TransactionalEventListener` 를 사용하면, 어떻게 되길래 해결이 된다는 것일까?
다음 상황에서 사용해보자.

1. 회원가입 시작(`@Transactional`)
2. 회원가입 이벤트 발행
3. 이벤트 수신(`@TransactionalEventListener(AFTER_COMMIT)`)
4. 커밋 직전에 회원 가입 롤백
5. 이벤트 실행 안 됨

`AFTER_COMMIT` 말고도 다양한 옵션이 있다.

| phase | description | example |
| --- | --- | --- |
| AFTER_COMMIT | 트랜잭션 커밋 후 | 이메일 전송, 포인트 지급 등의 비즈니스 로직 |
| BEFORE_COMMIT | 커밋 직전 | 로깅 등 |
| AFTER_ROLLBACK | 롤백 후 | 에러 알림, 리소스 롤백 |
| AFTER_COMTION | 커밋/롤백 관계없이 트랜잭션 종료 후 | cleanup, 캐시 등 후처리 |

근데 커밋까지 기다린다면 성능에 차이가 있을 것 같다는 생각이 들 수 있다. 
하지만 실제론 무시 가능한 수준으로 성능 차이가 거의 없다. 
이 부분은 단순 트레이드오프가 아니라, 상황에 따른 맞는 판단이 존재한다.

| 상황 | 선택 |
| --- | --- |
| 트랜잭션 없음 | `@EventListener`만 가능 |
| 트랜잭션 있음 | 둘 다 가능 |
| Event 로직이 실패해도 무방함
비즈니스 로직에 영향 없음 | `@EventListener` |
| 트랜잭션이 정상적으로 완료된 이후에만 실행되어야 하는 작업 | `@TransactionalEventListener` |
| 트랜잭션 커밋 유무와 무관하게 즉시 실행해도 괜찮은 경우 | `@EventListener`가능 |

### 스프링 이벤트의 한계 및 해결

스프링 이벤트의 한계는 같은 Spring ApplicationContext 내부에서만 유효한 것이다. 
즉, 동일 JVM 프로세스 안, 동일 ApplicationContext 안에서만 이벤트가 수신된다. 
또 다른 한계는 이벤트는 메모리 기반이라 Application 종료 시 메시지가 유실된다는 것이다. 
발행 직후 바로 application이 다운된다면 해당 이벤트는 유실된다.

이를 해결하는 방법도 있다. 그것은 바로 메시징 시스템 도입이다. 
이를 통해 이벤트 시스템을 더 신뢰성 있게 구축으로 안전성, 확장성, 재시도, 예외처리가 가능하다.
결론적으로 Spring 이벤트는 단일 어플리케이션 안에서 느슨한 결합, 관심사 분리 등을 돕는 도구로 사용할 순 있지만, 높은 신뢰도와 확장성이 필요한 서비스라면 메시지 브로커를 사용하는 이벤트 시스템 또한 검토해봐야한다.