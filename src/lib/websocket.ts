/**
 * WebSocket 实时同步工具
 */

export type MessageType =
  | "task_created"
  | "task_updated"
  | "task_deleted"
  | "task_completed"
  | "schedule_updated"
  | "user_online"
  | "user_offline"
  | "sync_request"
  | "sync_response";

export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  userId: string;
  timestamp: number;
}

type MessageHandler = (message: WebSocketMessage) => void;

/**
 * WebSocket 管理器
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private handlers: Map<MessageType, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * 连接 WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        return;
      }

      this.isConnecting = true;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          // 发送认证消息
          this.send({
            type: "user_online",
            payload: { userId: this.userId },
            userId: this.userId,
            timestamp: Date.now(),
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.isConnecting = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
  }

  /**
   * 发送消息
   */
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  /**
   * 注册消息处理器
   */
  on(type: MessageType, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }

    this.handlers.get(type)!.push(handler);

    // 返回取消注册函数
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * 处理消息
   */
  private handleMessage(message: WebSocketMessage): void {
    // 忽略自己发送的消息
    if (message.userId === this.userId) {
      return;
    }

    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
    );

    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  /**
   * 获取连接状态
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

/**
 * 创建 WebSocket 管理器实例
 */
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(userId: string): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(userId);
  }
  return wsManager;
}

/**
 * 广播任务更新
 */
export function broadcastTaskUpdate(
  taskId: string,
  action: "created" | "updated" | "deleted" | "completed"
): void {
  if (!wsManager?.isConnected) {
    return;
  }

  const typeMap: Record<string, MessageType> = {
    created: "task_created",
    updated: "task_updated",
    deleted: "task_deleted",
    completed: "task_completed",
  };

  wsManager.send({
    type: typeMap[action],
    payload: { taskId },
    userId: wsManager["userId"],
    timestamp: Date.now(),
  });
}

/**
 * 广播时间表更新
 */
export function broadcastScheduleUpdate(scheduleId: string): void {
  if (!wsManager?.isConnected) {
    return;
  }

  wsManager.send({
    type: "schedule_updated",
    payload: { scheduleId },
    userId: wsManager["userId"],
    timestamp: Date.now(),
  });
}
