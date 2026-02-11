---
visible: false
title: "STOMP"
date: 2025-07-29 00:00:00
tags: 
  - Java
  - Web Socket
---

## STOMP

- Simple Text Oriented Messageing Protocol
- Message Brocker를 활용하여 쉽게 메시지를 주고 받을 수 있는 Protocol
    - Pub - Sub: Pub이 메시지를 발행하면 Sub이 그것을 수신하는 메시징 패러다임
    - Message Brocker: Pub의 Message를 받아와서 Sub들에게 전달하는 어떤 것
- WebSocket위에 얹어 함께 사용할 수 있는 하위 프로토콜

**명령어**

- CONNECT: 클라이언트가 서버에 연결을 요청할 때 사용한다
- SEND:  클라이언트 또는 서버가 특정 목적지로 메시지를 보낼 때 사용한다
- **SUBSCRIBE: 클라이언트가 특정 목적지의 메시지를 구독할 때 사용한다**
- **UNSUBSCRIBE: 클라이언트가 특정 목적지의 메시지 구독을 취소할 때 사용한다**
- **DISCONNECT: 클라이언트가 서버와의 연결을 종료할 때 사용한다**

**장점**

- 하위 프로토콜 혹은 컨벤션을 따로 정의할 필요가 없다
- 연결 주소마다 새로 핸들러를 구현하고 설정해줄 필요가 없다
- 외부 Messageing Queue를 사용할 수 있다 (RabbitMQ, Kafka, …)
- Spring Security를 사용할 수 있다

### Server

**1. @EnableWebSocketMessageBroker**

- WebSocket 메시지 브로커를 활성화합니다. 이 애노테이션을 사용하면, 해당 클래스는 WebSocket 메시징을 위한 설정을 할 수 있습니다.

**2. WebSocketMessageBrokerConfigurer**

- WebSocket 연결을 처리하는 핸들러를 의미합니다. TextWebSocketHandler를 상속하여 ‘텍스트 기반 메시지’를 보내거나 받을 수 있도록 처리가 가능합니다.

**3. configureMessageBroker(MessageBrokerRegistry config)**

- 메시지 브로커를 구성하는 메서드로, 메시지 브로커가 특정 목적지로 메시지를 라우팅 하는 방식을 설정합니다.
- enableSimpleBroker() 메서드를 통해 접두사를 지정하여 클라이언트가 접두사로 시작하는 주제를 “구독(Sub)”하여 메시지를 받을 수 있습니다.
- setApplicationDestinationPrefixes() 메서드를 통해 접두사로 시작하는 클라이언트가 서버로 메시지를 “발행(Sub)” 이 접두사를 사용합니다.

**4. registerStompEndpoints()**

