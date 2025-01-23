---
title: "Phantom Read와 Gap Lock, Next-Key Lock"
date: 2024-12-21 00:00:00
tags: 
  - Database
---

# Phantom Read란 무엇인가?

Phantom Read는 트랜잭션이 동일한 조건의 쿼리를 반복 실행할 때, 나중에 실행된 쿼리에서 처음에는 존재하지 않았던 새로운 행이 나타나는 현상을 말한다.
이는 주로 읽기 일관성(Read Consistency) 을 유지하는 과정에서 발생할 수 있는 문제로, 데이터의 삽입이나 삭제가 다른 트랜잭션에 의해 이루어질 때 발생한다.

```sql
-- 트랜잭션 A 시작
START TRANSACTION;

-- 트랜잭션 A 첫 번째 조회
SELECT * FROM orders WHERE amount > 150;

-- 트랜잭션 B 시작
START TRANSACTION;

-- 트랜잭션 B 새로운 행 삽입
INSERT INTO orders (customer_id, amount) VALUES (4, 250);

-- 트랜잭션 B 커밋
COMMIT;

-- 동일한 조건으로 트랜잭션 A 두 번째 조회시, 트랜잭션 A의 첫 번째 조회에는 존재하지 않던,
-- 트랜잭션 B에서 삽입된 새로운 행이 함께 조회됨
SELECT * FROM orders WHERE amount > 150;
```

# 갭락(Gap Lock)이란?

[당근 기술 블로그](https://medium.com/daangn/mysql-gap-lock-다시보기-7f47ea3f68bc)
갭 락은 특정 인덱스 값 사이의 공간을 잠그는 락을 의미한다.
기존 레코드 간의 간격을 보호하여 새로운 레코드의 삽입을 방지한다.
갭 락은 범위 내에 특정 레코드가 존재하지 않을 때 적용된다.
트랜잭션이 특정 범위 내에서 데이터의 삽입을 막아 팬텀 읽기(Phantom Read) 현상을 방지한다.
예를 들어, 인덱스 값 10과 20 사이의 갭을 잠그면 이 범위 내에 새로운 레코드 15를 추가할 수 없다.

```sql
-- id 1, 3, 5가 저장된 orders 테이블

-- 트랜잭션 A 시작
START TRANSACTION;

-- 트랜잭션 A 1-3과 3-5 사이의 갭과 3 레코드 락 설정(넥스트키 락)
SELECT * FROM orders WHERE orders_id BETWEEN 2 AND 4 FOR UPDATE;

-- 트랜잭션 B 시작
START TRANSACTION;

-- 트랜잭션 B가 id 4에 데이터 삽입 시도 시, 갭락으로 인해 삽입이 차단되어 대기
INSERT INTO orders (orders_id, orders_amount) VALUES (4, 200);
...
```

# 넥스트키 락(Next-Key Lock)이란?

넥스트키 락은 레코드 락과 갭락을 결합한 형태로, 특정 인덱스 레코드와 그 주변의 갭을 동시에 잠그는 락이다.
이를 통해 레코드 자체의 변경과 함께 그 주변 공간의 변경도 동시에 제어할 수 있다.

넥스트키 락은 특정 레코드와 그 주변 공간을 잠그기 때문에, 다른 트랜잭션이 새로운 레코드를 삽입하여 팬텀 리드를 발생시키는 것을 방지한다.

|orders_id|orders_amount|
|---|---|
|1|100|
|2|200|
|3|300|


```sql
-- 트랜잭션 A 시작
START TRANSACTION;

-- 트랜잭션 A amount = 200인 orders_id = 2 레코드에 대한 레코드 락과 1-2, 2-3에 대한 갭락을 동시에 잠금으로써 넥스트키 락을 설정
SELECT * FROM orders WHERE orders_amount = 200 FOR UPDATE;

-- 트랜잭션 B 시작
START TRANSACTION;

-- 트랜잭션 B orders_id = 4, orders_amount = 200인 레코드 삽입 시도 시, 넥스트키 락으로 인해 차단되어 대기
INSERT INTO orders (orders_id, order_amount) VALUES (4, 200);
...
```

# 갭락과 넥스트키 락을 통한 팬텀 리드 방지 메커니즘

트랜잭션 A가 특정 범위의 데이터를 조회할 때, 해당 범위에 대해 갭락 또는 넥스트키 락을 설정한다.
락이 설정된 범위 내에서는 트랜잭션 B가 새로운 레코드를 삽입하거나 기존 레코드를 수정하는 것이 차단된다.
따라서, 트랜잭션 A가 다시 동일한 조건으로 조회를 수행하더라도, 트랜잭션 B에 의해 새로운 데이터가 삽입되지 않아 팬텀 리드가 발생하지 않는다.