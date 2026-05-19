---
visible: true
title: "CompletableFuture에 대한 이해"
date: 2026-05-19 18:00:00
tags:
  - Java
heroImage: "./img.png"
---

`Future`는 비동기 작업의 결과를 나중에 받을 수 있게 해 준다.
하지만 `Future`만으로는 아쉬운 점이 많다.
결과가 필요하면 결국 `get()`으로 기다려야 하고, 작업이 끝난 뒤 이어서 실행할 콜백을 자연스럽게 붙이기도 어렵다.
여러 작업을 연결하거나, 둘 이상의 작업 결과를 합치거나, 예외를 한 흐름 안에서 처리하는 코드도 금방 복잡해진다.

Java 8에서 추가된 `CompletableFuture`는 이런 한계를 줄이기 위한 API다.
단순히 “결과를 나중에 받는 객체”에 그치지 않고, 작업이 끝난 뒤 다음 작업을 이어 붙이고, 여러 비동기 작업을 조합하고, 예외 처리까지 하나의 파이프라인으로 표현할 수 있다.

이 글에서는 `CompletableFuture`가 왜 필요한지부터 시작해 비동기 실행, 콜백, 작업 조합, 예외 처리, 타임아웃 처리까지 순서대로 정리한다.

## Future만으로 부족한 부분

`ExecutorService`에 `Callable`을 제출하면 `Future`를 받을 수 있다.
이 방식은 작업 결과를 표현한다는 점에서는 유용하지만, 결과를 실제로 사용하려면 대부분 `get()`을 호출해야 한다.

```java
Future<String> future = executor.submit(() -> "hello");

String result = future.get(); // 결과가 나올 때까지 현재 스레드가 기다린다.
System.out.println(result.toUpperCase());
```

`get()`은 결과가 준비될 때까지 호출한 스레드를 막는다.
그래서 비동기 작업을 시작해 놓고도, 결과 처리 지점에서는 다시 동기 코드처럼 기다리게 된다.
또 다른 문제는 작업을 이어 붙이기 어렵다는 점이다.
예를 들어 “회원 정보를 가져온 뒤 알림을 발송한다”처럼 앞선 작업의 결과가 다음 작업의 입력이 되는 흐름은 `Future`만으로 깔끔하게 표현하기 어렵다.

`CompletableFuture`는 이 지점을 보완한다.
결과를 기다리는 대신, 결과가 준비되면 실행할 작업을 미리 등록한다.
작업이 끝난 뒤 다음 단계가 이어지고, 중간에 예외가 발생하면 예외 처리 단계로 흐름을 넘길 수 있다.

## CompletableFuture란?

**[공식 문서 기준으로 `CompletableFuture`는 명시적으로 완료할 수 있는 `Future`이면서, 완료 시점에 의존 작업을 실행할 수 있는 `CompletionStage`다.](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/CompletableFuture.html)**
이 한 문장에 `CompletableFuture`의 성격이 거의 들어 있다.

먼저 `Future`이므로 비동기 작업의 결과를 나타낼 수 있다.
동시에 `CompletionStage`이므로 어떤 작업이 끝났을 때 다음 작업을 실행하는 단계형 흐름을 만들 수 있다.
게다가 이름처럼 외부에서 직접 완료시킬 수도 있다.

```java
import java.util.concurrent.CompletableFuture;

public class CompleteExample {
    public static void main(String[] args) {
        CompletableFuture<String> future = new CompletableFuture<>();

        future.complete("done");

        System.out.println(future.join()); // done
    }
}
```

`complete()`는 아직 완료되지 않은 `CompletableFuture`에 값을 넣어 정상 완료시킨다.
반대로 `completeExceptionally()`를 사용하면 예외로 완료시킬 수 있다.
실제로는 `supplyAsync()`나 `thenApply()` 같은 메서드를 더 자주 쓰지만, “외부에서 완료할 수 있다”는 특징을 이해하면 이름이 왜 `CompletableFuture`인지도 자연스럽게 이해된다.

