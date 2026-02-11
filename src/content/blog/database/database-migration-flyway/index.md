---
visible: true
title: "Flyway 도입기"
date: 2026-02-09 23:00:00
tags: ["Engineering", "Backend", "Database"]
heroImage: "./image.jpg"
---

현재 진행하고 있는 프로젝트 기존에는 생산성과 편의성을 위해
ddl-auto=create/update 옵션을 사용해 스키마를 관리하고 있었다.

하지만 이 방식은 프로젝트가 커지고, 환경이 분리되기 시작하면서 문제가 드러났다.

- 개발/운영 DB 스키마가 서로 다르게 흘러갈 수 있다.
- 어떤 변경이 언제 적용되었는지 추적할 수 없다.
- 팀원이 각자 로컬에서 `update`를 실행하며 암묵적으로 스키마가 변한다.
- 롤백 전략이 사실상 존재하지 않는다.

이러한 문제를 해결하기 위해 Flyway를 도입하고자 했다.  

## 왜 Flyway를 선택했는가?

데이터베이스 형상 관리 도구는 Flyway 뿐만 아니라 Liquibase도 존재했다.  
그럼에도  Flyway를 선택한 이유는 다음과 같다.

### 개발 친화적

Flyway는 기본적으로 SQL 기반 마이그레이션을 지향한다.
반면 Liquibase는 XML, YAML, JSON 기반의 선언적 DSL을 사용한다.
이에 Liquibase의 장점은 DB 독립적인 추상화 계층을 제공한지만, 
그만큼 러닝 커브가 존재한다는 점이 걸렸다.

Flyway는 SQL을 그대로 버전 관리한다.
DB는 결국 SQL로 동작한다는 점에서,
추상화를 덧입히기보다는 명시적인 변경 기록을 남기는 방식이 더 적합하다고 판단했다.

우리 프로젝트에서는 특정 DB 벤더(MySQL)에 종속되는 것이 문제되지 않았고,
SQL을 직접 통제하는 명확성이 더 중요했다.
따라서 DSL 기반보다는 SQL 기반 접근을 선택했다.

### 단순성과 운영 안정성

Flyway는 구조가 단순하다.
- db/migration 경로에
- V1__init.sql 같은 파일을 추가하고
- 애플리케이션 시작 시 자동 실행된다.

동작 원리가 직관적이다.
실행 이력은 flyway_schema_history 테이블 하나로 관리된다.

Liquibase는 기능이 더 풍부하다.
- Rollback 정의
- ChangeSet 단위 제어
- 조건부 실행 등

하지만 기능이 많을수록 설정 복잡도도 함께 증가한다.
우리의 요구사항은 복잡한 조건 제어가 아니라
명확한 이력 관리와 환경 동기화였다.

즉, 요구 수준 대비 Flyway가 더 적절했다.

### 도입 비용과 러닝 커브

Flyway는 설정이 단순하고 학습 비용이 낮다.
- 의존성 추가
- ddl-auto: validate 설정
- 마이그레이션 파일 생성

이 정도면 도입이 완료된다.

Liquibase는 상대적으로 학습 범위가 넓다.
- ChangeSet 개념 이해
- DSL 작성 규칙 숙지
- Rollback 전략 설계

프로젝트 초기에 빠르게 정착시키는 것이 목표였기 때문에
러닝 커브가 낮은 도구가 유리했다.

결국 선택 기준은 다음과 같았다.
- SQL을 직접 통제할 수 있는가?
- 단순하고 예측 가능한가?
- 운영 환경에서 안전하게 관리 가능한가?
- 팀이 빠르게 익힐 수 있는가?

이 기준에서 Flyway는 과하지도 부족하지도 않았다.

형상 관리 도구 선택은
“어떤 도구가 더 강력한가”의 문제가 아니라
“우리 팀과 우리 프로젝트에 어떤 도구가 적합한가”의 문제였다.

### 적용 방법

다음과 같이 build.gradle 의존성 추가했다.

```kotlin
implementation 'org.flywaydb:flyway-core'
implementation 'org.flywaydb:flyway-mysql' // ver for MySQL 8.X
```


그리고 application.yml 환경 변수를 추가했다.

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate # or none

  flyway:
    enabled: true
```

- ddl-auto: validate
  - Hibernate가 스키마를 생성하거나 수정하지 않도록 한다. 
  - 엔티티와 DB 스키마가 일치하는지만 검증한다.

이 시점부터 스키마 변경의 책임은 Flyway가 가진다.

### 환경별 적용 전략

환경에 따라 Flyway 전략은 달라져야 했다.
운영 DB는 보호가 최우선이고, 개발 환경은 유연성이 더 중요했기 떄문이다.

#### 운영 환경

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    baseline-version: 1
    validate-on-migrate: true
    clean-disabled: true   
```

- ddl-auto: validate
  - Hibernate가 스키마를 변경하지 않도록 강제
- baseline-on-migrate: true
  - 기존 운영 DB가 이미 존재할 경우 기준점을 생성
- baseline-version: 1
  - 기준 버전을 명시
- validate-on-migrate: true
  - 실행 전 SQL 무결성 검증
- clean-disabled: true
  - 운영 환경에서는 clean 명령을 차단
  - 실수로 DB 초기화되는 상황을 방지

운영 환경의 핵심은 보수성과 추적 가능성이다.

#### 개발 환경

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: false
    validate-on-migrate: true
```

- baseline-on-migrate: false
  - 초기 DB는 Flyway SQL로 자동 생성
- validate-on-migrate: true
  - 실행 전 검증 유지

> 추가적으로 JPA 설정 또한 기존 `update`에서 `validate`로 수정했다.

### 마이그레이션 파일 작성 규칙

![마이그레이션 파일 명명 규칙](img_1.png)

- 위치: src/main/resources/db/migration
- 파일명 규칙: V{버전번호}__{설명}.sql
  > V1__init.sql, V2__add_project_table.sql
- 작성 원칙:
  - `CREATE TABLE IF NOT EXISTS` 사용
  - 기존 파일은 절대 수정하지 않는다.
  - 이미 실행된 마이그레이션은 불변이다.
  - 변경이 필요하면 새로운 버전 파일을 생성한다.
  - 데이터 변경도 반드시 버전으로 관리한다.
  - 초기 데이터 삽입도 SQL로 명시한다.
  - 가능한 한 명시적 SQL을 사용한다.
  - 스키마 변경은 코드가 아닌 SQL로 추적 가능해야 한다.

### 마이그레이션 파일 작성 팁(IntelliJ 환경)

1. IntelliJ에서 연결한 데이터베이스 소스에서 target할 데이터베이스를 선택한다.

   ![](img_2.png)

2. 오른쪽 마우스와 같이 더보기 이벤트 키를 누르면 사진처럼 뜹니다. `Flyway 마이그레이션` 를 클릭한다.

   ![](img_3.png)

3. 소스는 현재 프로젝트 코드 모델로 설정하고, 타깃은 실제 데이터베이스의 스키마를 선택한 다음 확인을 클릭한다.

   ![](img_4.png)

4. 경로를 `resources/db/migration` 으로 하고, 적절한 파일 이름을 작성한 다음 저장을 한다.

   ![](img_5.png)

5. 그럼 `src/main/resources/db/migration` 에서 파일을 확인할 수 있다.

### **참고**

- https://leeeeeyeon-dev.tistory.com/12
- https://hudi.blog/dallog-flyway/
