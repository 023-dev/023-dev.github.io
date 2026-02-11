---
visible: false
title: "제약 조건(Constraints)"
date: 2025-01-09 00:00:00
tags: 
  - Database
---


## 제약 조건(Constraints)
제약 조건이란 데이터의 무결성을 보장하기 위해, 데이터베이스에 저장되는 데이터의 논리적인 조건을 의미한다.
이러한 제약 조건은 `CREATE TABLE`문을 사용하여 테이블을 생성할 때나,
`ALTER TABLE`문을 사용하여 테이블을 생성한 후에 제약조건을 지정할 수 있다.
이와 같은 DDL(Data Definition Language) 문을 사용하여 테이블에 설정할 수 있다.

```sql
CREATE TABLE table_name (
    column_name data_type CONSTRAINT constraint_name constraint_type
);
```

## NOT NULL
`NOT NULL` 제약 조건은 특정 컬럼에 NULL 값을 허용하지 않도록 설정하는 제약 조건이다.
테이블의 필드를 `NOT NULL`로 설정하면, 해당 필드에는 `NULL` 값의 저장을 허용하지 않는다.

```sql
CREATE TABLE table_name (
    column_name data_type NOT NULL
);
```

```sql
ALTER TABLE table_name ADD CONSTRAINT constraint_name NOT NULL (column_name); -- ALTER TABLE 문을 사용하여 제약 조건 추가
ALTER TABLE table_name MODIFY column_name data_type NOT NULL; -- ALTER TABLE 문을 사용하여 제약 조건 수정
```

## UNIQUE

`UNIQUE` 제약 조건은 특정 컬럼에 중복된 값을 허용하지 않도록 설정하는 제약 조건이다.
이 제약 조건은 테이블의 각 행을 고유하게 식별하는데 사용된다.
즉, 특정 열의 경우 모든 행은 고유한 값을 가져야 한다.

```sql
CREATE TABLE table_name (
    column_name data_type UNIQUE -- 테이블 생성 시 제약 조건 추가
);
```

```sql
CREATE TABLE table_name (
    column_name data_type,
    CONSTRAINT constraint_name UNIQUE (column_name) -- 테이블 생성 시 제약 조건 추가 및 제약 이름 설정
);
```

```sql
ALTER TABLE table_name ADD column_name data_type UNIQUE; -- 이름 설정 불가
ALTER TABLE table_name ADD CONSTRAINT constraint_name UNIQUE (column_name); -- 이름 설정 가능
```

`UNIQUE` 제약 조건을 설정하면, 해당 필드는 자동으로 보조 인덱스(INDEX)가 생성된다.
만일 제약 조건에 이름을 설정하면, 다음과 같은 쿼리로 해당 제약 조건을 삭제할 수 있다.

```sql
ALTER TABLE table_name DROP INDEX constraint_name;
DROP INDEX constraint_name ON table_name;
```

## PRIMARY KEY
`PRIMARY KEY` 제약 조건은 테이블의 각 행을 고유하게 식별하는데 사용되는 제약 조건이다.
테이블의 필드가 기본 키인 경우 필드는 `NULL` 값을 포함할 수 없으며 모든 행은 이 필드에 대해 고유한 값을 가져야 한다.
즉, `PRIMARY KEY` 제약 조건은 `UNIQUE` 제약 조건과 `NOT NULL` 제약 조건을 모두 포함한다.
테이블은 기본 키로 하나의 필드만 가질 수 있다.

```sql
CREATE TABLE table_name (
    column_name data_type PRIMARY KEY -- 테이블 생성 시 제약 조건 추가
);
```

```sql
CREATE TABLE table_name (
    column_name data_type,
    CONSTRAINT constraint_name PRIMARY KEY (column_name) -- 테이블 생성 시 제약 조건 추가 및 제약 이름 설정
);
```

```sql
ALTER TABLE table_name ADD column_name data_type PRIMARY KEY; -- 이름 설정 불가
ALTER TABLE table_name ADD CONSTRAINT constraint_name PRIMARY KEY (column_name); -- 이름 설정 가능
```

## FOREIGN KEY
`FOREIGN KEY` 제약 조건은 참조하는 테이블의 기본 키를 참조하는 필드이다.
이때 반드시 `UNIQUE`나 `PRIMARY KEY` 제약 조건이 설정되어 있어야 한다.
일반적으로 이렇게 테이블 간에 일종의 관계를 만든다.

```sql
CREATE TABLE table_name (
    column_name data_type,
    CONSTRAINT constraint_name FOREIGN KEY (column_name) REFERENCES another_table_name (another_column_name) -- 테이블 생성 시 제약 조건 추가 및 제약 이름 설정
);
```