## 비동기 작업 실행

`CompletableFuture`로 비동기 작업을 시작할 때는 주로 `runAsync()`와 `supplyAsync()`를 사용한다.
둘의 차이는 반환값이다.

| 메서드 | 작업 타입 | 반환값 |
| --- | --- | --- |
| `runAsync()` | `Runnable` | 없음. 결과 타입은 `CompletableFuture<Void>` |
| `supplyAsync()` | `Supplier<T>` | 있음. 결과 타입은 `CompletableFuture<T>` |

`runAsync()`는 실행만 하면 되는 작업에 어울린다.

```java
import java.util.concurrent.CompletableFuture;

public class RunAsyncExample {
    public static void main(String[] args) {
        CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
            System.out.println("worker: " + Thread.currentThread().getName());
        });

        future.join();
        System.out.println("main: " + Thread.currentThread().getName());
    }
}
```

`supplyAsync()`는 결과가 있는 작업에 사용한다.

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return "worker: " + Thread.currentThread().getName();
});

System.out.println(future.join());
```

`join()`은 `get()`처럼 완료될 때까지 기다린 뒤 결과를 반환한다.
차이는 예외 처리 방식이다.
`get()`은 체크 예외를 던지고, `join()`은 완료 예외를 런타임 예외인 `CompletionException`으로 감싼다.
예제 코드에서는 간단히 `join()`을 쓰지만, 운영 코드에서는 어느 지점에서 기다릴지, 예외를 어떻게 다룰지 분명히 정해야 한다.

## 기본 실행기와 커스텀 Executor

`runAsync()`와 `supplyAsync()`에 `Executor`를 넘기지 않으면 기본 실행기를 사용한다.
**[명시적인 `Executor`가 없는 async 메서드는 기본 비동기 실행기를 사용하며, 일반적으로 `ForkJoinPool.commonPool()`에서 실행된다. 단, common pool이 충분한 병렬성을 지원하지 않는 환경에서는 새 스레드가 사용될 수 있다.](<https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/CompletableFuture.html#defaultExecutor()>)**

학습용 예제에서는 기본 실행기를 써도 괜찮다.
하지만 서버 애플리케이션에서 블로킹 I/O, 외부 API 호출, 오래 걸리는 작업을 모두 공용 풀에 맡기면 다른 비동기 작업까지 영향을 받을 수 있다.
그럴 때는 별도 `ExecutorService`를 만들어 넘기는 편이 안전하다.

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CustomExecutorExample {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(4);

        try {
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
                return "worker: " + Thread.currentThread().getName();
            }, executor);

            System.out.println(future.join());
        } finally {
            executor.shutdown();
        }
    }
}
```

커스텀 실행기를 넘기면 스레드 수, 스레드 이름, 큐 정책, 종료 시점을 직접 관리할 수 있다.
대신 사용이 끝난 뒤 `shutdown()`을 호출해 자원을 회수해야 한다.

## 콜백 등록

`CompletableFuture`의 장점은 결과를 받은 뒤 다음 작업을 자연스럽게 이어 붙일 수 있다는 점이다.
대표적인 콜백 메서드는 `thenApply()`, `thenAccept()`, `thenRun()`이다.

**[`CompletionStage`는 `apply`, `accept`, `run` 계열 메서드로 값 변환, 값 소비, 후속 실행을 표현하고, `compose` 계열로 비동기 파이프라인을 구성한다.](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/CompletionStage.html)**

| 메서드 | 이전 결과 사용 | 반환값 | 용도 |
| --- | --- | --- | --- |
| `thenApply()` | 사용함 | 있음 | 값을 받아 다른 값으로 변환 |
| `thenAccept()` | 사용함 | 없음 | 값을 받아 소비 |
| `thenRun()` | 사용하지 않음 | 없음 | 이전 작업 완료 후 별도 작업 실행 |

