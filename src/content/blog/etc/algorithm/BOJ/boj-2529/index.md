---
visible: false
title: "2529 부등호"
date: 2025-02-05 18:00:00
tags: 
  - Algorithm
---


## 부등호

[백준 2529번 부등호](https://www.acmicpc.net/problem/2529)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 1 초   | 256 MB | 30616 | 18053 | 12272 | 57.980% |

### 문제

두 종류의 부등호 기호 ‘<’와 ‘>’가 k개 나열된 순서열 A가 있다. 우리는 이 부등호 기호 앞뒤에 서로 다른 한 자릿수 숫자를 넣어서 모든 부등호 관계를 만족시키려고 한다. 예를 들어, 제시된 부등호 순서열 A가 다음과 같다고 하자.

$$A ⇒ < < < > < < > < >$$

부등호 기호 앞뒤에 넣을 수 있는 숫자는 0부터 9까지의 정수이며 선택된 숫자는 모두 달라야 한다. 아래는 부등호 순서열 A를 만족시키는 한 예이다.

$$3 < 4 < 5 < 6 > 1 < 2 < 8 > 7 < 9 > 0$$

이 상황에서 부등호 기호를 제거한 뒤, 숫자를 모두 붙이면 하나의 수를 만들 수 있는데 이 수를 주어진 부등호 관계를 만족시키는 정수라고 한다. 그런데 주어진 부등호 관계를 만족하는 정수는 하나 이상 존재한다. 예를 들어 3456128790 뿐만 아니라 5689023174도 아래와 같이 부등호 관계 A를 만족시킨다.

$$5 < 6 < 8 < 9 > 0 < 2 < 3 > 1 < 7 > 4$$

여러분은 제시된 k개의 부등호 순서를 만족하는 (k+1)자리의 정수 중에서 최댓값과 최솟값을 찾아야 한다. 앞서 설명한 대로 각 부등호의 앞뒤에 들어가는 숫자는 { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 }중에서 선택해야 하며 **선택된 숫자는 모두 달라야 한다.**

### 입력

첫 줄에 부등호 문자의 개수를 나타내는 정수 k가 주어진다. 그 다음 줄에는 k개의 부등호 기호가 하나의 공백을 두고 한 줄에 모두 제시된다. k의 범위는 $2 ≤ k ≤ 9$ 이다.

### 출력

여러분은 제시된 부등호 관계를 만족하는 k+1 자리의 최대, 최소 정수를 첫째 줄과 둘째 줄에 각각 출력해야 한다. 단 아래 예(1)과 같이 첫 자리가 0인 경우도 정수에 포함되어야 한다. 모든 입력에 답은 항상 존재하며 출력 정수는 하나의 문자열이 되도록 해야 한다.

---

## 풀이

이 문제를 풀면서 백트래킹(Backtracking)의 강력함을 다시 한번 실감했다. 처음에는 단순한 DFS 탐색 문제처럼 보였지만, 숫자의 중복 방지와 부등호 조건을 충족하는지 검사하는 부분이 핵심이었다. 특히, 탐색 과정에서 visited 배열을 활용하여 불필요한 중복을 막고, 조건을 만족하지 않는 경우 즉시 백트래킹하는 방식이 탐색 공간을 효과적으로 줄이는 데 도움이 되었다. 또한, k가 최대 9로 제한되어 있어 완전 탐색이 가능하다는 점도 문제 해결 전략을 세우는 데 중요한 요소였다. 탐색이 끝난 후 모든 가능한 숫자 조합을 정렬하여 최댓값과 최솟값을 구하는 방식은 직관적이었고, 결과적으로 문제를 깔끔하게 해결할 수 있었다.

```java
import java.util.*;

class InequalityChecker {
    private final char[] signs;

    public InequalityChecker(char[] signs) {
        this.signs = signs;
    }

    public boolean isValid(int left, int right, int index) {
        if (signs[index] == '<') return left < right;
        if (signs[index] == '>') return left > right;
        return false;
    }
}

class NumberGenerator {
    private final int k;
    private final InequalityChecker checker;
    private final List<String> results = new ArrayList<>();
    private final boolean[] visited = new boolean[10];

    public NumberGenerator(int k, char[] signs) {
        this.k = k;
        this.checker = new InequalityChecker(signs);
    }

    public void generate() {
        dfs("", 0);
    }

    private void dfs(String num, int depth) {
        if (depth == k + 1) {
            results.add(num);
            return;
        }

        for (int i = 0; i < 10; i++) {
            if (!visited[i]) {
                if (depth == 0 || checker.isValid(num.charAt(depth - 1) - '0', i, depth - 1)) {
                    visited[i] = true;
                    dfs(num + i, depth + 1);
                    visited[i] = false;
                }
            }
        }
    }

    public String getMaxNumber() {
        return Collections.max(results);
    }

    public String getMinNumber() {
        return Collections.min(results);
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int k = sc.nextInt();
        char[] signs = new char[k];

        for (int i = 0; i < k; i++) {
            signs[i] = sc.next().charAt(0);
        }

        NumberGenerator generator = new NumberGenerator(k, signs);
        generator.generate();

        System.out.println(generator.getMaxNumber());
        System.out.println(generator.getMinNumber());
    }
}
```