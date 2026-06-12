"use client";

import { useState, useEffect, useCallback } from "react";
import { Schedule, ScheduleItem } from "@/types";

interface UseScheduleOptions {
  date?: Date;
  view?: "day" | "week";
}

export function useSchedule(options: UseScheduleOptions = {}) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const date = options.date || new Date();
  const view = options.view || "day";

  const fetchSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dateStr = date.toISOString();
      const response = await fetch(
        `/api/schedule?date=${dateStr}&view=${view}`
      );

      if (!response.ok) {
        throw new Error("获取时间表失败");
      }

      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setIsLoading(false);
    }
  }, [date, view]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const generateSchedule = async (targetDate?: Date) => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: (targetDate || date).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("生成时间表失败");
      }

      const data = await response.json();
      await fetchSchedule();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const updateScheduleItem = async (
    itemId: string,
    data: Partial<ScheduleItem>
  ) => {
    const response = await fetch(`/api/schedule/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("更新日程项失败");
    }

    const updatedItem = await response.json();
    await fetchSchedule();
    return updatedItem;
  };

  const currentSchedule = schedules.find((s) => {
    const scheduleDate = new Date(s.date);
    return (
      scheduleDate.getDate() === date.getDate() &&
      scheduleDate.getMonth() === date.getMonth() &&
      scheduleDate.getFullYear() === date.getFullYear()
    );
  });

  return {
    schedules,
    currentSchedule,
    isLoading,
    isGenerating,
    error,
    fetchSchedule,
    generateSchedule,
    updateScheduleItem,
  };
}
