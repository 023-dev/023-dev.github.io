---
visible: false
title: "서버 모니터링에 대한 생각"
date: 2025-03-10 23:00:00
tags: 
  - Server
  - Grafana
  - Prometheus
  - Alertmanager
  - Nginx
---

이번 글에서는 서버 모니터링에 대해 다루어 보려고 한다.

## Concept

- 서버 공격으로 인한 서버 다운이 흔하게 발생 → 모니터링의 필요성
- CloudWatch → 트래픽에 따른 비용 증가, 구축 편이
- Promethus + Grafana(추후 Loki) → 오픈 소스, 상대적으로 구축이 복잡
- 결론은  Promethus + Grafana → 구축 경험이 있고, 오픈 소스
- 모니터링 소스 → Nginx Log 및 Docker Logs
- cAdvisor + Prometheus → 컨테이너 리소스 사용량 모니터링 (CPU, RAM, Disk, 네트워크)
- Docker Daemon Logs + Loki + Grafana → 컨테이너 로그 분석
- Nginx VTS (Virtual Host Traffic Status) + Prometheus Exporter → 실시간 트래픽 모니터링
- Nginx Access/Error 로그 분석 → 로그 기반 분석

## Workflow

- Prometheus 설치

    ```bash
    # Ubuntu로 수정 필요
    # Prometheus 사용자 생성
    sudo useradd -M -r -s /bin/false prometheus
    
    # 설정 디렉토리 및 데이터 디렉토리 생성
    sudo mkdir /etc/prometheus /var/lib/prometheus
    
    # Prometheus 다운로드
    cd /tmp
    curl -LO https://github.com/prometheus/prometheus/releases/download/v2.41.0/prometheus-2.41.0.linux-amd64.tar.gz
    tar xvf prometheus-2.41.0.linux-amd64.tar.gz
    
    # 바이너리 이동
    sudo mv prometheus-2.41.0.linux-amd64/prometheus /usr/local/bin/
    sudo mv prometheus-2.41.0.linux-amd64/promtool /usr/local/bin/
    ```

- Prometheus 설정
    - /etc/prometheus/prometheus.yml

        ```bash
        global:
          scrape_interval: 15s
        
        scrape_configs:
          - job_name: 'nginx'
            static_configs:
              - targets: ['localhost:9113']  # Nginx Exporter
        
          - job_name: 'docker'
            static_configs:
              - targets: ['localhost:9323']  # cAdvisor (Docker 컨테이너 모니터링)
        ```

- Prometheus 실행

    ```bash
    # Prometheus 실행
    sudo systemctl enable prometheus
    sudo systemctl start prometheus
    ```

- Nginx 설정
    - /etc/nginx/nginx.conf

    ```bash
    server {
        listen 80;
        server_name localhost;
    
        location /nginx_status {
            stub_status;
            allow 127.0.0.1;
            deny all;
        }
    }
    ```

    - `sudo systemctl restart nginx`로 설정 반영
- Nginx Exporter 설치

    ```bash
    # Nginx Exporter 다운로드
    wget https://github.com/nginxinc/nginx-prometheus-exporter/releases/download/v0.10.0/nginx-prometheus-exporter-0.10.0-linux-amd64.tar.gz
    tar xvf nginx-prometheus-exporter-0.10.0-linux-amd64.tar.gz
    sudo mv nginx-prometheus-exporter /usr/local/bin/
    
    # Nginx Exporter 실행
    /usr/local/bin/nginx-prometheus-exporter -nginx.scrape-uri=http://localhost/nginx_status &
    ```

    - 실행 확인

    ```bash
    curl http://localhost:9113/metrics
    ```

- Docker Container Advisor 실행

    ```bash
    docker run -d \
      --name=cadvisor \
      --restart=always \
      -p 9323:8080 \
      --privileged \
      --volume=/var/run:/var/run:rw \
      --volume=/sys:/sys:ro \
      --volume=/var/lib/docker/:/var/lib/docker:ro \
      google/cadvisor:latest
    ```

    - 실행 확인

    ```bash
    curl http://localhost:9323/metrics
    ```

- Grafana 설치

    ```bash
    sudo apt-get install -y adduser libfontconfig1
    wget https://dl.grafana.com/oss/release/grafana_9.3.2_amd64.deb
    sudo dpkg -i grafana_9.3.2_amd64.deb
    
    # Grafana 실행
    sudo systemctl enable grafana-server
    sudo systemctl start grafana-server
    ```

    - 브라우저에서 http://<EC2_IP>:3000 접속 → 기본 로그인 ID/PW: **admin / admin**
    - Prometheus 데이터 소스 추가 → Configuration > Data Sources > Add Data Source, **Type:** Prometheus, URL: [http://localhost:909](http://localhost:909/)0
- Grafana 설정
    - Nginx Dashboard
        - Import → Load Dashboard ID: 2949 → Prometheus로 Import
    - Docker Dashboard
        - Import → Load Dashboard ID: 193 → Prometheus로 Import
- Slack 알림 설정 (AlertManager)
    - AlertManager 설정 (/etc/prometheus/alertmanager.yml)

        ```bash
        global:
          resolve_timeout: 5m
        
        route:
          receiver: 'slack'
        
        receivers:
          - name: 'slack'
            slack_configs:
              - send_resolved: true
                channel: '#alerts'
                api_url: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
        ```

    - 설정 반영 -> `sudo systemctl restart alertmanager`

---

## 참고

- [Nihisil, Send notifications to the Slack from fail2ban](https://gist.github.com/Nihisil/29fd2971c9dd109ae245)