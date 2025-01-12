---
layout: post
title: "LIMIT & OFFSET"
author: "023"
comments: true
tags: MySQL
excerpt_separator: <!--more-->
---

## LIMIT
`LIMIT` 절은 쿼리 결과에서 지정한 행 수만 레코드를 제한하여 가져오는데 사용한다.

```sql
SELECT * FROM table_name LIMIT 10;
```

위의 쿼리는 `table_name` 테이블에서 10개의 레코드만 가져온다.
이때 MySQL의 `LIMIT` 절은 항상 쿼리의 마지막에 실행된다.

`LIMIT` 절은 두 개의 인수를 가질 수 있다.
첫 번째 인수는 가져올 레코드의 시작 위치를 나타내며, 두 번째 인수는 가져올 레코드의 수를 나타낸다.

```sql
SELECT * FROM table_name LIMIT 5, 10;
```

위의 쿼리는 `table_name` 테이블에서 6번째부터 15번째까지의 레코드를 가져온다.

## OFFSET

`OFFSET` 절은 `LIMIT` 절과 함께 사용되어, 결과에서 지정한 행 수만큼 건너뛴 후 레코드를 가져오는데 사용된다.

```sql
SELECT * FROM table_name LIMIT 5 OFFSET 10;
```

위의 쿼리는 `table_name` 테이블에서 11번째부터 15번째까지의 레코드를 가져온다.

`OFFSET` 절은 `LIMIT` 절과 함께 사용되어야 하며, `LIMIT` 절보다 먼저 사용될 수 없다.

## Pagination

`LIMIT`과 `OFFSET`을 사용하면 페이지네이션을 구현할 수 있다.
예를 들어, 한 페이지에 10개의 레코드를 보여주고 싶다면, 다음과 같이 쿼리를 작성할 수 있다.

```sql
SELECT * FROM table_name LIMIT 0, 10;
```

다음 페이지를 보여주고 싶다면, `OFFSET`을 사용하여 다음 페이지의 레코드를 가져올 수 있다.

```sql
SELECT * FROM table_name LIMIT 10, 10;
```

이렇게 `LIMIT`과 `OFFSET`을 사용하면 페이지네이션을 쉽게 구현할 수 있다.

## No OFFSET

`LIMIT`을 사용할 때 주의 해야 할 것이 있는데 `LIMIT` 절의 `OFFSET`이 큰 경우 성능이 저하될 수 있다.

```sql
SELECT * FROM table_name LIMIT 0, 10; -- 10 rows in 0.0001 seconds
SELECT * FROM table_name LIMIT 1000000, 10; -- 10 rows in 0.1 seconds
```

위의 쿼리는 `table_name` 테이블에서 1,000,000번째부터 1,000,010번째까지의 레코드를 가져온다.
이때 `OFFSET`이 큰 경우 MySQL은 `OFFSET`만큼의 레코드를 건너뛴 후 결과를 가져오기 때문에 성능이 저하될 수 있다.

따라서 `LIMIT`을 사용할 때는 `OFFSET`을 최대한 작게 사용하는 것이 좋다.
즉, `LIMIT 0, 10`과 같이 `OFFSET`을 0으로 설정하는 것이 좋다.

```sql
SELECT * FROM table_name WHERE id < 1000000 ORDER BY id DESC LIMIT 10; -- 10 rows in 0.0001 seconds
```

위의 쿼리는 `table_name` 테이블에서 `id`가 1,000,000보다 작은 레코드를 가져온다.
이렇게 `WHERE` 절을 사용하여 `OFFSET`을 최대한 작게 사용하면 성능을 향상시킬 수 있다.
