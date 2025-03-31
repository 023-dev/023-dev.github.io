---
title: "Nginx 설정하기"
date: 2024-07-17 02:00:00
tags: 
  - Nginx
---

## 왜 Nginx를 사용하는가?

먼저, Nginx를 사용하는 이유에 대해 알아보면, SSL 설정, 간단한 응답 체크나, 파일 다운로드, 반환 URL을 Proxy Pass 요구하는 경우,
이 요청을 자바로 녹여내려면 복잡한 로직이 추가된다. 
하지만 Nginx는 이러한 설정을 간단하게 해준다.
실제 프록시 패스를 수행할 때 Nginx를 사용하면, 있는 듯 없는 듯한 속도 차이를 느낄 수 있다.
Nginx를 사용하면 물론 오버헤드가 발생하지만, 이는 Nginx가 주는 편리함을 생각하면 무시할 정도로 성능이 우수하다.
이정도로 Nginx를 사용하는 이유에 대해 알아보고 이제 Nginx 설정에 대해 알아보자.

## 트렌디한 최신 Nginx 설치

우선, Nginx를 설치해야 한다. Nginx는 다양한 운영체제에서 사용할 수 있지만, 여기서는 Red Hat 기반 Linux를 기준으로 설명한다.
패키지 설정할 때는 `sudo -u root -i`로 root 권한을 획득하고 진행하는게 좋다.
Red Hat 기반 Linux 배포판에는 패키지 매니지먼트 툴인 dnf와 yum가 있다.
여기서는 필자에게 익숙한 yum을 사용한다.
바로 `yum install nginx`로 Nginx를 설치할 수 있지만, 기존 yum에서 지원하는 패키지 라이브러리는 하위 버전일 가능성이 있다.
물론 개인 공부나 테스트 목적으로는 문제가 없지만, 실제 서비스에 사용하기에는 고려해봐야한다.
아무튼 어떻게 설치해야 하냐면 방법이 꽤 있는데, 먼저 Fedora Linux에서 지원하는 `yum install epel-release`를 하면, `yum install nginx`로 Nginx를 설치하면 최신 버전일 가능성이 높아진다.
다른 방법으로는 [Nginx yum 저장소](https://nginx.org/en/linux_packages.html)를 추가하는 방법이 있다.
이 방법으로 할 경우 `vi /etc/yum.repos.d/nginx.repo`로 저장소를 추가하고, 아래 내용을 넣어주면 된다.

```bash
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
```

이렇게 저장소를 추가하고 `yum install nginx`로 Nginx를 설치하면 위 설정을 참고해서 최신 버전으로 설치한다.

## Nginx 설정

이제 Nginx를 설치했으니, Nginx를 다루는 방법에 대해 알아보자.

### Nginx의 설정 파일

먼저 Nginx 설정 파일에 대해 이해가 필요한데 꽤 복잡하다.
Nginx 설정 파일을 알아보자면, 우선 경로는 `/etc/nginx`에 있다.

- mime.types: Nginx 서버가 처리할 MIME 타입 목록
- upstream.conf: 로드밸런싱 사용을 위한 여러 서버 그룹을 정의한 설정 파일
- header.conf: 요청을 다른 서버로 프록시할 때 전달할 헤더 설정 파일
- ssl.conf: SSL 설정 파일, SSL 인증서 경로 지정
- ssl-server.conf: SSL 요청(443 포트)에 대한 서버 블록 설정 파일
- http-server.conf: HTTP 요청(80 포트)에 대한 서버 블록 설정 파일
- nginx.conf: 모든 설정 파일을 포함하는 Nginx의 메인 설정 파일

#### mime.types

mime.types 파일은 Nginx가 처리할 수 있는 파일 형식(MIME 타입)을 정의한다. 
기본적으로 HTML, CSS, 이미지 파일, JavaScript 등 여러 파일 형식에 대한 MIME 타입을 지정하고 있다.
전체 파일 형식은 [Nginx mime.types](https://hg.nginx.org/nginx/file/tip/conf/mime.types)에서 확인할 수 있다.

```bash
types {
    text/html                                        html htm shtml;
    text/css                                         css;
    text/xml                                         xml;
    image/gif                                        gif;
    image/jpeg                                       jpeg jpg;
    application/javascript                           js;
    application/atom+xml                             atom;
    application/rss+xml                              rss;

    ...
}
```

#### upstream.conf

Nginx가 요청을 전달할 서버 그룹을 정의하는 파일이다. 
`upstream` 지시어를 사용하여 여러 백엔드 서버를 묶어 로드 밸런싱을 할 수 있고, `keepalive`를 사용하여 연결을 재활용할 수 있다.

```bash
# upstream -> backend server group 
# keepalive -> upstream connection pool
  
upstream tomcat {
    server 127.0.0.1:8080;
    keepalive 10;
}

upstream jp1 {
    server jp1.com;
    keepalive 10;
}
```

#### header.conf

요청을 다른 서버로 프록시할 때, 전달할 헤더 설정을 정의하는 파일이다. 
Nginx는 기본적으로 Host 헤더를 전달하는데, 이때 필요에 따라 추가적인 헤더를 설정할 수 있다.

```bash
proxy_pass_header Server;                # Server 헤더를 프록시할 때 전달
proxy_set_header Host $http_host;        # Host 헤더를 전달
proxy_set_header X-Real-IP $remote_addr; # 클라이언트 IP 주소를 전달
```

#### ssl.conf

SSL 설정 파일로, SSL 인증서와 키 파일의 경로를 지정하고 SSL 버전 및 암호화 설정을 정의할 수 있다.

```bash
listen 443 ssl http2;

ssl_certificate       ./ssl/cert.pem;
ssl_certificate_key   ./ssl/key.pem;

ssl_protocols  TLSv1.2 TLSv1.3;
ssl_ciphers    AES128:RC4:AES256:!ADH:!aNULL:!DH:!EDH:!eNULL:!LOW:!SSLv2:!EXP:!NULL;
ssl_prefer_server_ciphers   on;
```

#### ssl-server.conf

HTTPS(443 포트) 요청을 처리하는 서버 블록을 정의한다.
SSL 설정 파일을 포함시키고, 도메인과 관련된 로그 및 오류 로그를 설정하고, 특정 경로(/actuator)로의 접근을 제한하거나, 다른 서버로의 프록시를 설정할 수 있다.

```bash
# https 443 요청에 대한 proxy pass
server {
    listen       443 ssl http2;  	           
    server_name github.023-dev.com 023-dev.github.io;
    access_log  ./logs/nginx/access_023.log  main;     # HTTPS 로그 기록

    ssl_certificate       ./ssl/cert.pem;
    ssl_certificate_key   ./ssl/key.pem;

    ssl_protocols  TLSv1.2 TLSv1.3;
    ssl_ciphers    AES128:RC4:AES256:!ADH:!aNULL:!DH:!EDH:!eNULL:!LOW:!SSLv2:!EXP:!NULL;
    ssl_prefer_server_ciphers   on;

    location ^~ /actuator {
        return 404; # 보안상 외부에서 /actuator 경로에 접근을 차단
    }

    location / {
        proxy_pass http://tomcat; # / 경로로 들어온 요청을 tomcat 서버로 프록시
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    error_page 400 401 403 404 405 /404.html;
    location = /404.html {
    }
    
    error_page 500 502 503 504 /50x.html;
   		location = /50x.html {
   	}

}
```

#### http-server.conf

HTTP(80 포트) 요청을 처리하는 서버 블록을 정의한다. 
이 파일에서는 SSL이 아닌 일반 HTTP 요청을 처리하고, 특정 경로(/api)에 대해 HTTPS로 리디렉션하는 설정할 수 있다.

```bash
# http 80 요청에 따른 proxy pass
server {
    listen       80;  	           
    server_name github.023-dev.com 023-dev.github.io;
    access_log  ./logs/nginx/access_023.log  main;     # HTTP 로그 기록

    location ^~ /actuator {
        return 404; # 보안상 외부에서 /actuator 경로에 접근을 차단
    }

    location ~* ^/(api/) {
        rewrite ^(.*) https://$http_host$1 permanent; # /api 경로를 HTTPS로 리디렉션
    }

    location / {
        return 404; # 그 외의 경로로 접근한 경우, 404 반환
        break;
    }
    
    error_page 400 401 403 404 405 /404.html;
    location = /404.html {
    }
    
    error_page 500 502 503 504 /50x.html;
   		location = /50x.html {
   	}

}
```

#### nginx.conf

Nginx의 메인 설정 파일로, 다른 설정 파일들을 `include`하여 불러온다. 
이 파일에서는 시스템의 CPU 코어 수에 맞게 `worker_processes`를 설정하고, 요청 처리에 필요한 다양한 설정들을 포함시킬 수 있다.

```bash
user  nginx;
  
worker_processes auto; # CPU 코어 수에 맞게 worker_processes 설정

events {
    worker_connections 1024; # worker_connections 설정 -> process당 maximum connection 수
}

http {
    include       mime.types;               # MIME 타입 설정 파일
    default_type  application/octet-stream; # 기본 MIME 타입 설정

    include       upstream.conf;            # upstream 설정 파일
    include       header.conf;              # header 설정 파일
    include       ssl.conf;                 # SSL 설정 파일
    include       ssl-server.conf;          # HTTPS 서버 블록 설정 파일
    include       http-server.conf;         # HTTP 서버 블록 설정 파일

    sendfile        on;                      # sendfile 설정
    tcp_nopush     on;                      # tcp_nopush 설정
    
    keepalive_timeout  65;                  # keepalive_timeout -> 클라이언트와 서버 사이의 연결 유지 시간
    keepalive_requests 100;                 # keepalive_requests -> keepalive 연결 요청 수
    
    gzip  on;                               # gzip 압축 설정
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    large_client_header_buffers 4 16k;      # large_client_header_buffers 설정 -> 클라이언트 헤더 버퍼 크기
    client_max_body_size 100m;              # client_max_body_size 설정 -> 클라이언트 요청 바디 최대 크기
}
```

### Nginx 설정 파일 예시

최근에 사용한 Nginx 설정 파일에 형식을 공유하겠다.
이렇게만 해도 일반적인 어플리케이션 서버를 운영하는데 충분하다.

```bash
upstream backend {#연결했던 커넥션을 nginx가 캐시해서 재활용 할 수 있음
				server 127.0.0.1:8080;# 같은 서버에 있어서 local로 매핑
				keepalive 5;
}

server {
        listen: 80; #default_server 붙이는 방법도 있음
        server_name: {탄력적 IP or DNS} # ex) 43.200.98.236;
        
        #location /hello { # 이렇게 할 수도 있음
        #        return 200 'Hello World';
        #        add_header Content-Type "text/plain";
        #}
        
        location / {
				        proxy_pass http://backend; 
				        proxy_connect_timeout 5;
				        proxy_read_timeout 15;
        }
        
}
```

작성 후 `nginx -t`로 설정 파일을 검사하고 `nginx -s reload`로 설정을 적용할 수 있다.
`nginx -t`를 통해 검사하는 것을 습관화 하는 것이 좋다. 

## Nginx 설정 시 주의해야 하는 부분

Nginx 설정 시 주의해야 하는 부분 또한 꽤 있다.
주의하길 바란다.

### server_name

Nginx는 요청이 들어오면 어떤 서버 블록이 해당 요청을 처리할지 결정하는데, 이 때 중요한 역할을 하는 것이 바로 `server_name`이다. 
여러 개의 서버 블록이 동일한 포트를 리슨하고 있을 때, 요청은 `server_name`에 설정된 값을 기준으로 적합한 서버 블록으로 라우팅된다.
예를 들어, 80번 포트를 리슨하는 3개의 서버 블록이 있을 경우, 각 서버 블록은 `server_name`에 설정된 값에 따라 다르게 동작한다.

```bash
server {
    listen 80;
    server_name example.com www.example.com;
    ...
}

server {
    listen 80;
    server_name example.net www.example.net;
    ...
}

server {
    listen 80;
    server_name example.org www.example.org;
    ...
}
```

이와 같은 설정에서는, Nginx가 요청을 처리할 때 요청 헤더의 Host 값을 바탕으로 서버를 선택한다.
만약 `server_name`에 설정된 도메인 이름이 매칭되지 않으면, `default_server`로 설정된 서버 블록이 요청을 처리하게 된다.
특히, Host 헤더가 없는 요청을 처리하려면 아래와 같이 설정하여 444 상태 코드를 반환해 요청을 drop 시킬 수 있다

```bash
server {
    listen 80 default_server;
    server_name _;
    return 444;
}
```

하나의 서버에 여러 DNS가 매핑되는 상황에서 설정하다 보면 원하지 원하지 않는 서버 블록이 요청을 처리할 수 있다.
이러한 경우에는 원하는 `server_name`이 올바르게 매핑되고 있는지 확인하고 잘 설정해야 한다.

### proxy_set_header

Nginx에서 `proxy_pass`를 사용하여 다른 서버로 요청을 전달할 때, 특정 헤더를 전달하기 위해 `proxy_set_header`를 설정할 수 있다. 
기본적으로 `proxy_set_header`는 상위 블록에서 설정된 값을 하위 블록에서 상속받는데, 예를 들어 http 또는 server 블록에서 정의된 `proxy_set_header`는 location 블록에서도 적용이 된다.
그러나 location 블록에서 별도의 proxy_set_header 설정이 있다면, 상위 블록에서 정의된 설정은 무시되고 하위 블록에서 설정된 값만 사용된다.

```bash
server {
    listen 80;
    server_name localhost;
    
    # 상위 블록에서 설정된 "Hello" 헤더
    proxy_set_header Hello "Hello";
    
    location / {
        # 하위 블록에서 설정된 "Bye" 헤더
        proxy_set_header Bye "Bye";
        proxy_pass http://localhost:8080;
    }
}
```

이 경우, 하위 블록인 `location`에서 설정된 `proxy_set_header`가 상위 블록의 설정을 덮어쓰기 때문에 `proxy_pass`로 전달되는 헤더는 "Bye" 만 전달된다. 
따라서 `proxy_set_header`를 설정할 때, 상위 블록과 하위 블록에서 충돌이 일어나지 않도록 주의해야 한다.

## Nginx 로그

서버 운영을 하게 되면 로그는 필수이다.
Nginx에도 로그가 있는데, Nginx 로그는 크게 두 가지로 나뉜다.

- error.log: Nginx 서버에서 발생한 오류에 대한 로그
- access.log: 클라이언트 요청에 대한 로그

이 로그는 `vi /etc/nginx/nginx.conf` Nginx 설정 파일에 기본 `log_format`으로 있다.
기본 `log_format`은 이렇게 돼있다.

```bash
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                 '$status $body_bytes_sent "$http_referer" '
                 '"$http_user_agent" "$http_x_forwarded_for"';
```

이는 경우에 따라서 서비스 마다 `config` 파일을 만들어 `log` 관리를 할 수 있다.

```bash
http {
		log_format main '$remote_addr - $remote_user [$time_local] "$request" '
										'$status $body_bytes_sent "$http_referer" '
										'"$http_user_agent" "$http_x_forwarded_for"'
										'"$request_time" "$upsteam_connect_time" "$upstream_header_time" "$upstream_response_time"';
										
		access_log /var/log/nginx/access.log main;
}
```

여기서 `$request_time`, `$upsteam_connect_time`, `$upstream_header_time`, `$upstream_response_time`은 Nginx에서 제공하는 변수로, 각각 요청 처리 시간, 서버 연결 시간, 서버 응답 헤더 수신 시간, 서버 응답 시간을 의미한다.
필요로 한다면, 다른 로그 매니지먼트 툴에서 로그 파싱을 위해 json 형식으로 지정하여 사용할 수 있다.
이제 이렇게 설정한 로그를 `nginx.conf`에 적용하면 된다.

```bash
server {
        ...
        
        access_log /var/log/nginx/{application}-access.log main;# ex) app-access.log, log_format 지정 가능(ex. main)
        error_log /var/log/nginx/{application}-error.log;# ex) app-error.log
        
        ...       
}
```

## 참고

- [Nginx: Linux packages](https://nginx.org/en/linux_packages.html)

- [Kandaurov, S. (2025, February 5). Nginx-1.27.4-RELEASE.](https://hg.nginx.org/nginx/file/tip/conf/mime.types)

