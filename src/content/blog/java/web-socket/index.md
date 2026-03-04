---
visible: false
title: "WebSocket과 STOMP로 실시간 채팅 구현하기"
date: 2025-07-29 00:00:00
tags:
  - Java
  - Web Socket
---

채팅, 주식처럼 서버의 상태 변화를 즉시 클라이언트에 전달해야 하는 서비스를 구현하려면 어떻게 해야 할까? HTTP만으로는 이를 자연스럽게 처리하기 어렵다. 이 글에서는 그 이유와 해결책, 그리고 Spring Boot에서 STOMP를 활용해 실시간 통신을 구현하는 방법까지 단계적으로 살펴보겠다.

## HTTP의 한계

주로 인터넷상에서 통신을 할 때는 HTTP를 사용한다. 특히 HTTP/1.1 이하에서는 클라이언트가 서버에게 요청을 보내고, 서버가 그에 응하여 응답을 보내는 단방향 구조로 동작한다. 서버가 클라이언트에게 먼저 메시지를 보내는 것은 불가능하다.

채팅 애플리케이션을 예로 들면, 내가 상대방에게 메시지를 보내는 것은 클라이언트에서 서버로 전달하면 되니 문제가 없다. 하지만 상대방이 먼저 메시지를 보냈을 때, 서버가 나에게 이를 알릴 방법이 없다.

이 문제를 HTTP로 해결하려는 시도들이 있었다.

**Polling**은 클라이언트가 주기적으로 서버에 요청을 보내 새 메시지가 있는지 확인하는 방식이다. 하지만 두 가지 문제가 있다.  
첫째, 요청 주기만큼의 지연이 발생해 서버가 갖고 있는 상태의 변화에 즉작적으로 반응하지 못할 수 있다.  
둘째, 변화가 없어도 계속 요청이 발생하여 불필요한 트래픽을 낭비한다. 요청 주기가 짧다면 트래픽의 방비와 비례하여 더 심해질 것이다.

**Long Polling**은 이를 개선한 방식으로, 클라이언트가 요청을 보내면 서버는 즉시 응답하지 않고 새 데이터가 발생할 때까지 연결을 붙잡고 기다린다. 새 메시지가 오거나 타임아웃이 되면 응답을 보내고, 클라이언트는 다시 요청을 보내는 것을 반복한다. 반응 속도는 빨라지지만, 동시에 여러 클라이언트가 연결을 유지하면 서버에 큰 부하가 발생한다.

또한 HTTP 요청에는 매번 헤더 정보가 포함되어 오버헤드가 발생한다는 공통적인 문제도 있다.

결국 이러한 서비스를 제대로 구현하기 위해서는 클라이언트와 서버가 **동등하게 메시지를 주고받을 수 있는 양방향 통신** 방식이 필요하다.

## 양방향 통신 채널 WebSocket

WebSocket은 이 문제를 해결하기 위한 프로토콜이다. HTTP/1.1이 클라이언트가 편지를 보내고 서버가 답장만 하는 방식이라면, WebSocket은 서로가 자유롭게 대화를 나누는 전화 통화에 비유할 수 있다.

### 핸드셰이크(Handshake)을 통한 연결 수립

WebSocket 연결은 처음에 HTTP를 통해 업그레이드 요청을 보내는 것으로 시작된다. 클라이언트는 다음과 같은 헤더를 담아 서버에 요청을 보낸다.