`thenApply()`는 값을 변환한다.

```java
CompletableFuture<String> future = CompletableFuture
        .supplyAsync(() -> "hello")
        .thenApply(String::toUpperCase);

System.out.println(future.join()); // HELLO
```

`thenAccept()`는 값을 받아 사용하지만 새 값을 반환하지 않는다.

```java
CompletableFuture<Void> future = CompletableFuture
        .supplyAsync(() -> "hello")
        .thenAccept(System.out::println);

future.join();
```

`thenRun()`은 이전 결과가 필요 없고, 완료됐다는 사실만 중요할 때 사용한다.

```java
CompletableFuture<Void> future = CompletableFuture
        .supplyAsync(() -> "hello")
        .thenRun(() -> System.out.println("작업 완료"));

future.join();
```

여기서 `thenApply()`와 `thenApplyAsync()`의 차이도 알아 둬야 한다.
`Async`가 붙지 않은 메서드는 이전 단계를 완료한 스레드에서 실행될 수 있다.
반면 `thenApplyAsync()`처럼 `Async`가 붙은 메서드는 기본 비동기 실행기나 직접 넘긴 `Executor`에서 실행된다.
콜백이 가볍다면 non-async 메서드도 괜찮지만, 오래 걸리는 작업이라면 실행기를 분리하는 편이 낫다.

## 작업 조합

비동기 작업은 하나만 실행하는 경우보다 여러 작업을 연결하거나 합치는 경우가 더 많다.
`CompletableFuture`는 이런 흐름을 표현하기 위해 `thenCompose()`, `thenCombine()`, `allOf()`, `anyOf()`를 제공한다.

`thenCompose()`는 앞선 작업의 결과로 다음 비동기 작업을 시작할 때 사용한다.
즉 두 작업 사이에 의존 관계가 있을 때 어울린다.

```java
CompletableFuture<String> userFuture = CompletableFuture.supplyAsync(() -> "user-1");

CompletableFuture<String> result = userFuture.thenCompose(userId -> {
    return CompletableFuture.supplyAsync(() -> "profile of " + userId);
});

System.out.println(result.join()); // profile of user-1
```

`thenApply()`로도 비슷하게 작성할 수 있지만, 그 경우 `CompletableFuture<CompletableFuture<String>>`처럼 중첩된 타입이 생긴다.
`thenCompose()`는 이 중첩을 풀어 하나의 `CompletableFuture<String>` 흐름으로 이어 준다.
그래서 `Stream.flatMap()`처럼 생각하면 이해하기 쉽다.

`thenCombine()`은 서로 독립적인 두 작업이 모두 끝난 뒤 결과를 합칠 때 사용한다.

```java
CompletableFuture<String> hello = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> java = CompletableFuture.supplyAsync(() -> "Java");

CompletableFuture<String> result = hello.thenCombine(java, (a, b) -> a + " " + b);

System.out.println(result.join()); // Hello Java
```

정리하면 앞선 결과가 다음 비동기 작업의 입력이라면 `thenCompose()`가 맞고, 서로 독립적인 두 작업의 결과를 합치려면 `thenCombine()`이 맞다.

## allOf와 anyOf

작업이 세 개 이상이면 `allOf()`와 `anyOf()`가 유용하다.
둘은 기다리는 기준이 다르다.

