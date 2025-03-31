---
title: "서버 장애를 대비해 서버 리소스에 대한 Slack Webhook 처리하기"
date: 2025-03-03 23:00:00
tags: 
  - Server
  - AWS
---

## 왜 알림이 필요할까?

저번에 서버에 대한 악성 공격으로 인해 스프링 애플리케이션을 올려놓은 컨테이너의 리소스 사용량이 급격히 증가하다가 결국 OOM(Out Of Memory) 이슈로 서버가 다운되었던 경험이 있었다.
그래서 Nginx 단에서 필터링을 적용하고, Fail2Ban을 통해 악성 공격을차단하는 방법을 사용했다
하지만 이건 악성 공격에 대한 대응이었고, 서버에 대한 상태를 체크하고 알림을 받아 미리 대응할 수 있도록 해야 한다고 생각했다.

## 어떤 알림이 필요할까?

먼저 서버 리소스에 대한 알림이 필수적으로 필요하다고 생각했다.
그래서 생각한 알림은 다음과 같다.

- CPU 사용률이 임계치를 초과했을 때
- 메모리 사용량이 급증하여 OOM 발생 가능성이 높을 때
- 디스크 사용량이 일정 임계치를 초과했을 때

그리고 컨테이너 자체에 대한 알림도 필요하다고 생각했다.
컨테이너가 중지되거나 컨테이너의 CPU 및 메모리 사용량이 비정상적으로 증가했을 때 알림을 받기로 했다.

이제 어떤 알림을 받을지 결정했고, 그럼 어떻게 알림 서비를 만들어야 할까를 생각을 봐야한다.
필자는 앞선 글에서 Slack을 사용하여 알림을 받았기 때문에 이번에도 Slack을 사용하여 알림을 받기로 했다.
이후에 Prometheus + Grafana로 확장할 예정이며, AWS CloudWatch도 고려할 수도 있을 것 같다.

## 슬랙 웹훅 생성

Slack 채널에서 Webhook을 생성한 후, 해당 URL을 사용하여 슬랙 알림을 받을 수 있다.
방법은 다음과 같다.

1. Slack 앱에서 Incoming Webhooks 추가
2. Webhook을 설정한 채널 선택 후, Webhook URL을 생성

여기서 생성되는 URL의 예시는 `https://hooks.slack.com/services/~` 이런 형식이다. 
참고하길 바란다.

### 스크립트 작성

이제 알림을 받을 곳을 설정했으니, 알림을 보낼 스크립트를 작성해야 한다.

먼저 서버 리소스 모니터링 스크립트이다.
앞서 언급한 대로 서버의 CPU, 메모리, 디스크 사용량을 모니터링하고, 임계치를 초과했을 때 슬랙 알림을 받을 수 있도록 작성했다.



```shell
#!/bin/bash

# Slack Webhook URL (수정 필요)
WEBHOOK_URL="https://hooks.slack.com/services/~"

# Server Information
HOSTNAME=$(hostname)
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# System Metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
MEMORY_USAGE=$(free -m | awk '/Mem/{printf "%.2f", $3/$2 * 100}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | xargs)
UPTIME=$(uptime -p)
ACTIVE_PROCESSES=$(ps aux | wc -l)

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=90
DISK_THRESHOLD=90

# Slack Notification Function
send_slack_notification() {
    MESSAGE=$1
    PAYLOAD="{\"text\": \"[Server Alert] \n${MESSAGE}\"}"
    curl -X POST --data-urlencode "payload=${PAYLOAD}" "$WEBHOOK_URL"
}

# CPU Usage Check
if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    send_slack_notification "High CPU Usage Detected: ${CPU_USAGE}%\nLoad Average: ${LOAD_AVG}"
fi

# Memory Usage Check
if (( $(echo "$MEMORY_USAGE > $MEMORY_THRESHOLD" | bc -l) )); then
    send_slack_notification "High Memory Usage Detected: ${MEMORY_USAGE}%\nActive Processes: ${ACTIVE_PROCESSES}"
fi

# Disk Usage Check
if (( DISK_USAGE > DISK_THRESHOLD )); then
    send_slack_notification "High Disk Usage Detected: ${DISK_USAGE}%\nSystem Uptime: ${UPTIME}"
fi
```

위의 스크립트는 다음과 같은 내용을 포함하고 있다.

