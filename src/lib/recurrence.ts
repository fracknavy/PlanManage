import { RRule, RRuleSet, rrulestr } from "rrule";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly";

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval: number;
  count?: number;
  until?: Date;
  byWeekDay?: number[];
}

/**
 * 创建 RRULE 字符串
 */
export function createRecurrenceRule(config: RecurrenceConfig): string {
  const { frequency, interval, count, until, byWeekDay } = config;

  let freq: number;
  switch (frequency) {
    case "daily":
      freq = RRule.DAILY;
      break;
    case "weekly":
      freq = RRule.WEEKLY;
      break;
    case "monthly":
      freq = RRule.MONTHLY;
      break;
    default:
      freq = RRule.DAILY;
  }

  const options: any = {
    freq,
    interval,
  };

  if (count) {
    options.count = count;
  }

  if (until) {
    options.until = until;
  }

  if (byWeekDay && byWeekDay.length > 0) {
    options.byweekday = byWeekDay;
  }

  const rule = new RRule(options);
  return rule.toString();
}

/**
 * 解析 RRULE 字符串
 */
export function parseRecurrenceRule(ruleString: string): RRule | null {
  try {
    return rrulestr(ruleString) as RRule;
  } catch (error) {
    console.error("Failed to parse RRULE:", error);
    return null;
  }
}

/**
 * 获取重复任务的下一次发生日期
 */
export function getNextOccurrence(
  ruleString: string,
  after: Date = new Date()
): Date | null {
  try {
    const rule = parseRecurrenceRule(ruleString);
    if (!rule) return null;
    return rule.after(after);
  } catch (error) {
    console.error("Failed to get next occurrence:", error);
    return null;
  }
}

/**
 * 获取重复任务的未来N次发生日期
 */
export function getFutureOccurrences(
  ruleString: string,
  count: number = 5,
  after: Date = new Date()
): Date[] {
  try {
    const rule = parseRecurrenceRule(ruleString);
    if (!rule) return [];
    return rule.all((date, i) => i < count);
  } catch (error) {
    console.error("Failed to get future occurrences:", error);
    return [];
  }
}

/**
 * 验证 RRULE 字符串是否有效
 */
export function isValidRecurrenceRule(ruleString: string): boolean {
  try {
    const rule = parseRecurrenceRule(ruleString);
    return rule !== null;
  } catch {
    return false;
  }
}

/**
 * 获取重复规则的描述文本
 */
export function getRecurrenceDescription(ruleString: string): string {
  try {
    const rule = parseRecurrenceRule(ruleString);
    if (!rule) return "无效的重复规则";
    return rule.toText();
  } catch (error) {
    return "无效的重复规则";
  }
}

/**
 * 创建简单的每日重复规则
 */
export function createDailyRule(interval: number = 1, count?: number): string {
  return createRecurrenceRule({
    frequency: "daily",
    interval,
    count,
  });
}

/**
 * 创建简单的每周重复规则
 */
export function createWeeklyRule(
  interval: number = 1,
  byWeekDay?: number[],
  count?: number
): string {
  return createRecurrenceRule({
    frequency: "weekly",
    interval,
    count,
    byWeekDay,
  });
}

/**
 * 创建简单的每月重复规则
 */
export function createMonthlyRule(interval: number = 1, count?: number): string {
  return createRecurrenceRule({
    frequency: "monthly",
    interval,
    count,
  });
}
