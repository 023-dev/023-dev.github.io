---
visible: false
title: "@Query와 @Modifying만 사용하면 될까?"
date: 2025-02-25 09:00:00
tags: 
  - Java
  - Spring
  - Troubleshooting
---

테스트 진행 중, 프론트에서 로그아웃 API를 호출했을 때 에러가 발생하는 것을 발견했다.
로그를 확인해보니 다음과 같은 오류가 나타났다.

```java
org.springframework.dao.InvalidDataAccessApiUsageException: Executing an update/delete query;
nested exception is javax.persistence.TransactionRequiredException: Executing an update/delete query
``` 

해당 오류가 발생하는 이유와 해결 방법에 대해 알아보기 위해 찾아보았다.
근데 찾아보니까 Spring Data JPA에서 `delete` 메서드에서 `@Query`와 `@Modifying`가 사용하면 `@Transactional`이 반드시 필요하다는 점을 알게 되었고, 현재 코드에는 `@Transactional`가 없다는 것을 알게 되었다.
그렇다면 `@Modifying`을 사용할 때 `@Transactional`이 반드시 필요한 이유는 무엇일까? 
이를 이해하려면, 먼저 JPQL이 트랜잭션을 처리하는 방식을 알아야 한다. 
하지만 그 전에, Spring Data JPA의 기본 구현체인 `SimpleJpaRepository`가 트랜잭션을 어떻게 관리하는지 먼저 알아볼 필요가 있다.

## SimpleJpaRepository는 어떻게 트랜잭션을 처리할까?

일반적으로 `Repository` 클래스를 만들 때 `JpaRepository`를 확장해서 사용한다.
그리고 이러한 Custom Repository를 사용한 곳에서 디버그를 진행하면 `SimpleJpaRepository` 클래스가 `Proxy` 형태로 주입 되어 있는 것을 확인할 수 있다.
그렇다면 `SimpleJpaRepository`에서는 트랜잭션이 어떻게 처리될까?
해당 클래스의 내부를 보면 `@Transactional`을 이용하는 것을 알 수 있다.
전역적으로 `@Transactional(readOnly = true)`이 걸려 있었고, `save()`, `delete()` 같은 메서드들은 별도로 `@Transactional`이 적용되어 있었다.

```java
@Repository
@Transactional(readOnly = true)
public class SimpleJpaRepository<T, ID> implements JpaRepositoryImplementation<T, ID> {

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public void delete(T entity) { 
        ... 
    }

    @Override
    public Optional<T> findById(ID id) { 
        ... 
    }
}
```

그래서 `SimpleJpaRepository`의 `save()`나 `delete()` 같은 메서드는 트랜잭션이 자동으로 적용되므로 별도의 `@Transactional` 설정 없이도 정상적으로 동작하는 것이다.

## 그렇다면 JPQL을 이용한 메서드는?

`SimpleJpaRepository`에 원하는 메서드가 지원되지 않는 경우,
이때 JPQL로 작성하게 되는데 이때 **_Annotation to declare finder queries directly on repository query methods._**하기 위해 `@Query`를 사용한다.

즉, `@Query` 어노테이션은 Spring Data JPA를 사용하여 DML을 수행하기 위해 쿼리를 직접 작성할 때 사용한다는 것이다.
Spring Data JPA에서 `@Query`는 기본적으로 읽기 전용 트랜잭션을 사용한다.

그래서 SELECT 쿼리를 실행할 때는 `@Transactional(readOnly = true)`가 필요 없다.
하지만 `@Query`를 사용하여 `update`나 `delete` 같은 데이터의 상태를 변경하고자 쿼리를 실행할 때는 `@Modifying`을 명시적으로 추가해서 사용해야 한다.
그렇지 않으면 런타임 시점에 에러가 발생한다.

그럼 `@Modifying`만 사용하면 `update`나 `delete`가 될까?
먼저, 공식 문서에서는 `@Modifying` 어노테이션에 대해 
`Indicates a query method should be considered as modifying query as that changes the way it needs to be executed. This annotation is only considered if used on query methods defined through a Query annotation.`라고 설명하고 있다.

즉, `@Query`로 작성된 쿼리가 직접 `update`나 `delete` 같은 데이터 변경 작업을 수행하는 메서드를 정의할 때 
`@Modifying`을 추가하여 Spring Data JPA에 이 쿼리가 데이터베이스의 상태를 변경할 것임을 명시해야 한다는 것이다.
더 자세히 보면, `@Modifying`은 `flushAutomatically`와 `clearAutomatically` 두 가지 설정을 제공하고 있다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.METHOD, ElementType.ANNOTATION_TYPE })
@Documented
public @interface Modifying {

    /**
     * Defines whether we should flush the underlying persistence context before executing the modifying query.
     *
     * @return
     */
    boolean flushAutomatically() default false;

