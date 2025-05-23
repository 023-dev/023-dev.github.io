---
title: "NOT IN 쿼리를 사용할 때 발생할 수 있는 문제"
date: 2025-05-23 09:00:00
tags: 
  - Database
---

NOT IN 쿼리는 SQL에서 특정 조건을 만족하지 않는 레코드를 필터링하기 위해 사용되는 구문이다.
하지만 대규모 데이터셋에서 성능 저하를 일으킬 수 있는 몇 가지 문제점이 있다. 
이 글에서는 NOT IN 쿼리의 문제점과 이를 해결하기 위한 최적화 방안을 살펴보겠다.

## NOT IN 쿼리의 문제점

아래와 쿼리와 같이 NOT IN을 사용한 쿼리는 직관적이고 자주 사용된다.

```sql
SELECT p
    FROM Post p
    WHERE p.id NOT IN :postIds
```

하지만 NOT IN 쿼리는 다음과 같은 문제를 일으킬 수 있다.

### 성능 저하

NOT IN은 부정 조건으로, 대부분의 DBMS에서 전체 테이블 스캔이나 인덱스 풀 스캔을 유발한다. 
전체 데이터나 테이블을 스캔한 후 조건에 맞지 않는 레코드를 필터링 해야하기 때문에 데이터베이스 옵티마이저가 효율적인 실행 계획을 세우기 어렵다.

### 인덱스 활용도 저하

인덱스를 효과적으로 활용하지 못한다. 
IN 절은 인덱스 Range Scan을 통해 빠르게 처리할 수 있지만, NOT IN은 인덱스 활용도가 현저히 떨어진다.


### 오버헤드 추가 발생
대량의 값을 IN 절에 넣으면 실행 계획 생성이 늘어나고, 파싱 및 최적화 단계에서 추가적인 오버헤드가 발생한다.

### NULL 값 처리
NULL 값 처리 로직으로 인한 예상치 못한 결과가 발생할 수 있다. 
예를 들어, column NOT IN (1, 2, NULL)은 항상 빈 결과를 반환한다.

## 최적화 방안

NOT IN 쿼리를 최적화하기 위해서는 다음과 같은 방법을 고려할 수 있다.

### NOT EXISTS 활용

```sql
SELECT p FROM Post p
   WHERE NOT EXISTS (
      SELECT 1 FROM Post temp
        WHERE temp.id = p.id 
          AND temp.id IN :postIds
   )
```
   
NOT EXISTS는 행 단위로 평가되어 매칭되는 첫 행을 찾자마자 평가를 중단한다.
이는 DBMS가 '존재하지 않음'을 확인하기 위해 특별히 최적화된 방식이다. 대규모 데이터셋에서 가장 안정적이고 확장성 있는 성능을 제공한다.

### LEFT JOIN + IS NULL 패턴

```sql
SELECT p FROM Post p
   LEFT JOIN (
       SELECT temp.id 
            FROM Post temp 
            WHERE temp.id IN :postIds
   ) filtered ON p.id = filtered.id
   WHERE filtered.id IS NULL
```

이 방식은 서브쿼리 결과가 작을 때 특히 효율적이다. 인덱스를 효과적으로 활용할 수 있으며, PK 인덱스를 사용한 JOIN 연산이 최적화된다.

## 참고

- [Stackoverflow - SQL query 'not in' clause execution takes too long](https://stackoverflow.com/questions/5322161/sql-query-not-in-clause-execution-takes-too-long)