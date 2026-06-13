/**
 * 移动端手势工具
 */

export interface SwipeEvent {
  direction: "left" | "right" | "up" | "down";
  distance: number;
  velocity: number;
  duration: number;
}

export interface LongPressEvent {
  x: number;
  y: number;
  duration: number;
}

export interface PinchEvent {
  scale: number;
  centerX: number;
  centerY: number;
}

export interface GestureCallbacks {
  onSwipe?: (event: SwipeEvent) => void;
  onSwipeLeft?: (event: SwipeEvent) => void;
  onSwipeRight?: (event: SwipeEvent) => void;
  onSwipeUp?: (event: SwipeEvent) => void;
  onSwipeDown?: (event: SwipeEvent) => void;
  onLongPress?: (event: LongPressEvent) => void;
  onPinch?: (event: PinchEvent) => void;
}

/**
 * 手势检测器
 */
export class GestureDetector {
  private element: HTMLElement;
  private callbacks: GestureCallbacks;
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  private isLongPress: boolean = false;
  private initialDistance: number = 0;

  // 配置
  private swipeThreshold: number = 50;
  private swipeTimeout: number = 300;
  private longPressDuration: number = 500;

  constructor(element: HTMLElement, callbacks: GestureCallbacks) {
    this.element = element;
    this.callbacks = callbacks;
    this.bindEvents();
  }

  private bindEvents(): void {
    // 触摸事件
    this.element.addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false });
    this.element.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false });
    this.element.addEventListener("touchend", this.onTouchEnd.bind(this), { passive: false });
    this.element.addEventListener("touchcancel", this.onTouchCancel.bind(this), { passive: false });

    // 鼠标事件（用于桌面端测试）
    this.element.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.element.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.element.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  private onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    this.isLongPress = false;

    // 检测双指手势（缩放）
    if (event.touches.length === 2) {
      this.initialDistance = this.getDistance(event.touches[0], event.touches[1]);
    }

    // 开始长按检测
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      if (this.callbacks.onLongPress) {
        this.callbacks.onLongPress({
          x: touch.clientX,
          y: touch.clientY,
          duration: this.longPressDuration,
        });
      }
    }, this.longPressDuration);
  }

  private onTouchMove(event: TouchEvent): void {
    // 取消长按检测
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // 检测缩放手势
    if (event.touches.length === 2 && this.callbacks.onPinch) {
      const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
      const scale = currentDistance / this.initialDistance;
      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

      this.callbacks.onPinch({
        scale,
        centerX,
        centerY,
      });
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    // 取消长按检测
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // 如果是长按，不处理滑动
    if (this.isLongPress) {
      return;
    }

    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    this.handleSwipe(endX, endY, endTime);
  }

  private onTouchCancel(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private onMouseDown(event: MouseEvent): void {
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startTime = Date.now();
    this.isLongPress = false;

    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      if (this.callbacks.onLongPress) {
        this.callbacks.onLongPress({
          x: event.clientX,
          y: event.clientY,
          duration: this.longPressDuration,
        });
      }
    }, this.longPressDuration);
  }

  private onMouseMove(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private onMouseUp(event: MouseEvent): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (this.isLongPress) {
      return;
    }

    this.handleSwipe(event.clientX, event.clientY, Date.now());
  }

  private handleSwipe(endX: number, endY: number, endTime: number): void {
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const duration = endTime - this.startTime;

    // 检查是否在时间限制内
    if (duration > this.swipeTimeout) {
      return;
    }

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // 检查是否达到阈值
    if (absDeltaX < this.swipeThreshold && absDeltaY < this.swipeThreshold) {
      return;
    }

    // 确定方向
    let direction: SwipeEvent["direction"];
    let distance: number;

    if (absDeltaX > absDeltaY) {
      direction = deltaX > 0 ? "right" : "left";
      distance = absDeltaX;
    } else {
      direction = deltaY > 0 ? "down" : "up";
      distance = absDeltaY;
    }

    const velocity = distance / duration;

    const swipeEvent: SwipeEvent = {
      direction,
      distance,
      velocity,
      duration,
    };

    // 调用通用滑动回调
    if (this.callbacks.onSwipe) {
      this.callbacks.onSwipe(swipeEvent);
    }

    // 调用方向特定回调
    const directionCallbacks: Record<string, ((event: SwipeEvent) => void) | undefined> = {
      left: this.callbacks.onSwipeLeft,
      right: this.callbacks.onSwipeRight,
      up: this.callbacks.onSwipeUp,
      down: this.callbacks.onSwipeDown,
    };

    const directionCallback = directionCallbacks[direction];
    if (directionCallback) {
      directionCallback(swipeEvent);
    }
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  /**
   * 销毁检测器
   */
  destroy(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }

    this.element.removeEventListener("touchstart", this.onTouchStart.bind(this));
    this.element.removeEventListener("touchmove", this.onTouchMove.bind(this));
    this.element.removeEventListener("touchend", this.onTouchEnd.bind(this));
    this.element.removeEventListener("touchcancel", this.onTouchCancel.bind(this));
    this.element.removeEventListener("mousedown", this.onMouseDown.bind(this));
    this.element.removeEventListener("mousemove", this.onMouseMove.bind(this));
    this.element.removeEventListener("mouseup", this.onMouseUp.bind(this));
  }
}

/**
 * React Hook: 使用手势检测
 */
export function useGestures(
  ref: React.RefObject<HTMLElement>,
  callbacks: GestureCallbacks
): void {
  if (typeof window === "undefined") {
    return;
  }

  const { useEffect } = require("react");

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const detector = new GestureDetector(element, callbacks);

    return () => {
      detector.destroy();
    };
  }, [ref, callbacks]);
}
