/**
 * 性能监控和错误追踪工具
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count" | "percent";
  tags?: Record<string, string>;
  timestamp: number;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

type MetricHandler = (metric: PerformanceMetric) => void;
type ErrorHandler = (error: ErrorReport) => void;

/**
 * 性能监控管理器
 */
export class PerformanceMonitor {
  private metricHandlers: MetricHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorReport[] = [];
  private maxMetrics: number = 1000;
  private maxErrors: number = 100;

  /**
   * 注册指标处理器
   */
  onMetric(handler: MetricHandler): () => void {
    this.metricHandlers.push(handler);
    return () => {
      const index = this.metricHandlers.indexOf(handler);
      if (index > -1) {
        this.metricHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 注册错误处理器
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 记录指标
   */
  recordMetric(metric: Omit<PerformanceMetric, "timestamp">): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // 限制存储数量
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // 通知处理器
    this.metricHandlers.forEach((handler) => handler(fullMetric));
  }

  /**
   * 记录错误
   */
  recordError(error: Omit<ErrorReport, "timestamp">): void {
    const fullError: ErrorReport = {
      ...error,
      timestamp: Date.now(),
    };

    this.errors.push(fullError);

    // 限制存储数量
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 通知处理器
    this.errorHandlers.forEach((handler) => handler(fullError));
  }

  /**
   * 测量函数执行时间
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: "ms",
        tags: { ...tags, status: "success" },
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: "ms",
        tags: { ...tags, status: "error" },
      });
      throw error;
    }
  }

  /**
   * 测量同步函数执行时间
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>
  ): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: "ms",
        tags: { ...tags, status: "success" },
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: "ms",
        tags: { ...tags, status: "error" },
      });
      throw error;
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取所有错误
   */
  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * 清除指标
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * 清除错误
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * 获取指标统计
   */
  getMetricStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } | null {
    const metrics = this.metrics.filter((m) => m.name === name);
    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const min = values[0];
    const max = values[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p99Index = Math.floor(count * 0.99);
    const p95 = values[p95Index];
    const p99 = values[p99Index];

    return { count, avg, min, max, p95, p99 };
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor();

/**
 * Web Vitals 监控
 */
export function initWebVitalsMonitoring(): void {
  if (typeof window === "undefined") {
    return;
  }

  // 监控 LCP (Largest Contentful Paint)
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        performanceMonitor.recordMetric({
          name: "web_vitals_lcp",
          value: lastEntry.startTime,
          unit: "ms",
        });
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      console.warn("LCP monitoring not supported");
    }

    // 监控 FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          performanceMonitor.recordMetric({
            name: "web_vitals_fid",
            value: entry.processingStart - entry.startTime,
            unit: "ms",
          });
        });
      });
      fidObserver.observe({ type: "first-input", buffered: true });
    } catch (e) {
      console.warn("FID monitoring not supported");
    }

    // 监控 CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        performanceMonitor.recordMetric({
          name: "web_vitals_cls",
          value: clsValue,
          unit: "count",
        });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      console.warn("CLS monitoring not supported");
    }
  }

  // 监控页面加载时间
  window.addEventListener("load", () => {
    const timing = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (timing) {
      performanceMonitor.recordMetric({
        name: "page_load_time",
        value: timing.loadEventEnd - timing.startTime,
        unit: "ms",
      });
      performanceMonitor.recordMetric({
        name: "dom_content_loaded",
        value: timing.domContentLoadedEventEnd - timing.startTime,
        unit: "ms",
      });
      performanceMonitor.recordMetric({
        name: "first_byte",
        value: timing.responseStart - timing.startTime,
        unit: "ms",
      });
    }
  });
}

/**
 * 全局错误监控
 */
export function initGlobalErrorMonitoring(): void {
  if (typeof window === "undefined") {
    return;
  }

  // 监控 JavaScript 错误
  window.addEventListener("error", (event) => {
    performanceMonitor.recordError({
      message: event.message,
      stack: event.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  });

  // 监控未处理的 Promise 错误
  window.addEventListener("unhandledrejection", (event) => {
    performanceMonitor.recordError({
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  });
}

/**
 * API 调用监控
 */
export function monitorApiCall<T>(
  url: string,
  options: RequestInit,
  handler: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measureAsync(
    `api_call_${options.method || "GET"}`,
    handler,
    { url, method: options.method || "GET" }
  );
}
