---
visible: true
title: "서킷 브레이커을 사용헌 Redis 장애 전파 막기"
date: 2026-03-17 23:00:00
tags: ["Engineering", "Backend"]
heroImage: "./image.png"
---

## 운영 도중 레디스에 장애가 발생해 레디스에 의존하는 서비스의 특정 API가 마비되는 현상이 발견되었다.

현재 레디스는 여러 가지 용도로 사용이 되고 있는데 캐싱 용도로 사용되고 있는 레디스에서 네트워크 장애가 발생했고 그로 인해 레디스를 통해 캐시를 불러오는 과정에서 장애가 발생해 에러 메시지를 반환하고 있었다.

이번 포스트에서는 레디스의 캐싱과 같은 외부의 부수적인 기능을 사용할 경우 발생할 수 있는 장애 전파를 막는 방법과 애플리케이션에서 어떻게 회복성을 확보할 수 있는지에 대해서 작성하려고 한다

## 만약 Redis에 장애가 발생하면 어떻게 될까? 

그대로 에러를 처리하지 못한 채 클라이언트에게 에러가 전파된다. 즉, Redis에 장애가 생겼다는 이유로 레디스를 사용하는 모든 API들이 마비되는 현상이 발생한다.

Spring 캐시 추상화는 CacheErrorHandler라는 인터페이스를 제공한다. 이를 활용하면 Redis를 활용하는 과정에서 발생하는 예외들을 캐치할 수 있다.

```java
@Slf4j  
public class CustomCacheErrorHandler implements CacheErrorHandler {  
  
  @Override  
  public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {  
    log.warn(  
        "[CustomCacheErrorHandler::handleCacheGetError] Cache get error - RDB로 대체. key: {}",  
        key,  
        exception);  
  }  
  
  @Override  
  public void handleCachePutError(  
      RuntimeException exception, Cache cache, Object key, Object value) {  
    log.warn(  
        "[CustomCacheErrorHandler::handleCachePutError] Cache put error - key: {}, value: {}",  
        key,  
        value,  
        exception);  
  }  
  
  @Override  
  public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {  
    log.warn(  
        "[CustomCacheErrorHandler::handleCacheEvictError] Cache evict error key: {}",  
        key,  
        exception);  
  }  
  
  @Override  
  public void handleCacheClearError(RuntimeException exception, Cache cache) {  
    log.warn("[CustomCacheErrorHandler::handleCacheClearError] Cache clear error", exception);  
  }  
}
```

위와 같이 CacheErrorHandler를 구현한 코드를 작성하면 만약 레디스를 활용하는 과정에서 예외가 발생할 경우 handleCache~Error 메소드를 통해 예외를 캐치한다.

이때 별다른 에러를 발생시키지 않고 로그만 남김으로써 무시한다면 기존 코드의 내용을 마저 진행한다.

@Cacheable 어노테이션이 달린 메소드의 실행 과정을 정리하자면 다음과 같다.

캐시 조회 시도: @Cacheable이 붙은 메소드를 호출하면 Spring은 먼저 Redis에서 데이터를 조회한다.
Redis 장애 발생: 이때 Redis의 연결 문제, 네트워크 장애 등으로 예외가 발생했다고 가정하자.
CacheErrorHandler는 미리 등록해 둔 커스텀 CacheErrorHandler를 통해 예외를 잡아서 로깅만 하고 무시한다.
Spring은 캐시 조회가 실패했다고 판단하고, 원래 메소드의 본문을 실행한다.
본문의 경우 RDB 또는 다른 데이터베이스를 사용하고 있어 장애가 발생하지 않고 정상적으로 실행된다.
본문 실행을 통해 클라이언트에게 정상적인 응답이 제공된다.
해당 과정을 통해 레디스에 장애가 발생하더라도 클라이언트에게까지 장애가 전파되지 않고 시스템은 정상적으로 동작한다.

커스텀 CacheErrorHandler를 작성했다면 CachingConfigurerSupport를 상속하여 등록해 주도록 하자

```java
import org.springframework.cache.annotation.CachingConfigurerSupport;  
import org.springframework.cache.annotation.EnableCaching;  
import org.springframework.cache.interceptor.CacheErrorHandler;  
import org.springframework.context.annotation.Configuration;  
  
@Configuration  
@EnableCaching  
public class CacheConfig extends CachingConfigurerSupport {  
  
  @Override  
  public CacheErrorHandler errorHandler() {  
    return new CustomCacheErrorHandler();  
  }  
}
```

##  서킷 브레이커 패턴 도입
CustomErrorHandler를 통해 장애 전파를 막았지만 문제가 있다.

