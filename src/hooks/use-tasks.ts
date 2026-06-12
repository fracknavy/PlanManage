"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus, Priority, TaskType } from "@/types";

interface UseTasksOptions {
  status?: TaskStatus;
  priority?: Priority;
  type?: TaskType;
}

export function useTasks(options: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.set("status", options.status);
      if (options.priority) params.set("priority", options.priority);
      if (options.type) params.set("type", options.type);

      const response = await fetch(`/api/tasks?${params.toString()}`);

      if (!response.ok) {
        throw new Error("获取任务失败");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.priority, options.type]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData: Partial<Task>) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("创建任务失败");
    }

    const newTask = await response.json();
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("更新任务失败");
    }

    const updatedTask = await response.json();
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? updatedTask : task))
    );
    return updatedTask;
  };

  const deleteTask = async (id: string) => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("删除任务失败");
    }

    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const completeTask = async (id: string) => {
    const response = await fetch(`/api/tasks/${id}/complete`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("完成任务失败");
    }

    const completedTask = await response.json();
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? completedTask : task))
    );
    return completedTask;
  };

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  };
}