```
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

- `Upgrade: websocket` / `Connection: Upgrade`: 현재 HTTP 연결을 WebSocket 프로토콜로 업그레이드하자는 요청이다.
- `Sec-WebSocket-Key`: 클라이언트가 랜덤으로 생성한 값을 Base64로 인코딩한 문자열이다. 서버는 이 키에 정해진 GUID를 이어붙인 뒤 SHA-1 해시로 계산해 다시 Base64로 인코딩하여 응답으로 돌려보낸다. 클라이언트는 이 값을 검증해 자신이 요청한 서버로부터 온 응답임을 확인한다.

서버가 이를 수락하면 HTTP 연결이 WebSocket 연결로 전환되고, 이후부터는 WebSocket 프로토콜로 양방향 메시지를 주고받을 수 있다.

연결 종료는 한쪽이 `close` 프레임을 보내면 상대방이 이를 확인하고 역시 `close` 프레임으로 응답함으로써 이루어진다. 만약 클라이언트가 비정상 종료(예: 앱 강제 종료)를 하는 경우, 지정된 시간 동안 메시지가 없을 때 확인 패킷을 보내거나 주기적으로 `ping/pong` 프레임을 교환하여 접속 여부를 확인하는 방법을 사용한다.

이처럼 WebSocket은 헤더 크기가 작고 오버헤드가 적어 HTTP보다 효율적인 통신이 가능하다. 하나의 연결을 끝까지 유지하면서도 Long Polling만큼 서버에 부담을 주지 않는다. 덕분에 채팅, 주식, 게임, 협업 도구, 위치 추적 등 다양한 실시간 서비스에 활용된다.

> **참고: TCP/UDP와의 관계**
>
> TCP와 UDP는 전송(Transport) 계층인 Layer 4에서 동작하고, WebSocket은 응용(Application) 계층인 Layer 7에서 동작한다. WebSocket은 내부적으로 TCP를 기반으로 동작하기 때문에 데이터의 순서와 신뢰성이 보장된다.

### WebSocket의 한계

하지만 WebSocket이 만능은 아니다. 몇 가지 고려해야 할 한계가 있다.

- **로드 밸런싱 복잡성**: WebSocket은 특정 서버와의 지속적인 연결 안에서 동작하기 때문에, 로드 밸런싱 환경에서는 같은 서버로 요청이 계속 라우팅되도록 Sticky Session 등을 설정해야 한다.
- **메시지 크기 제한**: 브라우저, 서버, 네트워크 환경마다 메시지 크기에 제약이 있을 수 있다. 대용량 데이터는 분할 전송하거나 다른 프로토콜을 병행해야 한다.
- **보안**: 기본 WebSocket 프로토콜(`ws://`)은 암호화되지 않는다. 보안이 필요한 서비스라면 SSL/TLS 인증서를 적용해 `wss://`를 사용해야 한다.
- **서버 부하**: Polling보다는 훨씬 낫지만, 동시 접속자가 많아질수록 유지해야 하는 TCP 연결과 네트워크 대역폭, CPU 사용량이 증가한다.

## WebSocket 위의 메시징 프로토콜 STOMP

WebSocket은 양방향 통신 채널을 제공하지만, 그 자체는 메시지의 형식이나 라우팅 방식을 정의하지 않는다. 예를 들어 "이 메시지는 채팅방 A로 보내야 한다"거나 "특정 토픽을 구독한 사람에게만 전달한다" 같은 로직을 직접 구현해야 한다.

STOMP(Simple Text Oriented Messaging Protocol)는 이러한 메시징 패턴을 표준화한 하위 프로토콜이다. WebSocket 위에서 동작하며, **Pub-Sub(발행-구독)** 모델을 기반으로 메시지를 라우팅한다.

- **Publisher**: 특정 목적지(destination)로 메시지를 발행한다.
- **Subscriber**: 관심 있는 목적지를 구독하고, 해당 목적지로 발행된 메시지를 수신한다.
- **Message Broker**: 발행된 메시지를 받아 구독자들에게 전달하는 중간 역할을 한다.

STOMP의 주요 명령어는 다음과 같다.

| 명령어 | 방향 | 설명 |
|---|---|---|
| `CONNECT` | Client → Server | 서버에 연결을 요청 |
| `SEND` | Client → Server | 특정 목적지로 메시지를 발행 |
| `SUBSCRIBE` | Client → Server | 특정 목적지의 메시지를 구독 |
| `UNSUBSCRIBE` | Client → Server | 구독 취소 |
| `DISCONNECT` | Client → Server | 연결 종료 |
| `MESSAGE` | Server → Client | 구독자에게 메시지를 전달 |

