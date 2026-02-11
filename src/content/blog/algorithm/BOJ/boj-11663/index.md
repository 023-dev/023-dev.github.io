---
visible: false
title: "11663 선분 위의 점"
date: 2025-01-15 18:00:00
tags: 
  - Algorithm
---

## 선분 위의 점
[백준 11663번 선분 위의 점](https://www.acmicpc.net/problem/2776)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 1 초   | 256 MB | 5062 | 1883 | 1406 | 37.049% |

### 문제

일차원 좌표상의 점 N개와 선분 M개가 주어진다. 
이때, 각각의 선분 위에 입력으로 주어진 점이 몇 개 있는지 구하는 프로그램을 작성하시오.

### 입력

첫째 줄에 점의 개수 N과 선분의 개수 M이 주어진다.(1 ≤ N, M ≤ 100,000) 
둘째 줄에는 점의 좌표가 주어진다. 
두 점이 같은 좌표를 가지는 경우는 없다. 
셋째 줄부터 M개의 줄에는 선분의 시작점과 끝점이 주어진다. 
입력으로 주어지는 모든 좌표는 1,000,000,000보다 작거나 같은 자연수이다.

### 출력

입력으로 주어진 각각의 선분 마다, 선분 위에 입력으로 주어진 점이 몇 개 있는지 출력한다.

---

## 풀이

문제의 시간 제한은 1초이다. 입력으로 주어지는 좌표의 개수는 최대 100,000개이다.
그리고 탐색을 하여 몇개의 점이 선분위에 위치하는지 요구하는 문제인 것을 알 수 있다.
그래서 이 문제는 이분 탐색 방식을 사용하고자 했다.
문제 지문을 자세히 보고 생각난 풀이법은 백준 1654번 문제를 해결하기 위한 Upper Bound와 Lower Bound를 사용하는 방법을 사용하는 것을 떠올렸다.
Upper Bound로 선분의 끝점보다 큰 점의 인덱스를 찾고, Lower Bound로 선분의 시작점보다 크거나 같은 점의 인덱스를 찾아서 두 인덱스의 차이를 구하면 된다.
그리고 저번 문제에서 실수한 long 타입을 사용하지 않아서 발생한 오류를 방지하기 위해 long 타입을 사용했다.

```java
package test.code;

import java.io.*;
import java.util.*;

class Point implements Comparable<Point> {
    private final long coordinate;

    private Point(long coordinate) {
        this.coordinate = coordinate;
    }

    public static Point of(long coordinate) {
        return new Point(coordinate);
    }

    public long getCoordinate() {
        return coordinate;
    }

    @Override
    public int compareTo(Point other) {
        return Long.compare(this.coordinate, other.coordinate);
    }
}

class Segment {
    private final Point startPoint;
    private final Point endPoint;

    private Segment(long startPoint, long endPoint) {
        this.startPoint = Point.of(startPoint);
        this.endPoint = Point.of(endPoint);
    }

    public static Segment of(long start, long end) {
        return new Segment(start, end);
    }

    public Point getStartPoint() {
        return startPoint;
    }

    public Point getEndPoint() {
        return endPoint;
    }
}

class PointCounter {
    private final List<Point> points;
    private final List<Segment> segments;

    private PointCounter(List<Point> points, List<Segment> segments) {
        this.points = points;
        this.segments = segments;
    }

    public static PointCounter of(List<Point> points, List<Segment> segments) {
        return new PointCounter(points, segments);
    }

    private List<Long> count() {
        Collections.sort(points);
        List<Long> result = new ArrayList<>(segments.size());

        for (Segment segment : segments) {
            Point startPoint = segment.getStartPoint();
            Point endPoint = segment.getEndPoint();

            long leftIndex = lowerBound(points, startPoint);
            long rightIndex = upperBound(points, endPoint);;

            result.add(rightIndex - leftIndex);
        }

        return result;
    }

    private int lowerBound(List<Point> points, Point startPoint) {
        int left = 0;
        int right = points.size();

        while (left < right) {
            int mid = (left + right) / 2;

            if (points.get(mid).getCoordinate() >= startPoint.getCoordinate()) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        return left;
    }

    private int upperBound(List<Point> points, Point endPoint) {
        int left = 0;
        int right = points.size();

        while (left < right) {
            int mid = (left + right) / 2;

            if (points.get(mid).getCoordinate() > endPoint.getCoordinate()) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        return left;
    }

    public void printResult() {
        StringBuilder output = new StringBuilder();
        List<Long> result = count();
        for (long count : result) {
            output.append(count).append("\n");
        }
        System.out.print(output);
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int N = Integer.parseInt(tokenizer.nextToken());// 점의 개수, 1 <= N <= 100,000
        int M = Integer.parseInt(tokenizer.nextToken());// 선분의 개수, 1 <= M <= 100,000

        tokenizer = new StringTokenizer(reader.readLine());
        List<Point> points = new ArrayList<>();
        for (int i = 0; i < N; i++) {
            long point = Long.parseLong(tokenizer.nextToken());
            Point newPoint = Point.of(point);
            points.add(newPoint);
        }

        List<Segment> segments = new ArrayList<>();
        for (int i = 0; i < M; i++) {
            tokenizer = new StringTokenizer(reader.readLine());
            long start = Long.parseLong(tokenizer.nextToken());
            long end = Long.parseLong(tokenizer.nextToken());
            Segment newSegment = Segment.of(start, end);
            segments.add(newSegment);
        }

        PointCounter.of(points, segments).printResult();
    }
}

```