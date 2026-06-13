import { describe, it, expect } from "vitest";
import {
  cn,
  formatTime,
  formatDate,
  formatDateTime,
  addMinutes,
  diffInMinutes,
  isSameDay,
  getStartOfDay,
  getEndOfDay,
  getPriorityColor,
  getStatusColor,
} from "../utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    expect(cn("class1", true && "class2", false && "class3")).toBe("class1 class2");
  });

  it("should handle undefined and null", () => {
    expect(cn("class1", undefined, null)).toBe("class1");
  });
});

describe("formatTime", () => {
  it("should format time correctly", () => {
    const date = new Date(2024, 0, 1, 14, 30);
    expect(formatTime(date)).toBe("14:30");
  });

  it("should pad single digits", () => {
    const date = new Date(2024, 0, 1, 9, 5);
    expect(formatTime(date)).toBe("09:05");
  });
});

describe("formatDate", () => {
  it("should format date correctly", () => {
    const date = new Date(2024, 0, 15);
    const formatted = formatDate(date);
    expect(formatted).toContain("2024");
    expect(formatted).toContain("1");
    expect(formatted).toContain("15");
  });
});

describe("formatDateTime", () => {
  it("should format date and time correctly", () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const formatted = formatDateTime(date);
    expect(formatted).toContain("2024");
    expect(formatted).toContain("14:30");
  });
});

describe("addMinutes", () => {
  it("should add minutes correctly", () => {
    const date = new Date(2024, 0, 1, 14, 30);
    const result = addMinutes(date, 30);
    expect(result.getHours()).toBe(15);
    expect(result.getMinutes()).toBe(0);
  });

  it("should handle crossing hour boundary", () => {
    const date = new Date(2024, 0, 1, 14, 45);
    const result = addMinutes(date, 30);
    expect(result.getHours()).toBe(15);
    expect(result.getMinutes()).toBe(15);
  });

  it("should handle crossing day boundary", () => {
    const date = new Date(2024, 0, 1, 23, 30);
    const result = addMinutes(date, 60);
    expect(result.getDate()).toBe(2);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(30);
  });
});

describe("diffInMinutes", () => {
  it("should calculate difference correctly", () => {
    const start = new Date(2024, 0, 1, 14, 0);
    const end = new Date(2024, 0, 1, 15, 30);
    expect(diffInMinutes(start, end)).toBe(90);
  });

  it("should handle negative difference", () => {
    const start = new Date(2024, 0, 1, 15, 30);
    const end = new Date(2024, 0, 1, 14, 0);
    expect(diffInMinutes(start, end)).toBe(-90);
  });
});

describe("isSameDay", () => {
  it("should return true for same day", () => {
    const date1 = new Date(2024, 0, 1, 10, 0);
    const date2 = new Date(2024, 0, 1, 15, 0);
    expect(isSameDay(date1, date2)).toBe(true);
  });

  it("should return false for different days", () => {
    const date1 = new Date(2024, 0, 1, 10, 0);
    const date2 = new Date(2024, 0, 2, 10, 0);
    expect(isSameDay(date1, date2)).toBe(false);
  });
});

describe("getStartOfDay", () => {
  it("should return start of day", () => {
    const date = new Date(2024, 0, 1, 14, 30, 45);
    const start = getStartOfDay(date);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });
});

describe("getEndOfDay", () => {
  it("should return end of day", () => {
    const date = new Date(2024, 0, 1, 14, 30, 45);
    const end = getEndOfDay(date);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });
});

describe("getPriorityColor", () => {
  it("should return correct colors for each priority", () => {
    expect(getPriorityColor("LOW")).toContain("gray");
    expect(getPriorityColor("MEDIUM")).toContain("blue");
    expect(getPriorityColor("HIGH")).toContain("orange");
    expect(getPriorityColor("URGENT")).toContain("red");
  });
});

describe("getStatusColor", () => {
  it("should return correct colors for each status", () => {
    expect(getStatusColor("NOT_STARTED")).toContain("gray");
    expect(getStatusColor("IN_PROGRESS")).toContain("blue");
    expect(getStatusColor("COMPLETED")).toContain("green");
    expect(getStatusColor("OVERDUE")).toContain("red");
  });
});
