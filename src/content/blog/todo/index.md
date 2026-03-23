---
visible: false
title: "자바 질문 답변 메모"
date: 2026-03-22 00:00:00
tags: ["Engineering", "Backend"]
---

@JSCODE 제이온 멘토 님께서 어제 기습 질문하셨는데, 답변을 제대로 못해서 추가 공부한 내용 공유드립니다! 혹시 틀린 부분이 있다면, 피드백 부탁드립니다🙏

Q. 아래 코드는 Thread-Safe 한가요? (참고: 실제 면접 질문이었다고 합니다!)

```java 
public void test() { 
  if (vector.size() > 0) {
    vector.remove(0); 
  } 
}
```

A. 그렇지 않습니다. 

- 스레드 A: vector.size()가 1을 반환하여, remove() 실행하려던 순간에!!
- 스레드 B: vector.size()가 여전히 1을 반환하여, remove() 실행하려고 한다.

이러한 상황에서는 remove() 함수가 2번 실행되어 ArrayIndexOutOfBoundsException 예외가 발생할 수 있습니다. 따라서, 다음과 같이 별도의 동기화 처리를 해줘야 합니다. 

```java
// test 메서드를 호출하는 객체 자체가 락이 걸리기 때문에 
// 한 스레드가 test 메서드를 실행하면, 다른 스레드는 락을 획득할 때까지 대기 
public synchronized void test() { 
    if (vector.size() > 0) { 
        vector.remove(0); 
    } 
}
```

```java
public void test() { 
    // 백터 객체 자체가 락이 걸리기 때문에
    // 한 스레드가 동기화 블록에 진입하면, 다른 스레드는 락을 획득할 때까지 대기 
    synchronized (vector) { 
        if (vector.size() > 0) { 
            vector.remove(0); 
        }
    }
}
```

이처럼 Vector, Hashtable, Collections.SynchronizedXXX 컬렉션들은 메서드 자체는 동기화 되어 있지만, “객체 자체는 동기화 되어 있지 않아서” 여러 메서드를 복합적으로 사용할 때는 race condition이 발생할 수 있습니다. 따라서, 멀티 스레드 환경에서 별도의 동기화 처리가 필요합니다.  

(Vector, Hashtable은 레거시 클래스여서 각각 ArrayList, HashMap, 동기화가 필요할 때는 ConcurrentHashMap 사용이 더 권장됩니다.) 

참고 링크: https://inpa.tistory.com/entry/JCF-%F0%9F%A7%B1-ArrayList-vs-Vector-%EB%8F%99%EA%B8%B0%ED%99%94-%EC%B0%A8%EC%9D%B4-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0


@JSCODE 제이온 멘토 님께서 들어오셔서 해주신 깜짝 자바 질문 중에 답변을 못한게 있어서, 정리해서 공유 드립니다.
참고한 블로그 링크도 같이 남겨드립니다!


Q. JIT 컴파일러에 의해 컴파일된 네이티브 코드는 코드 캐시라는 메모리 영역에 저장된다고 하셨는데요, 만약 여기가 꽉 찰 경우 어떻게 될까요?

A. 코드 캐시 영역은 JVM이 시작될 때 설정된 크기로 고정되므로 확장이 불가능합니다. 따라서 코드캐시가 꽉 차면 더이상 JIT 컴파일은 이루어지지 않고 새로운 코드는 모두 인터프리터 모드로만 실행됩니다.
즉, 남은 코드가 모두 인터프리터로 동작되므로 성능 저하가 발생할 수 있습니다.

<추가> 
-XX:ReservedCodeCacheSize=<n> 옵션을 통해 코드 캐시의 최대 크기를 지정할 수 있기 때문에 적절히 크기를 관리하는 것이 중요.

https://velog.io/@ddangle/Java-JIT-%EC%BB%B4%ED%8C%8C%EC%9D%BC%EB%9F%AC-sfbp9dtu

[모니터링 관련 질문 답변]

모니터링 도구를 붙이는 것도 좋지만, ThreadPoolExecutor의 활성 스레드 수, 최대 스레드 수를 비교해서 80%가 넘어가면 안내를 주면 되지 않을까요?

public void createQuizRoom() {
    if (isThreadPoolOverloaded()) { // 스레드 풀 사용량 체크 (80% 초과 시 안내)
        send("현재 동시 접속자가 많아 잠시 대기 부탁드립니다.");
    }
    quizRoomExecutor.execute(() -> {
        // 퀴즈 방 생성 로직
    });
}

그리고 ThreadPoolExecutor의 생성자에 보시면 RejectedExecutionHandler를 설정할 수 있습니다.
이는 스레드가 max pool size만큼 활성되어 있고 큐도 가득 찼을 때 어떻게 할지 콜백을 설정하실 수 있습니다.
max pool size를 실행 머신 CPU 수를 고려해 80% 정도에 맞추고 RejectedExecutionHandler를 사용해보셔도 될 것 같네요!

[MyBatis 관련 질문 답변]
1. MyBatis 쿼리 관리 방식
현업에서는 대체로 XML 파일을 사용해 쿼리를 관리합니다. XML 파일을 사용하면 쿼리를 컴파일 없이 수정할 수 있어 유지보수와 배포가 편리합니다. 복잡한 쿼리나 자주 변경되는 쿼리는 XML에 작성하고, 단순 쿼리는 @Select 어노테이션을 사용해 효율적으로 관리하기도 합니다.

2. 테스트 데이터 세팅 방식
초기 테스트 데이터를 init.sql로 설정할 수도 있지만, 몇 가지 제약이 있습니다. Testcontainers를 활용해 테스트 환경마다 실제 DB를 띄우고 init.sql을 적용할 수 있지만, 이 방법은 테스트 시간 (혹은 빌드 시간)이 오래 걸릴 수 있습니다. 대부분의 비즈니스 로직 테스트는 Fixture나 Mock 객체를 사용해 필요한 데이터를 생성하고 검증합니다. (네이버에서 만든 FixtureMonkey를 쓰셔도 좋구요)
단, 실제 DB 연동 및 쿼리 테스트가 필요할 경우에는 init.sql + Testcontainers로 진행할 수도 있습니다. (H2 같은 인메모리 DB를 쓰면 좀 더 빠를 수도 있겠네요!)