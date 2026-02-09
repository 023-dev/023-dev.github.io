---
title: "SQL(Structured Query Language)"
date: 2025-01-08 00:00:00
tags: 
  - Database
---

## SQL(Structured Query Language)
SQL(Structured Query Language)은 관계형 데이터베이스를 관리하고 조작하기 위한 구조화된 질의 언어이다.
기능에 따라 데이터 정의 언어(DDL), 데이터 조작 언어(DML), 데이터 제어 언어(DCL) 등으로 나뉜다.

### SQL 동작 과정
SQL은 데이터베이스에 대한 질의를 수행하기 위해 다음과 같은 과정을 거친다.(MySQL 기준)

1. 사용자가 작성한 SQL 문장을 데이터베이스로 전송한다.
2. MySQL 쿼리 파서는 SQL 문장을 토큰으로 분리하여 트리를 생성한다. 이 트리 Parse Tree라고 하는데 이를 통해 문장의 구조를 파악하여 쿼리를 실행한다. 이 과정에서 문법 오류도 검출한다.
3. 다음으로 전처리기가 Parse Tree를 기반으로 SQL 문장구조에 문제가 없는지 검사한다. 이 과정에서 테이블이나 컬럼이 유효한지, 사용자가 접근권한이 있는지 등을 검사한다.
4. 옵티마이저가 SQL 실행을 최적화하기 위해 실행 계획을 수립한다.
5. 마지막으로 쿼리 실행 엔진이 옵티마이저가 수립한 실행 계획을 기반으로 스토리지 엔진을 호출해서 쿼리를 수행하고 결과를 반환한다.

## SQL 문장 종류

### DDL(Data Definition Language)
DDL(Data Definition Language)은 데이터 정의어로 테이블 생성, 변경, 삭제 등 데이터베이스의 구조를 정의하는 명령어이다.
주요 DDL 명령어로는 `CREATE`, `ALTER`, `DROP`, `TRUNCATE` 등이 있다.

### DML(Data Manipulation Language)
DML(Data Manipulation Language)은 데이터 조작어로 데이터베이스에 저장된 데이터를 조회, 삽입, 수정, 삭제하는 명령어이다.
주요 DML 명령어로는 `SELECT`, `INSERT`, `UPDATE`, `DELETE` 등이 있다.

### DCL(Data Control Language)
DCL(Data Control Language)은 데이터 제어어로 데이터베이스에 저장된 데이터에 대한 접근 권한을 제어하는 명령어이다.
주요 DCL 명령어로는 `GRANT`, `REVOKE` 등이 있다.

## CASCADE
CASCADE는 외래 키 제약 조건을 설정할 때 사용되는 옵션 중 하나로, 참조하는 테이블의 레코드가 변경되거나 삭제될 때 참조하는 테이블의 레코드도 함께 변경되거나 삭제되도록 설정하는 것이다.
하지만 CASCADE 옵션을 사용할 때는 주의해야 한다.
CASCADE 옵션을 사용하면 참조하는 테이블의 레코드가 변경되거나 삭제될 때 참조되는 테이블의 레코드도 함께 변경되거나 삭제되므로 데이터 무결성에 영향을 줄 수 있다.
그래서 실무에서는 CASCADE 옵션을 사용할 때는 신중하게 사용해야 한다.

## VIEW
VIEW는 하나 이상의 테이블로부터 유도된 가상 테이블로, 실제 데이터를 저장하지 않고 SELECT 문을 통해 필요한 데이터를 동적으로 생성하는 객체이다.
VIEW는 데이터를 저장하지 않고 SELECT 문을 통해 필요한 데이터를 동적으로 생성하기 때문에 실제 데이터를 변경하지 않고도 데이터를 조회하거나 조작할 수 있다.
또한 원본 테이블을 노출시키지 않게 함으로 데이터 보안성을 제공할 수 있다.

## 질의 처리 과정
MySQL에서 SQL 질의 처리 과정은 다음과 같다.

1. FROM 절에서 타겟 테이블이 정해진다. 이때, 테이블을 참조할 때는 테이블에 대한 락을 걸어 다른 사용자가 변경하지 못하도록 한다.
2. WHERE 절에서 조건에 맞는 투플이 필터링 된다. 이때, 인덱스를 사용하여 검색 속도를 높일 수 있다.
3. GROUP BY 절에서 지정한 컬럼을 기준으로 그룹핑이 이루어진다.
4. `DISTINCT`가 사용되면 중복된 투플이 필터링 된다.
5. HAVING이 사용되어 적용되면 GROUP BY 절에서 그룹핑된 투플에 대한 추가 필터링이 이루어진다.
6. ORDER BY 절에서 지정한 컬럼을 기준으로 정렬이 이루어진다.
7. LIMIT이 사용되어 적용되면 결과 튜플의 개수가 제한이 되어 반환된다.

## SELECT FOR UPDATE
`SELECT FOR UPDATE`를 사용하면 트랜잭션 내에서 특정 행을 읽을 때 해당 행에 대한 락을 걸어 다른 트랜잭션이 해당 행을 변경하지 못하도록 한다.

## GROUP BY
`GROUP BY`는 특정 컬럼을 기준으로 그룹핑을 하여 그룹별로 집계 함수를 적용할 수 있도록 하는 절이다.
주로 집계 함수와 함께 사용되며, 집계 함수를 사용하지 않는 경우에는 `DISTINCT`와 비슷한 역할을 한다.

```sql
SELECT column_name, aggregate_function(column_name)
FROM table_name
WHERE condition
GROUP BY column_name;
```