```sql
ALTER TABLE table_name 
    ADD CONSTRAINT constraint_name FOREIGN KEY (column_name) REFERENCES another_table_name (another_column_name); -- 이름 설정 가능
```

## CHECK
`CHECK` 제약 조건은 특정 컬럼에 저장할 수 있는 값의 범위를 제한하는 제약 조건이다.

```sql
CREATE TABLE table_name (
    column_name data_type CHECK (condition) -- 테이블 생성 시 제약 조건 추가
);
```

```sql
CREATE TABLE table_name (
    column_name data_type,
    CONSTRAINT constraint_name CHECK (condition) -- 테이블 생성 시 제약 조건 추가 및 제약 이름 설정
);
```

```sql
ALTER TABLE table_name ADD column_name data_type CHECK (condition); -- 이름 설정 불가
ALTER TABLE table_name ADD CONSTRAINT constraint_name CHECK (condition); -- 이름 설정 가능
```

## DEFAULT
`DEFAULT` 제약 조건은 특정 컬럼에 기본값을 설정하는 제약 조건이다.
이 제약 조건은 특정 컬럼에 값을 입력하지 않았을 때, 자동으로 설정된 기본값이 입력된다.

```sql
CREATE TABLE table_name (
    column_name data_type DEFAULT default_value -- 테이블 생성 시 제약 조건 추가
);
```

```sql
ALTER TABLE table_name ADD column_name data_type DEFAULT default_value; -- 이름 설정 불가
```

## ON DELETE / ON UPDATE
`ON DELETE`와 `ON UPDATE` 제약 조건은 외래 키 제약 조건을 설정할 때 사용된다.
`ON DELETE` 제약 조건은 참조하는 테이블의 행이 삭제될 때, 참조하는 테이블의 행에 대한 처리 방법을 설정한다.
반면, `ON UPDATE` 제약 조건은 참조하는 테이블의 행이 업데이트될 때, 참조하는 테이블의 행에 대한 처리 방법을 설정한다.

이때 참조한고 있는 테이블의 동작은 다음 키워드를 사용하여 `FOREIGN KEY` 제약 조건을 설정할 때 설정할 수 있다.

```sql
CREATE TABLE table_name (
    column_name data_type,
    CONSTRAINT constraint_name FOREIGN KEY (column_name) REFERENCES another_table_name (another_column_name) ON DELETE action ON UPDATE action -- 테이블 생성 시 제약 조건 추가 및 제약 이름 설정
);
```

```sql
ALTER TABLE table_name 
    ADD CONSTRAINT constraint_name FOREIGN KEY (column_name) REFERENCES another_table_name (another_column_name) ON DELETE action ON UPDATE action; -- 이름 설정 가능
```

설정할 수 있는 `action`은 다음과 같다.

- `CASCADE`: 참조하는 테이블의 행이 삭제되거나 업데이트될 때, 참조하는 테이블의 행도 삭제되거나 업데이트된다.
- `SET NULL`: 참조하는 테이블의 행이 삭제되거나 업데이트될 때, 참조하는 테이블의 행의 외래 키 값을 `NULL`로 설정한다.
- `SET DEFAULT`: 참조하는 테이블의 행이 삭제되거나 업데이트될 때, 참조하는 테이블의 행의 외래 키 값을 기본값으로 설정한다.
- `RESTRICT`: 참조하는 테이블의 행이 삭제되거나 업데이트될 때, 참조하는 테이블의 행이 삭제되거나 업데이트되지 않는다.
- `NO ACTION`: `RESTRICT`와 동일한 동작을 수행한다.

```sql
CREATE TABLE table_name (
    column_name data_type,
    CONSTRAINT constraint_name FOREIGN KEY (column_name) REFERENCES another_table_name (another_column_name) ON DELETE CASCADE ON UPDATE CASCADE -- 테이블 생성 시 제약 조건 추가 및 제약 이름 설정
);
```

## CASCADE
`CASCADE` 제약 조건은 참조하는 테이블의 행이 삭제되거나 업데이트될 때, 참조하는 테이블의 행도 삭제되거나 업데이트 하게 하여 참조 무결성을 유지한다.

```sql
CREATE TABLE table_name (
    column_name data_type,
    CONSTRAINT constraint_name FOREIGN KEY (column_name) REFERENCES another_table_name (another_column_name) ON DELETE CASCADE ON UPDATE CASCADE -- 테이블 생성 시 제약 조건 추가 및 제약 이름 설정
);
```

하지만, `CASCADE` 제약 조건은 데이터의 무결성 유지하는데 유용하지만 위협할 수 있으므로 주의해서 사용해야 한다.
대표적인 예로, 부모 테이블의 행이 삭제되면 자식 테이블의 행도 삭제되는데, 이러한 경우 데이터 손실이 발생할 수 있다.