---
title: "Spring에서 Object를 Bean으로 관리하는 이유는 뭘까?"
date: 2025-05-19 09:00:00
tags: 
  - Spring
---

최근 리마인드를 할 겸 Spring을 다시 톺아보고 있다.
Spring Container에서 Bean으로 관리한다는 것은 보통 Spring Framework을 처음에 배우게 되는 내용이다.
그런데 왜 Bean으로 관리해야 하는지에 대해서는 잘 모르고 넘어가거나 잊는 경우가 있는 것 같다.
이번 글에서는 Spring에서 Bean으로 관리하는 이유에 대해서 정리해보려고 한다.
그렇다면 Spring에서 Bean으로 관리하는 이유는 무엇일까?
그 이유는 애플리케이션의 설계, 확장성, 유지보수 측면에서 많은 이점을 제공하기 때문이다.

## 의존성 관리 자동화

Bean으로 등록된 객체들은 Spring Container(BeanFactory, ApplicationContext)가 자동으로 의존성을 주입해준다.
개발자가 직접 객체를 생성하고 의존성을 연결할 필요가 없어진다는 말이다.
또한 Container가 빌드 시점에 순환 의존성을 감지해서 설계 오류를 미리 방지할 수 있다.

```java
@Service
class UserService {
    private final UserRepository userRepository; //Autowired
}
```

## 싱글톤 보장

Bean으로 등록된 객체들은 기본적으로 싱글톤으로 관리된다.
싱글톤으로 관리된다는 것은 애플리케이션 전체에서 단 하나의 인스턴스만 존재한다는 것을 의미한다.
이렇게 되면 메모리 사용량을 최적화할 수 있고, 상태를 공유할 수 있으며, 불필요한 객체 생성을 방지할 수 있다.

```java
@Service
class UserService(private final UserRepository userRepository){};
    
@Service
class AuthService(private final UserRepository userRepository){};
```

## 생명주기 관리

Spring은 Bean의 초기화와 소멸 과정을 자동으로 관리한다.
이를 통해 리소스 할당 및 해제를 체계적으로 처리할 수 있다.

```java
@Component
class DatabaseConnection {
    @PostConstruct
    public void init() {
        // 초기화 작업
    }

    @PreDestroy
    public void cleanup() {
        // 리소스 정리 작업
    }
}
```

## AOP(Aspect Oriented Programming, 관점 지향 프로그래밍) 지원

Bean으로 관리되는 객체들은 트랜잭션 관리, 로깅, 보안 등의 공통 관심사를 쉽게 적용할 수 있다.
이러한 공통 관심사를 분리하여 코드의 가독성과 유지보수성을 높일 수 있다.

```java
@Service
class TransferService(
    private final AccountRepository accountRepository
) {
    @Transactional // AOP를 이용한 트랜잭션 관리
    public void transferMoney(Long fromAccountId, Long toAccountId, Double amount) {
        accountRepository.withdraw(fromAccountId, amount);
        accountRepository.deposit(toAccountId, amount);
    }
}
```

## 테스트 용이성

Bean으로 관리되는 컴포넌트 모킹(Mocking)이나 테스트용 구현체로 쉽게 대체할 수 있어 단위 테스트와 통합 테스트를 용이하게 수행할 수 있다.

```java
@SpringBootTest
class UserServiceTest {
    @MockBean
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Test
    void testUserService() {
        // Mocking userRepository behavior
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        
        // Test userService method
        User user = userService.getUserById(1L);
        assertNotNull(user);
    }
}
```

## 설정의 중앙화

애플리케이션의 구성 요소들을 Bean으로 관리함으로써 설정을 중앙화하고 일관된 방식으로 관리할 수 있다.
이로 인해 애플리케이션의 설정을 쉽게 변경하고 관리할 수 있다.

```java
@Configuration
class AppConfig {
    @Bean
    public UserService userService(UserRepository userRepository) {
        return new UserService(userRepository);
    }

    @Bean
    public UserRepository userRepository() {
        return new UserRepository();
    }
}
```

## 참고

- [스프링 탄생 배경, Bean이란?, Bean을 관리하는 컨테이너란?](https://www.youtube.com/watch?v=ShR5CmEUyRY&ab_channel=%ED%86%A0%ED%86%A0%EC%9D%98%EC%A6%90%EA%B1%B0%EC%9A%B4%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D)
- [[10분 테코톡] 주디의 Spring Bean](https://www.youtube.com/watch?v=3gURJvJw_T4&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC)