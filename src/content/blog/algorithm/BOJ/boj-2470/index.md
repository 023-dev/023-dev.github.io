---
visible: false
title: "2470 두 용액"
date: 2025-01-17 18:00:00
tags: 
  - Algorithm
---


## 두 용액
[백준 2470번 두 용액](https://www.acmicpc.net/problem/2470)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 1 초   | 128 MB | 69612 | 22739 | 16419 | 31.602% |

### 문제

KOI 부설 과학연구소에서는 많은 종류의 산성 용액과 알칼리성 용액을 보유하고 있다. 
각 용액에는 그 용액의 특성을 나타내는 하나의 정수가 주어져있다. 
산성 용액의 특성값은 1부터 1,000,000,000까지의 양의 정수로 나타내고, 알칼리성 용액의 특성값은 -1부터 -1,000,000,000까지의 음의 정수로 나타낸다.<br>

같은 양의 두 용액을 혼합한 용액의 특성값은 혼합에 사용된 각 용액의 특성값의 합으로 정의한다. 
이 연구소에서는 같은 양의 두 용액을 혼합하여 특성값이 0에 가장 가까운 용액을 만들려고 한다.<br>

예를 들어, 주어진 용액들의 특성값이 [-2, 4, -99, -1, 98]인 경우에는 
특성값이 -99인 용액과 특성값이 98인 용액을 혼합하면 특성값이 -1인 용액을 만들 수 있고, 
이 용액이 특성값이 0에 가장 가까운 용액이다. 
참고로, 두 종류의 알칼리성 용액만으로나 혹은 두 종류의 산성 용액만으로 특성값이 0에 가장 가까운 혼합 용액을 만드는 경우도 존재할 수 있다.<br>

산성 용액과 알칼리성 용액의 특성값이 주어졌을 때, 
이 중 두 개의 서로 다른 용액을 혼합하여 특성값이 0에 가장 가까운 용액을 만들어내는 두 용액을 찾는 프로그램을 작성하시오.<br>

### 입력

첫째 줄에는 전체 용액의 수 N이 입력된다. 
N은 2 이상 100,000 이하이다. 
둘째 줄에는 용액의 특성값을 나타내는 N개의 정수가 빈칸을 사이에 두고 주어진다. 
이 수들은 모두 -1,000,000,000 이상 1,000,000,000 이하이다. 
N개의 용액들의 특성값은 모두 다르고, 산성 용액만으로나 알칼리성 용액만으로 입력이 주어지는 경우도 있을 수 있다.

### 출력

첫째 줄에 특성값이 0에 가장 가까운 용액을 만들어내는 두 용액의 특성값을 출력한다. 
출력해야 하는 두 용액은 특성값의 오름차순으로 출력한다. 
특성값이 0에 가장 가까운 용액을 만들어내는 경우가 두 개 이상일 경우에는 그 중 아무것이나 하나를 출력한다.

---

## 풀이

이 문제는 특성값이 주어진 용액들의 배열에서 두 용액의 합이 0에 가장 가까운 조합을 찾는 것으로, 
정렬과 투 포인터(two pointers) 알고리즘을 활용해 효율적으로 해결한다. 
먼저 입력된 용액 배열을 오름차순으로 정렬하여 값의 크기 순서를 보장한 후, 
배열의 양 끝에서 시작하는 두 포인터를 사용해 합을 계산한다. 
합이 음수면 왼쪽 포인터를 증가시켜 더 큰 값을 탐색하고, 
양수면 오른쪽 포인터를 감소시켜 더 작은 값을 탐색하며, 
각 단계에서 0에 가장 가까운 합을 갱신한다. 
이를 위해 `Liquid`와 `Liquids`라는 두 개의 클래스를 설계하여 데이터를 추상화하고, 각 클래스에 책임을 명확히 분배했다. 
`Liquid` 클래스는 용액의 특성값과 관련된 단일 값 동작(sum, compareTo)을 담당하며, 
`Liquids` 클래스는 모든 용액의 정렬 및 최적 조합을 찾는 논리를 포함한다. 

```java
package test.code;


import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

class Liquid implements Comparable<Liquid> {
    private final long value;

    private Liquid (long value) {
        this.value = value;
    }

    public static Liquid of (long value) {
        return new Liquid(value);
    }

    @Override
    public int compareTo(Liquid other) {
        return Long.compare(this.value, other.value);
    }

    public long sum(Liquid other) {
        return Long.sum(this.value, other.value);
    }

    @Override
    public String toString() {
        return String.valueOf(value);
    }
}

class Liquids {
    private final List<Liquid> liquids;

    private Liquids (List<Liquid> liquids) {
        this.liquids = liquids;
        Collections.sort(this.liquids);
    }

    public static Liquids of(List<Liquid> liquids) {
        return new Liquids(liquids);
    }

    public void printPair() {
        Liquid[] liquidsPair = getPair();
        System.out.println(liquidsPair[0] + " " + liquidsPair[1]);
    }

    private Liquid[] getPair() {
        int left = 0;
        int right = liquids.size() - 1;
        long min = Long.MAX_VALUE;
        Liquid[] pair = new Liquid[2];
        while (left < right) {
            Liquid leftLiquid = liquids.get(left);
            Liquid rightLiquid = liquids.get(right);
            long sum = leftLiquid.sum(rightLiquid);

            if (isOptimal(sum, min)) {
                min = sum;
                pair[0] = leftLiquid;
                pair[1] = rightLiquid;
            }

            if (sum < 0) {
                left++;
            } else if (sum > 0){
                right--;
            } else {
                break;
            }
        }
        return pair;
    }

    private boolean isOptimal(long sum, long min) {
        return Math.abs(sum) < Math.abs(min);
    }

}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

        int number = Integer.parseInt(reader.readLine());

        List<Liquid> liquidList = Arrays.stream(reader.readLine().split(" "))
                .map(Long::parseLong)
                .map(Liquid::of)
                .collect(Collectors.toList());

        Liquids.of(liquidList).printPair();
    }
}
```