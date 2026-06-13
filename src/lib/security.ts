/**
 * 安全工具函数
 */

import crypto from "crypto";

/**
 * CSRF Token 管理
 */
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_NAME = "csrf_token";

  /**
   * 生成 CSRF Token
   */
  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString("hex");
  }

  /**
   * 验证 CSRF Token
   */
  static validateToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(token, "hex"),
      Buffer.from(sessionToken, "hex")
    );
  }

  /**
   * 获取 Token 名称
   */
  static getTokenName(): string {
    return this.TOKEN_NAME;
  }
}

/**
 * XSS 防护
 */
export class XSSProtection {
  /**
   * 转义 HTML 特殊字符
   */
  static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 清理用户输入
   */
  static sanitizeInput(input: string): string {
    // 移除潜在的脚本标签
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    // 移除事件处理器
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
    // 移除 javascript: 协议
    sanitized = sanitized.replace(/javascript\s*:/gi, "");
    return sanitized;
  }

  /**
   * 验证 URL 是否安全
   */
  static isSafeUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      // 只允许 http 和 https 协议
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}

/**
 * 内容安全策略 (CSP)
 */
export class CSPPolicy {
  private directives: Map<string, string[]> = new Map();

  constructor() {
    // 默认策略
    this.directives.set("default-src", ["'self'"]);
    this.directives.set("script-src", ["'self'", "'unsafe-eval'", "'unsafe-inline'"]);
    this.directives.set("style-src", ["'self'", "'unsafe-inline'"]);
    this.directives.set("img-src", ["'self'", "data:", "https:"]);
    this.directives.set("font-src", ["'self'"]);
    this.directives.set("connect-src", ["'self'"]);
    this.directives.set("frame-src", ["'none'"]);
    this.directives.set("object-src", ["'none'"]);
  }

  /**
   * 添加指令
   */
  addDirective(directive: string, sources: string[]): this {
    this.directives.set(directive, sources);
    return this;
  }

  /**
   * 生成 CSP 字符串
   */
  toString(): string {
    return Array.from(this.directives.entries())
      .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
      .join("; ");
  }

  /**
   * 获取 CSP 头
   */
  getHeader(): Record<string, string> {
    return {
      "Content-Security-Policy": this.toString(),
    };
  }
}

/**
 * 安全头管理
 */
export class SecurityHeaders {
  /**
   * 获取安全头
   */
  static getHeaders(): Record<string, string> {
    return {
      // 防止点击劫持
      "X-Frame-Options": "DENY",
      // 防止 MIME 类型嗅探
      "X-Content-Type-Options": "nosniff",
      // 启用 XSS 过滤
      "X-XSS-Protection": "1; mode=block",
      // 强制 HTTPS
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      // 控制 Referrer 信息
      "Referrer-Policy": "strict-origin-when-cross-origin",
      // 权限策略
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    };
  }
}

/**
 * 密码强度验证
 */
export class PasswordValidator {
  /**
   * 验证密码强度
   */
  static validate(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // 长度检查
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("密码至少需要8个字符");
    }

    // 包含小写字母
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("密码需要包含小写字母");
    }

    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("密码需要包含大写字母");
    }

    // 包含数字
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("密码需要包含数字");
    }

    // 包含特殊字符
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push("密码需要包含特殊字符");
    }

    // 长度奖励
    if (password.length >= 12) {
      score += 1;
    }

    return {
      isValid: score >= 4,
      score: Math.min(5, score),
      feedback,
    };
  }

  /**
   * 获取密码强度描述
   */
  static getStrengthDescription(score: number): string {
    if (score <= 1) return "非常弱";
    if (score <= 2) return "弱";
    if (score <= 3) return "中等";
    if (score <= 4) return "强";
    return "非常强";
  }
}

/**
 * 输入验证
 */
export class InputValidator {
  /**
   * 验证邮箱
   */
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证 URL
   */
  static isUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证手机号（中国大陆）
   */
  static isPhoneNumber(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证身份证号（中国大陆）
   */
  static isIdCard(idCard: string): boolean {
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return idCardRegex.test(idCard);
  }

  /**
   * 检查是否包含 SQL 注入
   */
  static containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
      /(--|;|\/\*|\*\/|xp_|sp_)/i,
      /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    ];
    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * 检查是否包含 XSS
   */
  static containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^>]*>(.*?)<\/script>/is,
      /javascript\s*:/i,
      /on\w+\s*=\s*["'][^"']*["']/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];
    return xssPatterns.some((pattern) => pattern.test(input));
  }
}

/**
 * 速率限制器（客户端）
 */
export class ClientRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * 检查是否允许请求
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * 获取剩余等待时间
   */
  getRemainingTime(key: string): number {
    const record = this.attempts.get(key);
    if (!record) {
      return 0;
    }
    return Math.max(0, record.resetTime - Date.now());
  }

  /**
   * 重置计数器
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}
