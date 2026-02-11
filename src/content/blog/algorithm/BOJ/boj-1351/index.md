---
visible: false
title: "1351 무한 수열"
date: 2025-02-21 18:00:00
tags: 
  - Algorithm
---


## 무한 수열

[백준 1351번 무한 수열](https://www.acmicpc.net/problem/1351)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 14823 | 5677 | 4656 | 37.554% |

### 문제

무한 수열 A는 다음과 같다.

- $A_{0} = 1$
- $A_{i} = A_{⌊i/P⌋} + A_{⌊i/Q⌋} (i ≥ 1)$

$N$, $P$와 $Q$가 주어질 때, $A_{N}$을 구하는 프로그램을 작성하시오.

### 입력

첫째 줄에 3개의 정수 $N, P, Q$가 주어진다.

### 출력

첫째 줄에 $A_{N}$을 출력한다.

### 제한

- $0 ≤ N ≤ 10^{12}$
- $2 ≤ P, Q ≤ 10^{9}$

---

## 풀이

이 문제를 풀 때 먼저 주어진 점화식을 그대로 재귀로 구현하면 N이 매우 커질 경우 중복 연산이 많아져 비효율적이라는 점을 깨달았다. 따라서 메모이제이션을 활용한 동적 계획법(DP) 을 적용하여 이미 계산된 값은 저장하고 재사용하는 방식으로 접근했다. 하지만 N이 10¹²까지 가능하므로 배열 대신 해시맵(HashMap) 을 사용해야 했고, 결과적으로 기존 구현보다 약 2~3배 빠르게 실행되어 최적화 효과를 확실히 볼 수 있었다.

```java
import java.util.HashMap;
import java.util.Scanner;

public class Main {
    static HashMap<Long, Long> memozation = new HashMap<>();
    public static long getA(long n, long p, long q) {
        if (n == 0) return 1;
        if (memozation.containsKey(n)) return memozation.get(n);
        long result = getA(n / p, p, q) + getA(n / q, p, q);
        memozation.put(n, result);
        return result;
    }
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        long N = scanner.nextLong();
        long P = scanner.nextLong();
        long Q = scanner.nextLong();
        scanner.close();

        System.out.println(getA(N, P, Q));
    }
}
```