레디스의 장애가 해소되기 전까진 @Cacheable이 붙은 메소드를 호출하면 Spring은 먼저 Redis를 바라본다는 점이다.

Redis를 바라본 후 에러가 발생해 CustomCacheErrorHandler에 의해 로그를 남긴 후 본문이 실행되겠지만 만약 Redis에 네트워크 장애가 발생할 경우, Redis에서 에러를 받기 전 연결 타임아웃을 기다린 후에야 CustomCacheErrorHandler를 통해 예외를 처리하게 된다.

그렇게 된다면 정상적으로 비즈니스 로직을 실행한 후 클라이언트에게 응답하더라도 시간이 오래 걸리게 된다.

그렇기 때문에 서킷 브레이커 패턴을 도입해 만약 일정 기준 이상으로 에러가 발생할 경우 Redis와의 통신을 막도록 하는 게 좋다.

서킷 브레이커를 활용하여 Redis를 바라보지 못하게 하는 방법은 여러 가지가 있을 수 있다.

- 기존 CacheErrorHandler를 사용하는 방법
- AOP를 사용하는 방법

CacheErrorHandler + Circuit Breaker
서킷 브레이커를 사용하기 위해 관련 의존성을 추가해 주자

```groovy
implementation "org.springframework.cloud:spring-cloud-starter-circuitbreaker-resilience4j"
```

```java
@Configuration
public class Resilience4jConfig {

  @Bean
  public CircuitBreakerConfig redisCircuitBreakerConfig() {
    return CircuitBreakerConfig.custom()
        .failureRateThreshold(50) // 실패 비율이 50% 이상이면 써킷을 오픈
        .waitDurationInOpenState(Duration.ofSeconds(10)) // 써킷이 오픈 상태를 유지하는 시간(10초)
        .slidingWindowSize(20) // 통계(성공/실패)를 기록하는 슬라이딩 윈도우 크기 (최근 20회 요청)
        .minimumNumberOfCalls(2) // 써킷이 오픈되기 전, 최소 요청 횟수
        .build();
  }

  @Bean
  public CircuitBreaker redisCircuitBreaker(
      CircuitBreakerRegistry registry, CircuitBreakerConfig redisCircuitBreakerConfig) {
    return registry.circuitBreaker("redis", redisCircuitBreakerConfig);
  }
}
```

