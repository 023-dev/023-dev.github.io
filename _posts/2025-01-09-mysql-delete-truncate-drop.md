---
layout: post
title: "DELETE, TRUNCATE, DROP 차이"
author: "023"
comments: true
tags: MySQL
excerpt_separator: <!--more-->
---

테이블의 데이터를 삭제 시 `DELETE`, `TRUNCATE`, `DROP` 을 사용할 수 있다. 각각의 차이점을 알아보자.

## DELETE
`DELETE`는 데이터를 하나하나 삭제면서 제거하는 방식이다.
`WHERE` 절을 사용하여 조건에 맞는 행만 삭제할 수 있다.
이러한 방식으로 데이터를 삭제해서 다른 삭제 방식보다는 느리지만 `COMMIT`을 하지 않으면 `ROLLBACK`으로 데이터는 복구할 수 있다.

```sql
DELETE FROM table_name WHERE condition;
```

## TRUNCATE

`TRUNCATE`는 테이블의 모든 데이터를 삭제하는 방식이다.
`DELETE`와 달리 `WHERE` 절을 사용할 수 없다.
`TRUNCATE`는 `COMMIT`을 자동으로 실행하기에  `ROLLBACK`으로 데이터를 복구할 수 없다.

```sql
TRUNCATE table_name;
```

## DROP

`DROP`은 테이블 자체를 삭제하는 방식이다.
테이블을 삭제하면 테이블의 구조와 데이터 모두 삭제된다.
`DROP` 또한 `COMMIT`을 자동으로 실행하기에 `ROLLBACK`으로 데이터를 복구할 수 없다.

```sql
DROP table_name;
```

[//]: # (SELECT FOR UPDATE 가 배타락인지)