STOMP를 사용하는 이유는 순수 WebSocket 대비 STOMP의 장점은 다음과 같다.

- 하위 프로토콜이나 메시지 형식 컨벤션을 직접 정의할 필요가 없다.
- 연결 주소마다 핸들러를 개별 구현할 필요가 없다.
- RabbitMQ, Kafka 같은 외부 메시지 브로커와 쉽게 연동할 수 있다.
- Spring Security를 메시지 단위로 적용할 수 있다.

## Spring Boot 서버 구현

### 의존성 추가

```gradle
implementation 'org.springframework.boot:spring-boot-starter-websocket'
```

### WebSocket 설정 (`WebSocketConfig`)

```java
@Configuration
@EnableWebSocketMessageBroker  // WebSocket 메시지 브로커를 활성화
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트가 구독할 수 있는 목적지의 Prefix 설정
        // "/subscribe"로 시작하는 목적지를 구독하면 브로커가 메시지를 전달
        config.enableSimpleBroker("/subscribe");

        // 클라이언트가 서버로 메시지를 발행할 때 사용할 Prefix 설정
        // "/publish"로 시작하는 목적지로 보내면 @MessageMapping 핸들러로 라우팅됨
        config.setApplicationDestinationPrefixes("/publish");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 핸드셰이크 엔드포인트 등록
        registry.addEndpoint("/ws-connect")
                .setAllowedOriginPatterns("*")    // CORS 허용 설정
                .withSockJS();  // WebSocket을 지원하지 않는 브라우저를 위한 폴백
    }
}
```

설정 흐름을 정리하면 다음과 같다.

```
Client
  │
  │  HTTP Handshake: /ws-connect (registerStompEndpoints)
  ↓
WebSocket 연결 수립
  │
  │  메시지 발행: /publish/chat (setApplicationDestinationPrefixes)
  ↓
@MessageMapping("/chat") 핸들러
  │
  │  브로커로 전달
  ↓
Message Broker (enableSimpleBroker)
  │
  │  /subscribe/chat 구독자에게 메시지 전달
  ↓
Client (구독자)
```

### 메시지 핸들러 (`ChatController`)

```java
@Controller
public class ChatController {

    // /publish/chat 으로 발행된 메시지를 처리한다
    @MessageMapping("/chat")
    // 처리 결과를 /subscribe/chat 구독자들에게 전달한다
    @SendTo("/subscribe/chat")
    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        return new ChatMessageResponse(request.username(), request.content());
    }
}
```

채팅방이 여럿인 경우, 경로 변수를 사용해 채팅방별로 분리할 수 있다.

```java
// as-is: 단일 채널
@MessageMapping("/chat")
@SendTo("/subscribe/chat")
public ChatMessageResponse sendMessage(ChatMessageRequest request) {
    return new ChatMessageResponse(request.username(), request.content());
}

// to-be: 채팅방 ID로 분리
@MessageMapping("/chat.{chatRoomId}")
@SendTo("/subscribe/chat.{chatRoomId}")
public ChatMessageResponse sendMessage(
        ChatMessageRequest request,
        @DestinationVariable Long chatRoomId) {
    return new ChatMessageResponse(request.username(), request.content());
}
```

## 클라이언트 구현 (JavaScript)

```javascript
// STOMP 클라이언트 생성 및 WebSocket 연결
const stompClient = new StompJs.Client({
    brokerURL: 'ws://example.com/ws-connect'
});

stompClient.onConnect = () => {
    // 특정 채팅방 구독 (서버로부터 메시지를 받을 준비)
    stompClient.subscribe('/subscribe/chat.1', (message) => {
        const body = JSON.parse(message.body);
        console.log(`${body.username}: ${body.content}`);
    });
};

// 메시지 발행 (서버로 메시지 전송)
function sendMessage() {
    stompClient.publish({
        destination: '/publish/chat.1',
        body: JSON.stringify({
            username: 'Alice',
            content: 'Hello!'
        })
    });
}

// 연결 시작
stompClient.activate();
```

