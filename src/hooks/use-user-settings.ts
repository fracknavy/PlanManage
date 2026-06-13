"use client";

import { useState, useEffect, useCallback } from "react";

interface UserSettings {
  defaultWorkStartTime: string;
  defaultWorkEndTime: string;
  defaultBreakDuration: number;
  defaultTaskWeight: number;
}

interface UseUserSettingsReturn {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<boolean>;
}

const defaultSettings: UserSettings = {
  defaultWorkStartTime: "09:00",
  defaultWorkEndTime: "18:00",
  defaultBreakDuration: 15,
  defaultTaskWeight: 5,
};

export function useUserSettings(): UseUserSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/settings");

      if (!response.ok) {
        throw new Error("获取用户设置失败");
      }

      const data = await response.json();
      setSettings({
        defaultWorkStartTime: data.defaultWorkStartTime || defaultSettings.defaultWorkStartTime,
        defaultWorkEndTime: data.defaultWorkEndTime || defaultSettings.defaultWorkEndTime,
        defaultBreakDuration: data.defaultBreakDuration || defaultSettings.defaultBreakDuration,
        defaultTaskWeight: data.defaultTaskWeight || defaultSettings.defaultTaskWeight,
      });
    } catch (err) {
      console.error("Fetch user settings error:", err);
      setError(err instanceof Error ? err.message : "获取用户设置失败");
      // 使用默认设置作为降级
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error("更新用户设置失败");
      }

      const data = await response.json();
      setSettings((prev) => ({
        ...prev!,
        ...data,
      }));

      return true;
    } catch (err) {
      console.error("Update user settings error:", err);
      setError(err instanceof Error ? err.message : "更新用户设置失败");
      return false;
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    refreshSettings: fetchSettings,
    updateSettings,
  };
}
