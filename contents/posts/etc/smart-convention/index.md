---
title: "좋은 이름의 기준"
date: 2025-09-07 02:00:00
tags:
  - etc
---

## 한 번에 좋은 이름을 지을 수도 없다

- 처음에는 좋은 이름을 바로 떠올리기 어려울 수 있다.
- 프로젝트가 커지고 의미가 분명해지면서 점차 더 나은 이름으로 리팩터링해야 할 때가 많다.

---

## 좋은 이름이 가진 5가지 특징

좋은 이름인지를 확인하는 5가지 기준은 **SMART**다.

- **S: easy to Search (검색하기 쉽게)**
- **M: easy to Mix (조합하기 쉽게)**
- **A: easy to Agree (수긍하기 쉽게)**
- **R: easy to Remember (기억하기 쉽게)**
- **T: easy to Type (입력하기 쉽게)**

### **S: easy to Search — 검색하기 쉽게**

- 검색하기 쉬운 이름을 위해서는 **한 단계 상위 범주**를 접두사(prefix)로 붙이는 것이 효과적이다.

나쁜 예

```java
public static final int TIMEOUT = 5000;
public static final int NO_RESULT = -1;
public static final int BAD_REQUEST = 400;
public static final int ALLOWED_REQUESTS_EXCESS = 1000;

```

좋은 예

```java
public static final int ERROR_SERVER_TIMEOUT = 5000;
public static final int ERROR_NO_RESULT = -1;
public static final int ERROR_BAD_REQUEST = 400;
public static final int ERROR_SERVER_ALLOWED_REQUESTS_EXCESS = 1000;

```

> ERROR_"라는 접두사를 붙여두면 프로젝트 전체에서 ERROR 관련 상수만 쉽게 검색할 수 있다.

### **M: easy to Mix — 조합하기 쉽게**

- 다른 코드 요소와 조합하기 쉽도록 이름을 지어야 한다.

나쁜 예

```java
public class User {
    private String name;
    private String email;
    private String role;
}

public class Order {
    private String name;
    private String email;
    private String role;
}

```

좋은 예

```java
public class User {
    private String userName;
    private String userEmail;
    private String userRole;
}

public class Order {
    private String orderName;
    private String orderEmail;
    private String orderRole;
}

```

> userName, orderName처럼 문맥과 조합 가능성을 고려한 이름은 혼동이 적습니다.

### **A: easy to Agree — 수긍하기 쉽게**

- 팀원들이 보았을 때 **자연스럽게 받아들일 수 있는 이름**을 짓는 것이 중요합니다.

나쁜 예

```java
public class Papago {
    // 번역 기능 담당 클래스 (의도가 불분명)
}

```

좋은 예

```java
public class TranslationService {
    // 번역 기능 담당 클래스 (누구나 납득 가능)
}

```

> 이름을 보고 "이 클래스가 무슨 역할을 할지" 바로 떠올릴 수 있어야 한다.

### **R: easy to Remember — 기억하기 쉽게**

- 뇌는 **익숙하고 감각적인 이름**을 잘 기억한다.
- 이미 널리 쓰이는 용어라면 그대로 사용하는 것이 효율적이다.

나쁜 예

```java
public class XYZZY {
    // 로그인 기능 담당 (알 수 없음)
}

```

좋은 예

```java
public class LoginManager {
    // 로그인 기능 담당 (누구나 기억 가능)
}

```

> Login, Manager는 이미 널리 알려진 용어라 쉽게 기억할 수 있다.

### **T: easy to Type — 입력하기 쉽게**

- 자주 쓰는 이름은 **짧고 입력하기 쉬운지** 확인해야 한다.

나쁜 예

```java
public class SuperUltraComplicatedDataProcessingFactoryManager {
}

```

좋은 예

```java
public class DataProcessor {
}

```

> 자주 쓰이는 클래스명이라면 짧고 직관적으로 입력 가능해야 협업 효율이 높아진다.

## 참고자료

- [개발자의 글쓰기](https://product.kyobobook.co.kr/detail/S000001766399)