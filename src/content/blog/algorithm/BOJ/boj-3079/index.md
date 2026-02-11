---
visible: false
title: "3079 입국심사"
date: 2025-01-21 10:00:00
tags: 
  - Algorithm
---

## 입국심사
[백준 3079번 입국심사](https://www.acmicpc.net/problem/3079)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 1 초   | 128 MB | 30872 | 6229 | 4072 | 23.719% |

### 문제

상근이와 친구들은 오스트레일리아로 여행을 떠났다. 
상근이와 친구들은 총 $M$명이고, 지금 공항에서 한 줄로 서서 입국심사를 기다리고 있다. 
입국심사대는 총 $N$개가 있다. 
각 입국심사관이 심사를 하는데 걸리는 시간은 사람마다 모두 다르다. 
$k$번 심사대에 앉아있는 심사관이 한 명을 심사를 하는데 드는 시간은 $T_{k}$이다.<br>

가장 처음에 모든 심사대는 비어있고, 심사를 할 준비를 모두 끝냈다. 
상근이와 친구들은 비행기 하나를 전세내고 놀러갔기 때문에, 지금 심사를 기다리고 있는 사람은 모두 상근이와 친구들이다. 
한 심사대에서는 한 번에 한 사람만 심사를 할 수 있다. 
가장 앞에 서 있는 사람은 비어있는 심사대가 보이면 거기로 가서 심사를 받을 수 있다. 
하지만 항상 이동을 해야 하는 것은 아니다. 
더 빠른 심사대의 심사가 끝나길 기다린 다음에 그 곳으로 가서 심사를 받아도 된다.<br>

상근이와 친구들은 모두 컴퓨터 공학과 학생이기 때문에, 
어떻게 심사를 받으면 모든 사람이 심사를 받는데 걸리는 시간이 최소가 될지 궁금해졌다.<br>

예를 들어, 두 심사대가 있고, 
심사를 하는데 걸리는 시간이 각각 7초와 10초라고 하자. 
줄에 서 있는 사람이 6명이라면, 
가장 첫 두 사람은 즉시 심사를 받으러 가게 된다. 
7초가 되었을 때, 첫 번째 심사대는 비어있게 되고, 
세 번째 사람이 그곳으로 이동해서 심사를 받으면 된다. 
10초가 되는 순간, 네 번째 사람이 이곳으로 이동해서 심사를 받으면 되고, 
14초가 되었을 때는 다섯 번째 사람이 첫 번째 심사대로 이동해서 심사를 받으면 된다. 
20초가 되었을 때, 두 번째 심사대가 비어있게 된다. 
하지만, 여섯 번째 사람이 그 곳으로 이동하지 않고, 
1초를 더 기다린 다음에 첫 번째 심사대로 이동해서 심사를 받으면, 
모든 사람이 심사를 받는데 걸리는 시간이 28초가 된다. 
만약, 마지막 사람이 1초를 더 기다리지않고, 
첫 번째 심사대로 이동하지 않았다면, 
모든 사람이 심사를 받는데 걸리는 시간이 30초가 되게 된다.

상근이와 친구들이 심사를 받는데 걸리는 시간의 최솟값을 구하는 프로그램을 작성하시오.

### 입력

첫째 줄에 $N$과 $M$이 주어진다. ($1 ≤ N ≤ 100,000$, $1 ≤ M ≤ 1,000,000,000$)

다음 $N$개 줄에는 각 심사대에서 심사를 하는데 걸리는 시간인 $Tk$가 주어진다. ($1 ≤ T_{k} ≤ 10^9$)

### 출력

첫째 줄에 상근이와 친구들이 심사를 마치는데 걸리는 시간의 최솟값을 출력한다.

---

## 풀이

문제의 시간 제한은 1초이다.
문제를 보면 최적화 문제로 보인다.
그래서 주어진 사람 수에 대한 이미그레이션 심사를 하는 가장 최적의 시간을 구하라는 문제로 해석했다.
입력으로 주어지는 개수는 최대값을 보면 $1,000,000,000$개이다.
대충 어디에 정확히 사용할 지 모르지만 `long`으로 변수 초기화를 하면 될 것 같다는 생각을 했다.
값이 많은 상태에서 최적화된 값을 도출하라는 문제의 특성을 보고 바로 이진 탐색을 이용하면 될 것 같았다.
그리고 최솟값을 위한 최적화이기에 `Lower Bound`를 사용하면 될 것 같았다.

```java
package test.code;

import java.io.*;
import java.util.*;

class Immigration {
    private final long friends;
    private final long[] times;

    private Immigration (long friends, long[] times) {
        this.friends = friends;
        Arrays.sort(times);
        this.times = times;
    }

    public static Immigration of (long friends, long[] times) {
        return new Immigration(friends, times);
    }

    public long getMinimumTime () {
        long left = 1;
        long right = (long) times[times.length - 1] * friends;
        long result = 0;
        while (left <= right) {
            long mid = (left + right) / 2;
            long checked = 0;

            for (long time : times) {
                checked += mid / time;
                if (checked >= friends) {
                    break;
                }
            }

            if (checked >= friends) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return result;
    }

}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int checkpoints = Integer.parseInt(tokenizer.nextToken());
        long friends = Long.parseLong(tokenizer.nextToken());

        long[] times = new long[checkpoints];
        for (int i = 0; i < checkpoints; i++) {
            times[i] = Long.parseLong(reader.readLine());
        }
        reader.close();

        long result =Immigration.of(friends, times).getMinimumTime();

        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));
        writer.write(result + "\n");
        writer.flush();
        writer.close();
    }
}
```