---
visible: false
title: "트랜잭션의 격리 수준(Transaction Isolation Level)"
date: 2025-01-31 00:00:00
tags: 
  - Database
---

트랜잭션 격리 수준은 동시에 실행되는 여러 트랜잭션 간의 상호 영향을 제어하는 수준을 말한다.
ANSI 표준에서 트랜잭션 격리 수준은 READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE으로 총 네 가지로 구분된다.
레벨이 높아질수록 트랜잭션간 고립 정도가 높아지며, 성능이 떨어지는 것이 일반적이다.
그래서 일반적인 서비스에서는 READ COMMITTED나 REPEATABLE READ 중 하나의 레벨을 사용하는 것이 일반적이다.
실제로 MySQL에서는 REPEATABLE READ가 기본 격리 수준으로 설정되어 있다.

### SERIALIZABLE

SERIALIZABLE은 가장 엄격한 격리 수준으로, 이름 그대로 트랜잭션을 순차적으로 진행시킨다. 
SERIALIZABLE에서 여러 트랜잭션이 동일한 레코드에 동시 접근할 수 없으므로, 어떠한 데이터 부정합 문제도 발생하지 않는다. 
하지만 트랜잭션이 순차적으로 처리되어야 하므로 동시 처리 성능이 매우 떨어진다.
MySQL에서 SELECT FOR SHARE/UPDATE는 대상 레코드에 각각 읽기/쓰기 잠금을 거는 것이다. 
하지만 순수한 SELECT 작업은 아무런 레코드 잠금 없이 실행되는데, 잠금 없는 일관된 읽기(Non-locking consistent read)란 순수한 SELECT 문을 통한 잠금 없는 읽기를 의미하는 것이다.
하지만 SERIALIZABLE 격리 수준에서는 순수한 SELECT 작업에서도 대상 레코드에 넥스트 키 락을 읽기 잠금(공유락, Shared Lock)으로 건다. 
따라서 한 트랜잭션에서 넥스트 키 락이 걸린 레코드를 다른 트랜잭션에서는 절대 추가/수정/삭제할 수 없다. 
SERIALIZABLE은 가장 안전하지만 가장 성능이 떨어지므로, 극단적으로 안전한 작업이 필요한 경우가 아니라면 사용해서는 안된다.


### REPEATABLE READ

일반적인 RDBMS는 변경 전의 레코드를 언두 공간에 백업해둔다.
그러면 변경 전/후 데이터가 모두 존재하므로, 동일한 레코드에 대해 여러 버전의 데이터가 존재한다고 하여 이를 MVCC(Multi-Version Concurrency Control, 다중 버전 동시성 제어)라고 부른다. 
MVCC를 통해 트랜잭션이 롤백된 경우에 데이터를 복원할 수 있을 뿐만 아니라, 서로 다른 트랜잭션 간에 접근할 수 있는 데이터를 세밀하게 제어할 수 있다. 
각각의 트랜잭션은 순차 증가하는 고유한 트랜잭션 번호가 존재하며, 백업 레코드에는 어느 트랜잭션에 의해 백업되었는지 트랜잭션 번호를 함께 저장한다. 
그리고 해당 데이터가 불필요해진다고 판단하는 시점에 주기적으로 백그라운드 쓰레드를 통해 삭제한다.

REPEATABLE READ는 MVCC를 이용해 한 트랜잭션 내에서 동일한 결과를 보장하지만, 새로운 레코드가 추가되는 경우에 부정합이 생길 수 있다.
이를 Phantom Read라고 하는데, 이는 한 트랜잭션에서 동일한 쿼리를 두 번 실행했을 때, 두 번째 실행에서는 새로 추가된 레코드가 조회되는 현상을 말한다.

MySQL에서 그러나 MySQL에서는 갭 락(Gap Lock)과 넥스트 키 락(Next-Key Lock)을 사용하여 유령 읽기 문제를 방지 하므로,
실제로 MySQL에서는 REPEATABLE READ에서도 Phantom Read가 발생하지 않는다.

### READ COMMITTED

READ COMMITTED 격리 수준은 커밋한 데이터만 조회할 수 있는 격리 수준이다.
READ COMMITTED에서 발생하는 트랜잭션 수행중에 다른 트랜잭션이 변경하고 커밋한 데이터를 조회할 수 있는데,

**반복적으로 같은 데이터를 읽을 수 없는 NON-REPEATABLE READ 현상이 발생합니다**

### READ UNCOMMITTED

READ UNCOMMITTED 격리 수준은 가장 낮은 수준의 격리 수준으로 커밋하지 않은 변경 데이터에 접근할 수 있는 격리 수준이다.
다른 트랜잭션으 작업이 커밋 또는 롤백되지 않아도 조회할 수 있게 된다.
이렇게 어떤 트랜잭션의 작업이 완료되지 않았는데도, 다른 트랜잭션에서 볼 수 있는 부정합 문제를 Dirty Read 라고 한다.
Dirty Read는 데이터가 조회되었다가 사라지는 현상을 초래하므로 시스템에 상당한 혼란을 주게 된다.
그래서 READ UNCOMMITTED는 RDBMS 표준에서 인정하지 않을 정도로 정합성에 문제가 많은 격리 수준이다.
따라서 MySQL을 사용한다면 최소한 READ COMMITTED 이상의 격리 수준을 사용해야 한다.

## 참고

[1] [MangKyu Blog](https://mangkyu.tistory.com/17)
    [+](https://mangkyu.tistory.com/300)
[2] [hudi.blog](https://hudi.blog/transaction-isolation-level/)