서킷 브레이커 관련 내용은 [공식 문서](https://resilience4j.readme.io/docs/getting-started)를 참조하도록 하자.

```java
@Slf4j
@RequiredArgsConstructor
public class CustomCacheErrorHandler implements CacheErrorHandler {  

  private final CircuitBreaker redisCircuitBreaker;
  
  @Override  
  public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {  
    log.warn(  
        "[CustomCacheErrorHandler::handleCacheGetError] Cache get error - RDB로 대체. key: {}",  
        key,  
        exception);
    redisCircuitBreaker.onError(0, TimeUnit.SECONDS, exception);
  }  
  
  ...
}
```

기존 CustomCacheErrorHandler에 설정한 redisCircuitBreaker를 주입하고 Redis에 에러가 발생할 경우 CustomCacheErrorHandler를 통해 예외를 캐치한 후 redisCircuitBreaker.onError로 수동으로 실패를 기록한다.

```java
@Component("cacheStateProvider")
@RequiredArgsConstructor
public class CacheStateProvider {

  private final CircuitBreaker redisCircuitBreaker;

  public boolean isCacheEnabled() {
    return redisCircuitBreaker.getState() != CircuitBreaker.State.OPEN;
  }
}
```

redisCircuitBreaker의 상태를 제공해 주는 CacheStateProvider를 정의하자.

```java
@Cacheable(
      value = "testCache",
      key = "#p0",
      cacheManager = "cacheManager",
      unless = "#result == null",
      condition = "#p0 != null && @cacheStateProvider.isCacheEnabled()")
```

@Cacheable을 사용하는 쪽에서 cacheStateProvider가 제공해 주는 상태를 condition 조건에 걸어준다.



이렇게 할 경우 redisCircuitBreaker를 설정한 대로 동작하며 서킷 브레이커가 열릴 경우 @Cacheable은 동작하지 않아 목적한 바를 이룰 수 있다.



다만 기존에 @Cacheable이 정말 많이 정의되어 있는 프로젝트라면?

수 십, 수백 개의 @Cacheable에 condition을 걸어줘야 한다면? 아주 번거롭고 문제가 될 수 있다.

이를 해결하기 위해 커스텀 어노테이션을 정의해 condition 조건을 걸고 @Cacheable이 아닌 커스텀 어노테이션을 사용하는 방법이 있을 수 있겠다.

하지만 이 방법 또한 기존의 코드를 전부 수정해야 하는 불편함이 남아있다.

이를 해결하기 위해 AOP를 활용해 보자.

AOP + Circuit Breaker
AOP를 사용하기 위해 관련 의존성을 추가해 주자

```groovy
iplementation 'org.springframework.boot:spring-boot-starter-aop'
```

AOP와 서킷 브레이커를 활용해 앞서 언급한 문제점을 해결할 수 있다.

(CacheErrorHandler 코드는 더 이상 사용되지 않으니 지워도 좋다. )

```java
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class CacheCircuitBreakerAspect {

  private final CircuitBreaker redisCircuitBreaker;

  @Around("execution(* *(..)) && @annotation(org.springframework.cache.annotation.Cacheable)")
  public Object applyCircuitBreaker(ProceedingJoinPoint joinPoint) throws Throwable {
    Callable<Object> decorated =
        redisCircuitBreaker.decorateCallable(
            () -> {
              try {
                return joinPoint.proceed();
              } catch (Throwable t) {
                throw new RuntimeException(t);
              }
            });

    try {
      return decorated.call();
    } catch (CallNotPermittedException e) {
      log.warn(
          "[CacheCircuitBreakerAspect::applyCircuitBreaker] Circuit Opened. Redis 접근 차단, DB로 직접 조회. method={}",
          joinPoint.getSignature().toShortString());
      return proceedWithoutCaching(joinPoint);
    } catch (RuntimeException e) {
      if (e.getCause() instanceof RedisSystemException
          || e.getCause() instanceof RedisConnectionFailureException) {
        log.warn(
            "[CacheCircuitBreakerAspect::applyCircuitBreaker] Redis error DB로 직접 조회. method={}",
            joinPoint.getSignature().toShortString());
        return proceedWithoutCaching(joinPoint);
      }

      if (e.getCause() != null) {
        throw e.getCause();
      }
      throw e;
    }
  }

  private Object proceedWithoutCaching(ProceedingJoinPoint joinPoint) throws Throwable {
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    Method method = signature.getMethod();
    Object target = joinPoint.getTarget();
    return method.invoke(target, joinPoint.getArgs());
  }
}
```

@Cacheable 어노테이션 전후로 실행되는 Aspect를 다음과 같이 정의했다.



@Cacheable 어노테이션만 지정하는 이유는 @CachePut과 @CacheEvict와 실행 순서가 다르기 때문이다.

@Cacheable의 경우 Spring이 Redis를 먼저 확인하고 에러가 발생할 경우 본문을 실행한다.

@CachePut과 @CacheEvict는 본문을 정상적으로 실행한 후에 Redis에서 값을 수정하거나 지우기 때문에 @Cacheable과 별도로 설정을 해주어야 한다.

또한 서킷 브레이커를 통해 @CachePut 또는 @CacheEvict를 하게 될 경우 서킷 브레이커의 동작 방식에 의해 데이터가 바뀌는 현상이 발생할 수 있다. (서킷 브레이커가 CLOUSED 여부를 판단하기 위해 트래픽을 다시 레디스로 옮길 경우)



위와 같이 코드를 작성할 경우

@Cacheable이 붙은 메소드를 실행하기 전 redisCircuitBreaker를 통해 메소드를 실행한다.
만약 서킷이 닫혀있는 경우 Spring은 Redis를 바라보고 에러가 발생한 경우 Callable을 통해 Throwable을 catch한 후 RuntimeException으로 wrappinggo 변환해 해당 에러를 던진다.
다시 RuntimeException을 캐치해 만약 던져진 에러가 RedisSystemException이거나 RedisConnectionFailureException인 경우에는 본문을 이어서 실행하도록 한다.
만약 서킷이 열려있는 경우 Spring은 Redis를 바라보지 않고 본문을 실행한다.
다음과 같이 CacheErrorHandler가 아닌 AOP와 서킷 패턴을 도입해 Redis 장애가 길어질 경우, 서킷을 통해 Redis와의 통신을 막음으로써 애플리케이션 또는 클라이언트에게 미치는 장애 전파를 최소한으로 할 수 있다.

마치며
비단 Redis 뿐만이 아니라 MSA 환경이나 다른 기술 간 통신이 필요한 환경에선 서킷 브레이커 패턴을 고민해 볼 수 있다.

물론 Redis 자체에서 고가용성을 유지할 수 있는 인프라를 구축하는 게 본질적인 해결책이다.

하지만 백엔드 개발자의 입장에서도 내가 사용하는 기술들이 부분적인 장애가 발생했을 때 어떻게 하면 장애가 시스템에 전파되지 않을지 고민해 보면 좋을 것 같다.