- STOMP(WebSocket 메시지 브로커 프로토콜) 엔드포인트를 등록하는 메서드로, 클라이언트가 WebSocket에 연결할 수 있는 엔드포인트를 정의합니다.
- addEndpoint() : 클라이언트가 WebSocket에 연결하기 위한 엔드포인트를 "/ws-stomp"로 설정합니다.
- setAllowedOrigins() : 클라이언트의 origin을 명시적으로 지정합니다.
- withSockJS() :WebSocket을 지원하지 않는 브라우저에서도 SockJS를 통해 WebSocket 기능을 사용할 수 있게 합니다.

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
		
		@Override
		public void coinfigureMessageBrocker(MessageBrockerRegistry config) {
				config.enableSimpleBrocker("/subscribe");
				config.setApplicationDestinationPrefixes("/publish");
		}

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-connect")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
		
}
```

```java
@MessageMappping("/chat")
@SendTo("/subscribe/chat")
public ChatMessageResponse sendMessage(ChatMessageRequest request) {
		return new ChatMessageResponse(request.username(), request.content());
}
```

`enableSimpleBrocker` : 스프링의 인메모리 메시지 브로커를 사용한다는 설정

`(”/subscribe”)` : 구독할 주소의 Prefix를 지정

`(”/publish”)` : 메시지를 발행할 주소의 Prefix를 지정

`addEndpoint("/ws")` : 초기 핸드셰이크 과정에서 사용할 Endpoint 지정

`setAllowedOriginPatterns("*")` : CORS 허용 설정

- More


    | **메서드** | **반환 타입** | **설명** |
    | --- | --- | --- |
    | **addArgumentResolvers** | void | 커스텀 컨트롤러 메서드 인자 타입을 지원하기 위한 리졸버를 추가합니다. |
    | **addReturnValueHandlers** | void | 커스텀 컨트롤러 메서드 반환 값 타입을 지원하기 위한 핸들러를 추가합니다. |
    | **configureClientInboundChannel** | void | WebSocket 클라이언트로부터 들어오는 메시지를 위한 MessageChannel을 구성합니다. |
    | **configureClientOutboundChannel** | void | WebSocket 클라이언트로 나가는 메시지를 위한 MessageChannel을 구성합니다. |
    | **configureMessageBroker** | void | 메시지 브로커 옵션을 구성합니다. |
    | **configureMessageConverters** | boolean | 주석이 달린 메서드의 메시지 페이로드 추출 및 메시지 전송 시 사용할 메시지 변환기를 구성합니다. |
    | **configureWebSocketTransport** | void | WebSocket 클라이언트로부터 받은 메시지와 클라이언트로 보내는 메시지 처리와 관련된 옵션을 구성합니다. |
    | **getPhase** | Integer | SmartLifecycle 타입의 WebSocket 메시지 처리 빈이 실행되어야 하는 단계를 반환합니다. |
    | **registerStompEndpoints** | void | 각각 특정 URL에 매핑되는 STOMP 엔드포인트를 등록하고, 선택적으로 SockJS 폴백 옵션을 활성화하고 구성합니다. |

### Client

오프닝 핸드셰이크

```jsx
const stompClient : StompJs.Client = new StompJs.Client({
		brockerURL: 'ws://example.com/ws-connect'
});
```

메시지 발행

```jsx
stompClient.publish({
		destination: "/publish/chat",
		body: JSON.stringify({
				'username': $("#na").val(), 
				'content': $("#name").val()
		})
})
```

구독

```jsx
stompClient.subscribe('/subscribe/chat' (greeting) => {
		// parse body and render
});
```

### Example

as-is

```java
@MessageMappping("/chat")
@SendTo("/subscribe/chat")
public ChatMessageResponse sendMessage(ChatMessageRequest request) {
		return new ChatMessageResponse(request.username(), request.content());
}
```

to-be

```java
@MessageMappping("/chat.{chatRoomId}")
@SendTo("/subscribe/chat.{chatRoomId}")
public ChatMessageResponse sendMessage(ChatMessageRequest request, @DestinationVariable lOng charRoomId) {
		return new ChatMessageResponse(request.username(), request.content());
}
```

### 문제점

기본 제공하는 메시지 브로커는 인메모리 기반이므로 각각의 컴퓨팅 리소스가 다른 분산 환경일 경우 같은 채널에 있다고 해도 다른 컴퓨팅의 인메모리를 보고 있을 수 있기 때문에 팬텀현상이 발생할 수 있다.

그래서 이때는 기본적으로 제공하는 인메모리 기반 메시지 브로커가 아닌 Kafka나 RebbitMQ 같은 외부 메시지 브로커를 사용하여 해결 하면 된다.

### **예외 처리**

메시지 발행 과정

```java
@MessageMappping("/chat.{chatRoomId}")
@SendTo("/subscribe/chat.{chatRoomId}")
public ChatMessageResponse sendMessage(ChatMessageRequest request, @DestinationVariable lOng charRoomId) {
		if (request.username.equals("John")) {
				throw new RuntimeException("John is not permittion this chat");
		}
		return new ChatMessageResponse(request.username(), request.content());
}
```

```java
@MessageExceptionHandelr
public void handleException(RuntimeException e) { 
		log.info("Exceptiopn: {}", e.getMessage());
}
```

메시지 구독 과정

```java
@Component
@Slf4j
public class WebSocketInterceptor implements ChannelInterceptor {
		@Override
		public Message<?> preSend(Message<?> message, MessageChannel channel){
				StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
				StompCommand command = accessor.getCommand();
				if (command == StompCommand.SUBSCRIBE) {
						log.info(accessor.getDestination());
				}
				return message;
		}
}
```