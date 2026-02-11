---
visible: false
title: "2776 암기왕"
date: 2025-01-13 18:00:00
tags: 
  - Algorithm
---

## 암기왕
[백준 2776번 암기왕](https://www.acmicpc.net/problem/2776)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 256 MB | 34230 | 11755 | 7914 | 32.139% |

### 문제

연종이는 엄청난 기억력을 가지고 있다. 
그래서 하루 동안 본 정수들을 모두 기억 할 수 있다. 
하지만 이를 믿을 수 없는 동규는 그의 기억력을 시험해 보기로 한다. 
동규는 연종을 따라 다니며, 연종이 하루 동안 본 정수들을 모두 ‘수첩1’에 적어 놓았다. 
그것을 바탕으로 그가 진짜 암기왕인지 알아보기 위해, 동규는 연종에게 M개의 질문을 던졌다. 
질문의 내용은 “X라는 정수를 오늘 본 적이 있는가?” 이다. 
연종은 막힘없이 모두 대답을 했고, 동규는 연종이 봤다고 주장하는 수 들을 ‘수첩2’에 적어 두었다. 
집에 돌아온 동규는 답이 맞는지 확인하려 하지만, 연종을 따라다니느라 너무 힘들어서 여러분에게 도움을 요청했다. 
동규를 도와주기 위해 ‘수첩2’에 적혀있는 순서대로, 각각의 수에 대하여, ‘수첩1’에 있으면 1을, 없으면 0을 출력하는 프로그램을 작성해보자.

### 입력

첫째 줄에 테스트케이스의 개수 T가 들어온다. 
다음 줄에는 ‘수첩 1’에 적어 놓은 정수의 개수 N(1 ≤ N ≤ 1,000,000)이 입력으로 들어온다. 
그 다음 줄에  ‘수첩 1’에 적혀 있는 정수들이 N개 들어온다. 
그 다음 줄에는 ‘수첩 2’에 적어 놓은 정수의 개수 M(1 ≤ M ≤ 1,000,000) 이 주어지고, 다음 줄에 ‘수첩 2’에 적어 놓은 정수들이 입력으로 M개 들어온다. 
모든 정수들의 범위는 int 로 한다.

### 출력

‘수첩2’에 적혀있는 M개의 숫자 순서대로, ‘수첩1’에 있으면 1을, 없으면 0을 출력한다.

---

## 풀이

문제를 보면 해당 문제는 탐색 알고리즘을 사용해서 해결하라는 것을 알 수 있다.
어떤 탐색 알고리즘을 사용하냐는 시간제한과 실제 탐색해야할 개수를 보고 선택해야 한다.
내가 생각한 건 2가지 방식이다.
하나는 순차 탐색하여 해결하는 방식과 나머지 하나는 이분 탐색으로 해결하는 방식이다.
직접 탐색에 경우는 `N`과 `M`이 각가 최대 $10^6$이므로 단순히 순차 탐색(Linear Search)을 하면 최악의 경우 $O(N \times M)$의 시간이 소요된다.
이렇게 하면 $10^6 \times 10^6(ms) \approx 166(s)$이므로 시간 제한에 걸린다.
따라서, 이보다 더 빠른 $O(M \log N)$ 복잡도를 가진 이분 탐색(Binary Search)로 구현을 필요로 한다.

이분 탐색은 정렬된 배열에서만 사용해야하기에 `수첩1`의 데이터를 정렬하고 `수첩2`의 데이터를 탐색하는 코드를 구현했다.


```java
package test.code;

import java.io.*;
import java.util.*;

class Notebook {
    private final int[] numbers;

    Notebook(int count, String input, boolean shouldSort) {
        int[] numbers = new int[count];
        numbers = Arrays.stream(input.split(" ")).mapToInt(Integer::parseInt).toArray();
        if (shouldSort) {
            Arrays.sort(numbers);
        }
        this.numbers = numbers;
    }

    public static Notebook from(int count, String text, boolean shouldSort) {
        return new Notebook(count, text, shouldSort);
    }

    public int[] getNumbers() {
        return numbers;
    }

    public boolean contains(int number) {
        return Arrays.binarySearch(numbers, number) >= 0;
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        int T = Integer.parseInt(br.readLine()); // 테스트케이스 개수
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < T; i++) {
            int N = Integer.parseInt(br.readLine());
            Notebook notebook1 = Notebook.from(N, br.readLine(), true);// 수첩 1
            int M = Integer.parseInt(br.readLine());
            Notebook notebook2 = Notebook.from(M, br.readLine(), false);// 수첩 2

            StringBuilder sb = new StringBuilder();

            for(int number : notebook2.getNumbers()) {
                if(notebook1.contains(number)) {
                    sb.append(1).append("\n");
                } else {
                    sb.append(0).append("\n");
                }
            }
            result.append(sb);
        }
        System.out.println(result);
    }
}
```