- `WEBHOOK_URL="https://hooks.slack.com/services/~"`: 슬랙 웹훅 URL을 설정하는 부분이다.
- `HOSTNAME=$(hostname)`, `TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")`: 서버 정보를 가져오는 부분이다. 여기서 호스트 이름과 타임스탬프를 가져와 포맷팅을 한다.
- `CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')`: CPU 사용량을 가져오는 부분이다. `top` 명령어를 사용하여 CPU 사용량을 가져온다.
- `MEMORY_USAGE=$(free -m | awk '/Mem/{printf "%.2f", $3/$2 * 100}')`: 메모리 사용량을 가져오는 부분이다. `free` 명령어를 사용하여 메모리 사용량을 가져온다.
- `DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')`: 디스크 사용량을 가져오는 부분이다. `df` 명령어를 사용하여 디스크 사용량을 가져온다.
- `LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | xargs)`: 시스템 부하를 가져오는 부분이다. `uptime` 명령어를 사용하여 시스템 부하를 가져온다.
- `UPTIME=$(uptime -p)`: 시스템 업타임을 가져오는 부분이다. `uptime` 명령어를 사용하여 시스템 업타임을 가져온다.
- `ACTIVE_PROCESSES=$(ps aux | wc -l)`: 활성 프로세스 수를 가져오는 부분이다. `ps` 명령어를 사용하여 활성 프로세스 수를 가져온다.
- `CPU_THRESHOLD=80`, `MEMORY_THRESHOLD=90`, `DISK_THRESHOLD=90`: CPU, 메모리, 디스크 사용률의 임계치를 설정한다.
- `send_slack_notification()`: 실질적으로 슬랙 알림을 보내는 함수이다.
- `if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then`: CPU 사용량이 설정한 임계치를 초과했을 때 감지하는 부분이다.
- `send_slack_notification "High CPU Usage Detected: ${CPU_USAGE}%\nLoad Average: ${LOAD_AVG}"`: 그리고 이 부분이 진짜 슬랙 알림을 보내는 부분이다.

```shell
#!/bin/bash

# Slack Webhook URL
WEBHOOK_URL="https://hooks.slack.com/services/~"

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=90

# Function to send Slack notifications
send_slack_notification() {
    MESSAGE=$1
    PAYLOAD="{\"text\": \"[Docker Alert] \n${MESSAGE}\"}"
    curl -X POST --data-urlencode "payload=${PAYLOAD}" "$WEBHOOK_URL"
}

# Get running containers
CONTAINERS=$(docker ps --format "{{.Names}}")

# Check container statuses
for CONTAINER in $CONTAINERS; do
    STATUS=$(docker inspect --format '{{.State.Status}}' "$CONTAINER")

    # Send alert if container is not running
    if [ "$STATUS" != "running" ]; then
        send_slack_notification "Container stopped: $CONTAINER (Status: $STATUS)"
    fi

    # Get CPU and memory usage
    STATS=$(docker stats --no-stream --format "{{.CPUPerc}} {{.MemPerc}}" "$CONTAINER")
    CPU_USAGE=$(echo "$STATS" | awk '{print $1}' | sed 's/%//')
    MEMORY_USAGE=$(echo "$STATS" | awk '{print $2}' | sed 's/%//')

    # Send alert if CPU usage exceeds threshold
    if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
        send_slack_notification "High CPU usage detected: $CONTAINER - ${CPU_USAGE}%"
    fi

    # Send alert if memory usage exceeds threshold
    if (( $(echo "$MEMORY_USAGE > $MEMORY_THRESHOLD" | bc -l) )); then
        send_slack_notification "High memory usage detected: $CONTAINER - ${MEMORY_USAGE}%"
    fi
done
```

위의 스크립트도 앞서 작성한 스크립트와 유사한 부분이 많다.
이 부분에 대해서 위에서 설명한 내용과 중복되는 부분도 있지만, 그래도 포함해서 간단하게 설명하면 다음과 같다.

