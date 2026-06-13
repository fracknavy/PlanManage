/**
 * 无障碍访问工具函数
 */

/**
 * 生成唯一的 ID
 */
let idCounter = 0;
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * 键盘导航常量
 */
export const KEYBOARD_KEYS = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
} as const;

/**
 * 检查元素是否可见
 */
export function isVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

/**
 * 获取焦点元素
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ];

  const elements = container.querySelectorAll<HTMLElement>(selectors.join(","));
  return Array.from(elements).filter(isVisible);
}

/**
 * 焦点陷阱
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== KEYBOARD_KEYS.TAB) return;

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable?.focus();
      }
    }
  }

  container.addEventListener("keydown", handleKeyDown);
  firstFocusable?.focus();

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * 跳过链接
 */
export function createSkipLink(
  targetId: string,
  text: string = "跳过导航"
): HTMLAnchorElement {
  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className =
    "fixed top-0 left-0 z-[9999] bg-primary text-primary-foreground px-4 py-2 transform -translate-y-full focus:translate-y-0 transition-transform";
  return skipLink;
}

/**
 * 宣布消息给屏幕阅读器
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", priority);
  announcer.setAttribute("aria-atomic", "true");
  announcer.className = "sr-only";
  document.body.appendChild(announcer);

  // 延迟设置文本，确保屏幕阅读器能够检测到变化
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);

  // 清理
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 3000);
}

/**
 * 检查是否为高对比度模式
 */
export function isHighContrastMode(): boolean {
  if (typeof window === "undefined") return false;

  const testElement = document.createElement("div");
  testElement.style.backgroundColor = "rgb(31, 41, 55)";
  document.body.appendChild(testElement);

  const computedStyle = window.getComputedStyle(testElement);
  const backgroundColor = computedStyle.backgroundColor;

  document.body.removeChild(testElement);

  return backgroundColor !== "rgb(31, 41, 55)";
}

/**
 * 检查是否为减少动画模式
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 获取颜色对比度
 */
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const adjustGamma = (value: number): number => {
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * adjustGamma(r) + 0.7152 * adjustGamma(g) + 0.0722 * adjustGamma(b);
  };

  const luminance1 = getLuminance(foreground);
  const luminance2 = getLuminance(background);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 检查颜色对比度是否符合 WCAG AA 标准
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  fontSize: number = 16
): boolean {
  const ratio = getContrastRatio(foreground, background);

  // 大文本（18pt 或 14pt 加粗）需要 3:1 的对比度
  if (fontSize >= 18 || (fontSize >= 14 && fontSize >= 14)) {
    return ratio >= 3;
  }

  // 普通文本需要 4.5:1 的对比度
  return ratio >= 4.5;
}

/**
 * ARIA 属性工具
 */
export const aria = {
  /**
   * 创建 ARIA 标签
   */
  label(text: string): { "aria-label": string } {
    return { "aria-label": text };
  },

  /**
   * 创建 ARIA 描述
   */
  describedBy(id: string): { "aria-describedby": string } {
    return { "aria-describedby": id };
  },

  /**
   * 创建 ARIA 扩展状态
   */
  expanded(isExpanded: boolean): { "aria-expanded": boolean } {
    return { "aria-expanded": isExpanded };
  },

  /**
   * 创建 ARIA 选中状态
   */
  selected(isSelected: boolean): { "aria-selected": boolean } {
    return { "aria-selected": isSelected };
  },

  /**
   * 创建 ARIA 隐藏状态
   */
  hidden(isHidden: boolean): { "aria-hidden": boolean } {
    return { "aria-hidden": isHidden };
  },

  /**
   * 创建 ARIA 禁用状态
   */
  disabled(isDisabled: boolean): { "aria-disabled": boolean } {
    return { "aria-disabled": isDisabled };
  },

  /**
   * 创建 ARIA 必填状态
   */
  required(isRequired: boolean): { "aria-required": boolean } {
    return { "aria-required": isRequired };
  },

  /**
   * 创建 ARIA 无效状态
   */
  invalid(isInvalid: boolean): { "aria-invalid": boolean } {
    return { "aria-invalid": isInvalid };
  },

  /**
   * 创建 ARIA 当前状态
   */
  current(
    value: "page" | "step" | "location" | "date" | "time" | boolean
  ): { "aria-current": typeof value } {
    return { "aria-current": value };
  },
};