    /**
     * Defines whether we should clear the underlying persistence context after executing the modifying query.
     *
     * @return
     */
    boolean clearAutomatically() default false;
}
```

여기서 `flushAutomatically`는 `@Modifying` 쿼리 실헹 직전에 영속성 컨텍스트의 변경 내용을 자동으로 `flush`를 할지 결정한다.
즉, 영속성 컨텍스트 내의 변경 사항을 데이터베이스에 자동으로 반영하는지 여부를 결정하는 작업이라고 보면 된다.
이렇게 함으로써 쿼리 실행 전에 변경사항이 누락되지 않도록 할 수 있다.

그리고 `clearAutomatically`는 `@Modifying` 쿼리 실행 후 영속성 컨텍스트를 자동으로 `clear`할지 결정한다.
영속성 컨텍스트를 `clear`하는 것은 영속성 컨텍스트 내에서 관리하는 데이터를 초기화해서 이후의 데이터 조회 시 최신 상태를 반영하는 작업이라고 보면 된다.
이를 통해 연산 후 발생할 수 있는 영속성 컨텍스트와 데이터베이스 간의 불일치를 방지할 수 있다.

다시 돌아와서 왜 이런 설명을 했냐면 위의 설정을 보고 유추할 수 있는 것은
기본적으로 `@Modifying`이 적용된 JPQL 쿼리는 실행될 때 영속성 컨텍스트의 변경 사항이 자동으로 데이터베이스에 반영되지 않는다는 것이다. 
즉, `flushAutomatically`와 같은 설정을 명시적으로 사용하지 않으면, JPQL을 통해 데이터가 변경되더라도 영속성 컨텍스트는 여전히 기존 데이터를 유지할 수 있다.
즉, 기본 값으로만 설정을 한다면 데이터베이스와 영속성 컨텍스트의 정합성이 깨질 수 있다는 것이다.

그래서 다음과 같이 `@Modifying`만 사용하고 별다른 설정없이 `update`나 `delete` 쿼리를 실행하면 
처음에 언급한 `javax.persistence.TransactionRequiredException: Executing an update/delete query` 에러가 발생한다.
즉, `update`나 `delete`를 수행하기 위해서는 트랜잭션이 필수적으로 존재해야하는데, 트랜잭션이 존재하지 않아서 발생하는 것이다.

```java
public interface MemberTokenRepository extends JpaRepository<MemberToken, Long> {
    @Modifying
    @Query("delete from MemberToken m where m.member.id = :memberId and m.id = :tokenId")
    void deleteBy(
            @Param("memberId") Long memberId,
            @Param("tokenId") Long tokenId
    );
}
```

## 그렇다면 어떻게 해야할까?

방법은 간단하다. `@Transactional`을 추가하면 된다.
`@Transactional`을 추가하면 `@Modifying`이 있는 메서드에서도 트랜잭션이 적용되어 `update`나 `delete` 쿼리를 실행할 수 있다.

```java
public interface MemberTokenRepository extends JpaRepository<MemberToken, Long> {
    @Modifying
    @Transactional
    @Query("delete from MemberToken m where m.member.id = :memberId and m.id = :tokenId")
    void deleteBy(
            @Param("memberId") Long memberId,
            @Param("tokenId") Long tokenId
    );
}
```

그렇다면 꼭 `Repository`에 `@Transactional`을 추가해야 할까? 
사실 `@Transactional`의 기본 전파 속성이 `REQUIRED`이므로, 
`Service`에서 이미 트랜잭션이 시작된 경우 이를 그대로 사용할 수 있고,
`Repository`에도 `@Transactional` 적용하면 트랜잭션 전파(Propagation) 설정이 복잡해질 수 있다.

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@Reflective
public @interface Transactional {
    /**
     * The transaction propagation type.
     * <p>Defaults to {@link Propagation#REQUIRED}.
     * @see org.springframework.transaction.interceptor.TransactionAttribute#getPropagationBehavior()
     */
    Propagation propagation() default Propagation.REQUIRED;
}
```
  
 그래서 개인적으로 일반적인 경우에는 `@Transactional`은 비즈니스 로직이나 서비스 계층에서 사용하는 것이 좋은 것 같다고 생각한다.

> 만일 서비스 레이어에서 메서드 로직 중간에서 에러가 발생하면 `Rollback` 해야한다면, 서비스 레이어의 메서드에 `@Transactional`을 적용하면 된다.
> 하지만 서비스 로직 중간에 에러가 발생해도 실행된 쿼리 단위로 `Rollback` 처리가 필요하다면, 서비스 레이어의 메서드에 `@Transactional(readOnly = true)`을 적용하고, `Repository`의 메서드에 `@Transactional`을 적용하면 된다.


## 참고

- [stackoverflow - Spring Data JPA Modifying annotation usage with transactional](https://stackoverflow.com/questions/69942873/spring-data-jpa-modifying-annotation-usage-with-transactional)
- [stackoverflow - Do we need both Transactional and Modifying annotation in spring](https://stackoverflow.com/questions/48314475/do-we-need-both-transactional-and-modifying-annotation-in-spring)
- [spring docs - Transactionality](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)
- [spring docs - Annotation Interface Query](https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/Query.html)
- [spring docs - Annotation Interface Modifying](https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/Modifying.html)