## ORDER BY
`ORDER BY`절을 사용해서 특정 컬럼을 기준으로 조회 결과를 정렬할 수 있다.
기본적으로 오름차순(ASC)으로 정렬되며, 내림차순(DESC)으로 정렬하려면 DESC 키워드를 사용한다.

```sql
SELECT column_name
FROM table_name
ORDER BY column_name ASC|DESC;
```

## JOIN
`JOIN`은 두 개 이상의 테이블을 연결하여 하나의 결과 집합으로 만드는 연산이다.
```sql
SELECT column_name(s)
FROM table1
JOIN table2
ON table1.column_name = table2.column_name;
```

### INNER JOIN과 OUTER JOIN

INNER JOIN 을 통해 두 테이블의 교집합을 구할 수 있다.
```sql
SELECT column_name(s)
FROM table1
INNER JOIN table2
ON table1.column_name = table2.column_name;
```

OUTER JOIN은 INNER JOIN과 달리 두 테이블의 합집합을 구할 수 있다.
```sql
SELECT column_name(s)
FROM table1
LEFT JOIN table2
ON table1.column_name = table2.column_name;
```

## LEFT OUTER JOIN과 RIGHT OUTER JOIN
LEFT OUTER JOIN은 왼쪽 테이블의 모든 행과 오른쪽 테이블의 일치하는 행을 반환한다.
```sql
SELECT column_name(s)
FROM table1
LEFT JOIN table2
ON table1.column_name = table2.column_name;
```

이떄 왼쪽 테이블의 모든 행을 반환하고 오른쪽 테이블의 일치하는 행이 없는 경우에는 NULL 값을 반환한다.

RIGHT OUTER JOIN은 LEFT OUTER JOIN과 반대로 오른쪽 테이블의 모든 행과 왼쪽 테이블의 일치하는 행을 반환한다.
```sql
SELECT column_name(s)
FROM table1 
RIGHT JOIN table2
ON table1.column_name = table2.column_name;
```

## CROSS JOIN

CROSS JOIN을 하면 두 테이블의 가능한 모든 조합 결과를 생성해 반환한다.
두 테이블의 각 레코드 수를 곱한 개수만큼 결과가 반환된다.
카테시안 곱이라고도 한다.
```sql
SELECT column_name(s)
FROM table1
CROSS JOIN table2;
```

## Subquery

서브쿼리는 쿼리문 안에 또 다른 쿼리문을 사용하는 것이다.
서브쿼리는 주로 WHERE 절, FROM 절, SELECT 절, HAVING 절에 사용된다.

## DROP, TRUNCATE, DELETE

### TRUNCATE
`TRUNCATE`는 테이블의 모든 행을 삭제하지만 테이블 스키마는 그대로 남겨둔다.
수행 시 DELETE처럼 행마다 로그를 남기지 않고 테이블 전체를 한 번에 삭제하기 때문에 속도가 빠르다.
하지만 ROLLBACK이 불가능하고, 테이블에 대한 LOCK이 걸리기 때문에 다른 사용자가 해당 테이블을 사용하지 못한다.
또한 AUTO_INCREMENT 값도 초기화 되기도 한다.

### DELETE

`DELETE`는 DML로 테이블의 행을 삭제하는 명령어이다. DELETE는 행마다 로그를 남기기 때문에 ROLLBACK이 가능하다.
하지만 DELETE는 행마다 로그를 남기기 때문에 TRUNCATE보다 속도가 느리다.
WHERE 절을 사용하여 특정 행만 삭제할 수 있다.

### DROP

`DROP`은 DDL로 테이블을 삭제하는 명령어이다. 테이블을 삭제하면 테이블 스키마와 데이터 모두 삭제된다.
데이터를 복구할 수 없으므로 주의해서 사용해야 한다.

## DISTINCT

`DISTINCT`는 중복된 행을 제거하는 명령어이다.
```sql
SELECT DISTINCT column_name
FROM table_name;
```

## SQL Injection

SQL Injection은 악의적인 사용자가 웹 애플리케이션의 입력 폼에 SQL 쿼리를 삽입하여 데이터베이스를 비정상적으로 조작하는 공격이다.

실행할 SQL 구문을 미리 Prepared Statement로 정해두고, 사용자 입력값에 따라 매핑하여 파라미터로만 전달하는 방식을 사용하면, SQL Injection을 통해 비정상적인 쿼리 수행을 방지할 수 있다.

## SQL Anti Patterns

SQL Anti Patterns는 SQL을 사용할 때 발생할 수 있는 잘못된 사용 방법을 말한다.

1. SELECT *
2. SELECT DISTINCT
3. SELECT COUNT(*)
8. SELECT column FROM table WHERE column LIKE '%value%'
9. SELECT column FROM table WHERE column = NULL
10. SELECT column FROM table WHERE column != value
11. SELECT column FROM table WHERE column = value OR column = value2

특히, SELECT 절에서 LIKE를 사용할 때 와일드 카드를 앞뒤로 사용하는 방식 `%value%`은
앞의 와일드 카드로 인해 정렬 기준이 없어져서 인덱스를 사용하지 못해서
테이블을 Full Scan하기 때문에 성능이 떨어진다.
이러한 안티패턴 사용을 지양 해야 한다.

## Pagination

Pagination은 페이지 단위로 데이터를 나누어 보여주는 기능을 말한다.
Pagination을 구현할 때는 `LIMIT`와 `OFFSET`을 사용한다.

```sql
SELECT column_name
FROM table_name
LIMIT 10 OFFSET 10;
```

페이지 번호는 OFFSET을 통해, 페이지에 보여줄 데이터 수는 LIMIT을 통해 설정한다.