전 과정의 흐름을 정리하면 다음과 같다.

```
[Client A]                    [Server]                  [Client B]
    │                             │                          │
    │── activate() ──────────────>│ (WebSocket Handshake)    │
    │── SUBSCRIBE /subscribe/1 ──>│                          │
    │                             │<── SUBSCRIBE /subscribe/1│
    │── SEND /publish/chat.1 ────>│                          │
    │                             │── MESSAGE ──────────────>│
    │                             │── MESSAGE ──────────────>│ (자기 자신 포함)
```

## 분산 환경에서의 문제: 외부 메시지 브로커

Spring의 기본 인메모리 브로커(`enableSimpleBroker`)는 애플리케이션이 실행 중인 서버의 메모리 안에서만 동작한다.

```
[서버 A]              [서버 B]
  ├─ Client 1          ├─ Client 3
  └─ Client 2          └─ Client 4
  인메모리 브로커         인메모리 브로커
       (독립)                (독립)
```

로드 밸런싱으로 서버가 여러 대 운영되는 환경에서는, Client 1이 발행한 메시지가 서버 A의 인메모리 브로커에만 전달되어 서버 B에 연결된 Client 3, 4는 해당 메시지를 받지 못하는 **팬텀 현상**이 발생할 수 있다.

이 문제는 RabbitMQ나 Kafka 같은 **외부 메시지 브로커**를 사용하여 해결한다.

```
[서버 A]              [외부 브로커]         [서버 B]
  ├─ Client 1   <──>   (RabbitMQ)   <──>    ├─ Client 3
  └─ Client 2          (Kafka...)            └─ Client 4
```

모든 서버가 동일한 외부 브로커를 바라보기 때문에, 어느 서버에 연결된 클라이언트든 같은 채널의 메시지를 수신할 수 있다.

## 예외 처리

### 메시지 발행 과정의 예외

`@MessageMapping` 핸들러에서 발생한 예외는 `@MessageExceptionHandler`로 처리할 수 있다.

```java
@Controller
public class ChatController {

    @MessageMapping("/chat.{chatRoomId}")
    @SendTo("/subscribe/chat.{chatRoomId}")
    public ChatMessageResponse sendMessage(
            ChatMessageRequest request,
            @DestinationVariable Long chatRoomId) {
        if (!chatRoomService.isParticipant(chatRoomId, request.username())) {
            throw new AccessDeniedException("해당 채팅방의 참여자가 아닙니다.");
        }
        return new ChatMessageResponse(request.username(), request.content());
    }

    @MessageExceptionHandler
    public void handleException(Exception e) {
        log.error("WebSocket 메시지 처리 중 예외 발생: {}", e.getMessage());
    }
}
```

### 메시지 구독 과정의 예외 (인터셉터)

구독 요청이 오는 시점에 권한 검사 등을 처리하려면 `ChannelInterceptor`를 구현한다.

```java
@Component
@Slf4j
public class WebSocketInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        if (command == StompCommand.CONNECT) {
            // 연결 시 인증 토큰 검증 등을 처리할 수 있다
            String token = accessor.getFirstNativeHeader("Authorization");
            log.info("WebSocket 연결 요청. token={}", token);
        }

        if (command == StompCommand.SUBSCRIBE) {
            // 구독 시 해당 채널에 대한 접근 권한을 확인할 수 있다
            log.info("구독 요청. destination={}", accessor.getDestination());
        }

        return message;
    }
}
```

인터셉터를 등록하려면 `WebSocketConfig`에 다음을 추가한다.

```java
@Override
public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(webSocketInterceptor);
}
```

## 참고

[Spring Docs - WebSockets](https://docs.spring.io/spring-framework/reference/web/websocket.html)

[RFC 6455 - The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)

[appleboy, STOMP Over WebSocket](http://jmesnil.net/stomp-websocket/doc/)

[StompJs Client Documentation](https://stomp-js.github.io/stomp-websocket/codelab/)