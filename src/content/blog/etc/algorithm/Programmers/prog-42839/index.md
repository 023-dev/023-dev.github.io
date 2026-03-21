---
visible: false
title: "42839 소수찾기"
date: 2025-02-11 21:00:00
tags: 
  - Algorithm
---


## 입국심사

[프로그래머스 입국심사](https://school.programmers.co.kr/learn/courses/30/lessons/42839?language=java)

### 문제

한자리 숫자가 적힌 종이 조각이 흩어져있습니다. 흩어진 종이 조각을 붙여 소수를 몇 개 만들 수 있는지 알아내려 합니다.<br>
각 종이 조각에 적힌 숫자가 적힌 문자열 numbers가 주어졌을 때, 종이 조각으로 만들 수 있는 소수가 몇 개인지 return 하도록 solution 함수를 완성해주세요.

### 제한사항

- numbers는 길이 1 이상 7 이하인 문자열입니다. 
- numbers는 0~9까지 숫자만으로 이루어져 있습니다.
- "013"은 0, 1, 3 숫자가 적힌 종이 조각이 흩어져있다는 의미입니다.

### 입출력 예

| numbers	 | return |
|:---------|:-------|
| "17"	    | 3      |
| "011"	   | 2      |

### 입출력 예 설명

예제 #1<br>
[1, 7]으로는 소수 [7, 17, 71]를 만들 수 있습니다.<br>

예제 #2<br>
[0, 1, 1]으로는 소수 [11, 101]를 만들 수 있습니다.

- 11과 011은 같은 숫자로 취급합니다.

---

## 풀이

순열 + dfS 문제로, 주어진 숫자로 만들 수 있는 모든 숫자를 구한 뒤 소수인지 판별하는 문제이다. 숫자의 길이가 최대 7이므로, 순열을 이용해 모든 경우의 수를 구할 수 있다. 이후 소수인지 판별하여 카운트하면 된다.


```java
import java.util.*;

class Solution {
    static Set<Integer> set;
    static boolean[] visited = new boolean[7]; // numbers는 길이 1 이상 7 이하

    public int solution(String numbers) {
        int answer = 0;
        set = new HashSet<>();
        dfs(numbers, "", 0);

        for (Integer num : set) {
            if (isPrime(num)) {
                answer++;
            }
        }
        return answer;
    }

    public static void dfs(String numbers, String s, int depth) {
        if (depth > numbers.length()) {
            return;
        }

        for (int i = 0; i < numbers.length(); i++) {
            if(!visited[i]) {
                visited[i] = true;
                set.add(Integer.parseInt(s + numbers.charAt(i)));
                dfs(numbers ,s + numbers.charAt(i), depth + 1);
                visited[i] = false;
            }
        }
    }

    public static boolean isPrime(int n) {
        if (n < 2) {
            return false;
        }
        for (int i = 2; i <= (int) Math.sqrt(n); i++) {
            if (n % i == 0) {
                return false;
            }
        }
        return true;
    }
}
```