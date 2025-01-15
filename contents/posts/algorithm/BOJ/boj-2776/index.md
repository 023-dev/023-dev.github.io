---
title: "2776 암기왕"
date: 2024-11-05 18:00:00
tags: 
  - Algorithm
---

## 문제
[암기왕](https://www.acmicpc.net/problem/2776)

![](img.png)

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