**[`allOf()`는 전달된 `CompletableFuture`들이 모두 완료되면 완료되는 새 `CompletableFuture`를 반환한다.](<https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/CompletableFuture.html#allOf(java.util.concurrent.CompletableFuture...)>)**
다만 `allOf()` 자체의 결과 타입은 `CompletableFuture<Void>`다.
또한 전달된 작업 중 하나라도 예외로 완료되면, `allOf()`가 반환한 `CompletableFuture`도 예외로 완료된다.
각 작업의 결과를 모으려면 원래의 `CompletableFuture` 목록에서 다시 값을 꺼내야 한다.

```java
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

public class AllOfExample {
    public static void main(String[] args) {
        List<CompletableFuture<String>> futures = Arrays.asList(
                CompletableFuture.supplyAsync(() -> "A"),
                CompletableFuture.supplyAsync(() -> "B"),
                CompletableFuture.supplyAsync(() -> "C")
        );

        CompletableFuture<Void> all = CompletableFuture.allOf(
                futures.toArray(new CompletableFuture[0])
        );

        List<String> results = all.thenApply(ignored -> {
            return futures.stream()
                    .map(CompletableFuture::join)
                    .collect(Collectors.toList());
        }).join();

        System.out.println(results); // [A, B, C]
    }
}
```

**[`anyOf()`는 전달된 `CompletableFuture` 중 하나가 완료되면 같은 결과로 완료되는 새 `CompletableFuture`를 반환한다.](<https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/CompletableFuture.html#anyOf(java.util.concurrent.CompletableFuture...)>)**
가장 빠른 결과 하나만 필요할 때 사용할 수 있다.
먼저 끝난 작업이 예외로 끝났다면 `anyOf()`가 반환한 `CompletableFuture`도 예외로 완료될 수 있다.

```java
CompletableFuture<String> slow = CompletableFuture.supplyAsync(() -> {
    sleep(1_000);
    return "slow";
});

CompletableFuture<String> fast = CompletableFuture.supplyAsync(() -> "fast");

Object result = CompletableFuture.anyOf(slow, fast).join();
System.out.println(result); // fast
```

`anyOf()`의 결과 타입은 `CompletableFuture<Object>`다.
여러 작업의 결과 타입이 서로 다를 수 있기 때문이다.
같은 타입의 작업만 넘기더라도, 결과를 사용할 때는 타입 변환이 필요할 수 있다.

```java
private static void sleep(long millis) {
    try {
        Thread.sleep(millis);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new IllegalStateException(e);
    }
}
```

## 예외 처리

비동기 파이프라인에서는 예외 처리 위치가 중요하다.
어느 단계에서 예외가 발생했는지, 예외가 발생했을 때 기본값으로 복구할지, 아니면 그대로 실패시킬지 정해야 한다.

**[`exceptionally()`는 이전 단계가 예외로 완료됐을 때 대체 결과를 만들고, `handle()`은 정상 결과와 예외를 모두 받아 새 단계로 이어 간다.](<https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/CompletableFuture.html#exceptionally(java.util.function.Function)>)**

`exceptionally()`는 실패했을 때만 실행된다.

```java
CompletableFuture<String> future = CompletableFuture
        .<String>supplyAsync(() -> {
            throw new IllegalArgumentException("invalid request");
        })
        .exceptionally(e -> "default value");

System.out.println(future.join()); // default value
```

`handle()`은 성공과 실패를 모두 받는다.
실패했을 때만 기본값을 주고, 성공했을 때는 원래 결과를 그대로 넘기는 식으로 사용할 수 있다.

```java
CompletableFuture<String> future = CompletableFuture
        .supplyAsync(() -> "success")
        .handle((result, exception) -> {
            if (exception != null) {
                return "default value";
            }
            return result.toUpperCase();
        });

System.out.println(future.join()); // SUCCESS
```

예외를 단순히 기록하고 결과는 바꾸고 싶지 않다면 `whenComplete()`가 더 적합하다.
`whenComplete()`는 성공/실패 여부를 볼 수 있지만, 기본적으로 결과를 다른 값으로 바꾸기 위한 메서드는 아니다.
다만 `whenComplete()` 안에서 새 예외를 던지면 반환된 단계가 예외로 완료될 수 있으므로, 로깅 용도로 쓸 때도 콜백 내부 예외는 조심해야 한다.

## 타임아웃 처리

`Future.get(timeout, unit)`은 호출한 스레드가 지정 시간까지 기다렸다가, 시간이 지나면 `TimeoutException`으로 빠져나오는 방식이다.
최신 자바에서는 `CompletableFuture` 자체에도 타임아웃 관련 메서드가 있다.
Java 9부터 사용할 수 있는 `orTimeout()`과 `completeOnTimeout()`이다.

**[`orTimeout()`은 지정 시간 안에 끝나지 않으면 `TimeoutException`으로 예외 완료하고, `completeOnTimeout()`은 지정 값으로 정상 완료한다.](<https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/CompletableFuture.html#orTimeout(long,java.util.concurrent.TimeUnit)>)**

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

CompletableFuture<String> future = CompletableFuture
        .supplyAsync(() -> {
            sleep(2_000);
            return "result";
        })
        .completeOnTimeout("fallback", 1, TimeUnit.SECONDS);

System.out.println(future.join()); // fallback
```

`orTimeout()`은 실패로 처리해야 할 때, `completeOnTimeout()`은 기본값으로 복구해도 되는 상황에서 사용한다.
외부 API 호출처럼 응답 시간이 중요한 작업에서는 이런 타임아웃 정책을 파이프라인 안에 넣어 두는 편이 호출부를 단순하게 만든다.

## 사용할 때 주의할 점

`CompletableFuture`는 편리하지만, 모든 비동기 문제를 자동으로 해결해 주지는 않는다.
특히 다음 부분은 주의해야 한다.

- `join()`이나 `get()`을 너무 이른 시점에 호출하면 비동기 흐름이 다시 블로킹 코드가 된다.
- 블로킹 I/O를 기본 공용 풀에서 오래 실행하면 다른 작업까지 영향을 받을 수 있다.
- `allOf()`는 모든 결과를 자동으로 리스트에 담아 주지 않는다.
- `anyOf()`는 결과 타입이 `Object`라 타입 처리가 필요하다.
- 예외 처리 단계를 너무 뒤에만 두면 어느 작업에서 실패했는지 파악하기 어려워질 수 있다.
- 커스텀 `ExecutorService`를 만들었다면 사용 후 종료해야 한다.

작업이 CPU 계산인지, I/O 대기인지, 실패했을 때 기본값으로 복구해도 되는지에 따라 실행기와 예외 처리 전략이 달라진다.
API 사용법보다 중요한 것은 이 작업이 어떤 성격의 작업인지 먼저 나누는 일이다.

## 정리

`CompletableFuture`는 `Future`의 단순한 대체제가 아니다.
결과를 나중에 받는 기능에 더해, 작업 완료 후 콜백을 등록하고, 여러 작업을 이어 붙이거나 합치고, 예외와 타임아웃까지 한 흐름 안에서 처리할 수 있게 해 준다.

`runAsync()`와 `supplyAsync()`로 비동기 작업을 시작하고, `thenApply()`, `thenAccept()`, `thenRun()`으로 후속 작업을 붙인다.
앞선 결과로 다음 비동기 작업을 시작할 때는 `thenCompose()`, 독립적인 두 작업을 합칠 때는 `thenCombine()`을 사용한다.
여러 작업 전체를 기다릴 때는 `allOf()`, 가장 빠른 하나만 필요할 때는 `anyOf()`가 어울린다.

다만 `CompletableFuture`를 쓴다고 해서 무조건 논블로킹 코드가 되는 것은 아니다.
중간에 `join()`이나 `get()`으로 기다리면 그 지점은 블로킹된다.
실무에서는 기다리는 위치를 뒤로 미루고, 블로킹 작업에는 별도 실행기를 사용하며, 예외와 타임아웃 정책을 파이프라인 안에서 명확히 드러내는 편이 좋다.

## 참고

- [Oracle Java SE 26 API - CompletableFuture](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/CompletableFuture.html)
- [Oracle Java SE 26 API - CompletionStage](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/CompletionStage.html)
- [Oracle Java SE 26 API - Future](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/Future.html)
