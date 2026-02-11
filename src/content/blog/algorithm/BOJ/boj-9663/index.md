---
visible: false
title: "9663 N-Queen"
date: 2025-02-10 18:00:00
tags: 
  - Algorithm
---


## N-Queen

[백준 9663번 N-Queen](https://www.acmicpc.net/problem/9663)


| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 10 초  | 128 MB | 131775 | 63781 | 40975 | 46.740% |

### 문제

N-Queen 문제는 크기가 N × N인 체스판 위에 퀸 N개를 서로 공격할 수 없게 놓는 문제이다.

N이 주어졌을 때, 퀸을 놓는 방법의 수를 구하는 프로그램을 작성하시오.

### 입력

첫째 줄에 N이 주어진다. (1 ≤ N < 15)

### 출력

첫째 줄에 퀸 N개를 서로 공격할 수 없게 놓는 경우의 수를 출력한다.

---

## 풀이

N-Queen 문제를 해결하는 과정에서 여러 가지 접근 방식을 고민해봤다. 처음에는 가장 직관적인 **백트래킹(Backtracking)** 알고리즘을 떠올렸고, 이를 기반으로 기본적인 풀이를 구현했다. 퀸을 하나씩 배치하면서 매번 유효한 위치인지 검사하고, 유효하면 다음 행으로 이동하는 방식이다. 기본적인 방식이지만 `O(N!)`의 시간 복잡도를 가지므로, `N`이 커질수록 성능이 급격히 저하될 가능성이 있었다.

이후 성능을 개선할 방법을 찾던 중, **대칭성을 활용하는 최적화 기법**이 눈에 들어왔다. 체스판에서 퀸의 배치는 좌우 대칭이 존재하므로, 첫 번째 행에서 절반만 탐색한 뒤 결과를 두 배로 계산하는 방식이었다. 하지만 이를 적용하려면 `N`이 짝수인지, 홀수인지에 따라 보정이 필요했다. `N`이 홀수일 경우 중앙열에 위치한 경우를 따로 계산해야 했고, 단순히 `* 4` 하는 방식은 오답을 유발할 수 있었다. 즉, 모든 경우가 완벽하게 4배 비율로 대칭을 이루는 것이 아니라는 점이 문제였다.

결국 최적화 방법을 적용하되, 문제에서 `N`이 입력으로 고정된다는 점을 고려하여 **가장 일반적인 백트래킹 방식을 유지하는 것이 최선**이라는 결론을 내렸다. 기본적인 백트래킹을 적용하되, 객체지향적 설계를 활용하여 `NQueenSolver` 클래스를 만들어 문제 해결과 실행을 분리했다. 이렇게 하면 코드의 구조가 명확해지고 유지보수도 쉬워진다. 최적화가 필요한 경우에는 `isSafe()` 체크를 개선하거나 비트마스크를 활용하는 방식으로 추가적인 최적화를 고려할 수 있다.

이번 문제를 풀면서, 단순히 정답을 찾는 것뿐만 아니라 **성능을 고려한 최적화**와 **객체지향적인 코드 구조**에 대한 고민을 많이 하게 되었다. 단순한 문제라도, 다양한 방식으로 접근해보는 것이 중요하다는 점을 다시 한번 느꼈다.

```java
import java.nio.Buffer;

class NQueenSolver {
    private final int N;
    private int count;
    private final int[] board;

    public NQueenSolver(int n) {
        this.N = n;
        this.board = new int[N];
        this.count = 0;
    }

    public void solve() {
        int half = (N % 2 == 0) ? (N / 2) : (N / 2 + 1);
        for (int col = 0; col < half; col++) {
            board[0] = col;
            placeQueen(1);
        }
        count *= 2;  // 대칭 적용
        if (N % 2 != 0)
            count -= removeDuplicatedCases();
    }

    private void placeQueen(int row) {
        if (row == N) {
            count++;
            return;
        }
        for (int col = 0; col < N; col++) {
            if (isSafe(row, col)) {
                board[row] = col;
                placeQueen(row + 1);
            }
        }
    }

    private boolean isSafe(int row, int col) {
        for (int prevRow = 0; prevRow < row; prevRow++) {
            int prevCol = board[prevRow];
            if (prevCol == col || Math.abs(prevCol - col) == Math.abs(prevRow - row)) {
                return false;
            }
        }
        return true;
    }

    private int removeDuplicatedCases() {
        int centerCol = N / 2;
        board[0] = centerCol;
        count = 0;
        placeQueen(1);
        return count;
    }

    public int getSolutionCount() {
        return count;
    }
}

public class Main {
    public static void main(String[] args) {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        int N = Integer.parseInt(reader.readLine());
        NQueenSolver solver = new NQueenSolver(N);
        solver.solve();
        System.out.println(solver.getSolutionCount());
    }
}

```