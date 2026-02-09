---
title: "프로그래머스 입국심사"
date: 2025-01-20 21:00:00
tags: 
  - Algorithm
---


## 입국심사

[프로그래머스 입국심사](https://programmers.co.kr/learn/courses/30/lessons/43238)

### 문제

n명이 입국심사를 위해 줄을 서서 기다리고 있습니다. 
각 입국심사대에 있는 심사관마다 심사하는데 걸리는 시간은 다릅니다.<br>

처음에 모든 심사대는 비어있습니다. 
한 심사대에서는 동시에 한 명만 심사를 할 수 있습니다. 
가장 앞에 서 있는 사람은 비어 있는 심사대로 가서 심사를 받을 수 있습니다. 
하지만 더 빨리 끝나는 심사대가 있으면 기다렸다가 그곳으로 가서 심사를 받을 수도 있습니다.<br>

모든 사람이 심사를 받는데 걸리는 시간을 최소로 하고 싶습니다.<br>

입국심사를 기다리는 사람 수 n, 
각 심사관이 한 명을 심사하는데 걸리는 시간이 담긴 배열 times가 매개변수로 주어질 때, 
모든 사람이 심사를 받는데 걸리는 시간의 최솟값을 return 하도록 solution 함수를 작성해주세요.<br>

#### 제한사항

- 입국심사를 기다리는 사람은 1명 이상 1,000,000,000명 이하입니다.
- 각 심사관이 한 명을 심사하는데 걸리는 시간은 1분 이상 1,000,000,000분 이하입니다.
- 심사관은 1명 이상 100,000명 이하입니다.

### 입출력

| n  | times   | return |
|:---|:--------|:-------|
| 6  | [7, 10] | 28     |

가장 첫 두 사람은 바로 심사를 받으러 갑니다.
7분이 되었을 때, 첫 번째 심사대가 비고 3번째 사람이 심사를 받습니다.
10분이 되었을 때, 두 번째 심사대가 비고 4번째 사람이 심사를 받습니다.
14분이 되었을 때, 첫 번째 심사대가 비고 5번째 사람이 심사를 받습니다.
20분이 되었을 때, 두 번째 심사대가 비지만 6번째 사람이 그곳에서 심사를 받지 않고,
1분을 더 기다린 후에 첫 번째 심사대에서 심사를 받으면 28분에 모든 사람의 심사가 끝납니다.

---

## 풀이

이 문제는 이진 탐색을 활용하여 해결할 수 했다. 
주어진 심사관들이 특정 시간 동안 처리할 수 있는 사람 수를 계산하고, 
이를 기준으로 심사 시간을 최소화하는 접근 방식으로 접근했다. 
먼저, 최소 시간은 1분, 최대 시간은 가장 느린 심사관이 모든 사람을 처리하는 데 걸리는 시간으로 설정하고 
이 범위에서 이진 탐색을 진행했다. 
그리고 중간 시간(mid)을 계산한 뒤, 
각 심사관이 해당 시간 동안 처리할 수 있는 사람 수를 합산하여 총 처리 가능 인원을 구했다. 
만약 이 합계가 심사를 받아야 하는 사람 수(n) 이상이면 현재 시간이 가능하므로 최소 시간을 줄이기 위해 범위를 좁히고, 
그렇지 않으면 더 많은 시간이 필요하므로 범위를 늘려 나갔다. 
이러한 과정을 반복하면서 최소 시간을 갱신해 최적의 해를 찾아낼 수 있었다.


```java
import java.util.*;

class Immigration {
    private final int people;
    private final int[] times;

    private Immigration(int people, int[] times) {
        this.people = people;
        Arrays.sort(times);
        this.times = times;
    }

    public static Immigration of (int people, int[] times) {
        return new Immigration(people, times);
    }

    public long getMinScreeningTime() {
        long left = 1;
        long right = (long) times[times.length - 1] * people;
        long result = 0;

        while (left <= right) {
            long mid = (left + right) / 2;
            long total = 0;
            for (int time : times) {
                total += mid / time;
                if (isScreened(total, people)) {
                    break;
                }
            }

            if (isScreened(total, people)) {
                result = mid;
                right = mid -1;
            } else {
                left = mid + 1;
            }
        }
        return result;
    }

    private boolean isScreened(long screenedPeople, long totalPeople) {
        return Long.compare(screenedPeople, totalPeople) >= 0;
    }
}

class Solution {
    public long solution(int n, int[] times) {
        return Immigration.of(n, times).getMinScreeningTime();
    }
}
```