- `WEBHOOK_URL="https://hooks.slack.com/services/~"`: 슬랙 웹훅 URL을 설정하는 부분이다.
- `CPU_THRESHOLD=80`, `MEMORY_THRESHOLD=90`: CPU, 메모리 사용률의 임계치를 설정한다.
- `send_slack_notification()`: 실질적으로 슬랙 알림을 보내는 함수이다.
- `CONTAINERS=$(docker ps --format "{{.Names}}")`: 실행 중인 컨테이너 목록을 가져오는 부분이다.
- `STATUS=$(docker inspect --format '{{.State.Status}}' "$CONTAINER")`: 컨테이너 상태를 가져오는 부분이다.
- `STATS=$(docker stats --no-stream --format "{{.CPUPerc}} {{.MemPerc}}" "$CONTAINER")`: 컨테이너의 CPU 및 메모리 사용량을 가져오는 부분이다.
- `CPU_USAGE=$(echo "$STATS" | awk '{print $1}' | sed 's/%//')`: 컨테이너의 CPU 사용량을 가져오는 부분이다.
- `MEMORY_USAGE=$(echo "$STATS" | awk '{print $2}' | sed 's/%//')`: 컨테이너의 메모리 사용량을 가져오는 부분이다.
- `if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then`: CPU 사용량이 설정한 임계치를 초과했을 때 감지하는 부분이다.
- `send_slack_notification "High CPU usage detected: $CONTAINER - ${CPU_USAGE}%"`: 그리고 이 부분이 진짜 슬랙 알림을 보내는 부분이다.

자 이제, 스크립트를 작성을 마쳤다.
그럼 이 스크립트들을 스케줄링을 통해 주기적으로 실행하도록 하기 위한 크론탭을 만들어 보겠다.
아 그 전에 자신이 사용하는 Slack Webhook URL이 올바르게 동작하는지 별도로 테스트를 하고 싶으면 아래 명령어처럼 사용하면 된다.

```shell
curl -X POST --data-urlencode "payload={\"text\": \"Test Alert from Server\"}" "https://hooks.slack.com/services/~"
```

### 크론탭 설정

먼저 크론탭에 대해서 간단히 설명하자면, 리눅스 시스템에서 주기적으로 실행되는 작업을 설정할 수 있는 스케줄러이다.
본격적으로 크론탭을 편집하기 위해 다음 명령어를 실행한다.

```shell
crontab -e
```

이렇게 하면 기본 편집기가 열리는데, 여기에 아래 스크립트를 추가하면 된다.

```shell
*/10 * * * * /usr/local/bin/docker-monitor.sh >> /var/log/docker-monitor.log 2>&1
*/10 * * * * /usr/local/bin/server-monitor.sh >> /var/log/server-monitor.log 2>&1
``` 

위의 스크립트도 간단히 설명하자면, 

- `*/10 * * * *`: 10분마다 실행하도록 설정한 부분이다.
- `/usr/local/bin/docker-monitor.sh >> /var/log/docker-monitor.log 2>&1`: 스크립트 실행 결과를 `/var/log/docker-monitor.log` 파일에 저장한다.

필자는 위 내용처럼 10분마다 스크립트를 실행하도록 설정했다.

이 부분에서 주의해야 할 점은, 크론탭을 설정할 때 크론식도 잘 설정했고, 스크립트도 잘 작성했는데,
실행하지 못하고 있을 수도 있다.
이때는 꼭 `ls -al`로 스크립트와 실행 권한이 있는지 확인해 보길 바란다.

```shell
-rwxr-xr-x  1 root root 1719 Mar 10 05:51 docker-monitor.sh
-rwxr-xr-x  1 root root 1326 Mar 10 07:36 server-monitor.sh
```

위와 같이 파일에 x가 있어야 실행 권한이 있는 것이다.
왜 이렇게 하는지 모르겠다면, 개발자의 기본 교양인 리눅스 기본 명령어를 공부해야 할 필요가 있다.

아무튼 다시 돌아와서 만약에 없다면, 다음과 같이 실행 권한을 추가하면 된다.

```shell
sudo chmod +x /usr/local/bin/docker-monitor.sh
sudo chmod +x /usr/local/bin/server-monitor.sh
```

이렇게 하면 실행 권한이 추가되어 크론탭이 정상적으로 실행될 것이다.

만약 컨테이너 중지가 감지되면, 다음과 같은 메시지를 설정한 슬랙 채널로 받게 될 것이다.

```less
[Docker Alert]
Container stopped: jovial_mestorf
Status: exited
Exit Code: 137
Error: No specific error message
```

## 참고

- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Slack Webhook API](https://jojoldu.tistory.com/552)
- [Cron Tab](https://crontab.guru/)