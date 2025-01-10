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