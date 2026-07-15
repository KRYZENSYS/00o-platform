/**
 * WebSocket client for real-time chat
 * Auto-reconnects with exponential backoff
 */
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

type MessageHandler = (data: any) => void;
type StatusHandler = (status: 'connecting' | 'open' | 'closed' | 'error') => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isManualClose = false;

  constructor(url: string = WS_URL) {
    this.url = url;
  }

  connect(token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (typeof window === 'undefined') return;

    this.token = token || localStorage.getItem('token');
    this.isManualClose = false;

    const fullUrl = this.token
      ? `${this.url}?token=${encodeURIComponent(this.token)}`
      : this.url;

    this.emitStatus('connecting');

    try {
      this.ws = new WebSocket(fullUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.emitStatus('open');
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') return;
          this.messageHandlers.forEach((h) => h(data));
        } catch (e) {
          console.error('WS message parse error:', e);
        }
      };

      this.ws.onerror = () => this.emitStatus('error');

      this.ws.onclose = () => {
        this.emitStatus('closed');
        this.stopPing();
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
          this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, delay);
        }
      };
    } catch (e) {
      console.error('WS connect error:', e);
      this.emitStatus('error');
    }
  }

  disconnect() {
    this.isManualClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.stopPing();
    this.ws?.close();
    this.ws = null;
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private emitStatus(status: 'connecting' | 'open' | 'closed' | 'error') {
    this.statusHandlers.forEach((h) => h(status));
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  get isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

let wsInstance: WebSocketClient | null = null;

export function getWebSocket(): WebSocketClient {
  if (!wsInstance) {
    wsInstance = new WebSocketClient();
  }
  return wsInstance;
}

export default WebSocketClient;
