"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ListTodo,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight
} from "lucide-react";
import { Task, Schedule } from "@/types";
import { formatDate, getPriorityColor, getStatusColor, getTypeIcon } from "@/lib/utils";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, scheduleRes] = await Promise.all([
        fetch("/api/tasks?status=NOT_STARTED&status=IN_PROGRESS"),
        fetch(`/api/schedule?date=${new Date().toISOString()}&view=day`),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.slice(0, 5)); // 只显示前5个
      }

      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        if (scheduleData.length > 0) {
          setTodaySchedule(scheduleData[0]);
        }
      }
    } catch (error) {
      console.error("Fetch dashboard data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalTasks: tasks.length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    urgent: tasks.filter((t) => t.priority === "URGENT").length,
    dueToday: tasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
      );
    }).length,
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              新建任务
            </Link>
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待处理任务</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.inProgress} 个进行中
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日日程</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todaySchedule?.items.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                个日程安排
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">紧急任务</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.urgent}
              </div>
              <p className="text-xs text-muted-foreground">
                需要立即处理
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日截止</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dueToday}</div>
              <p className="text-xs text-muted-foreground">
                个任务今天到期
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 最近任务 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>最近任务</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/tasks">
                    查看全部
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>您最近的待处理任务</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    暂无任务
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getTypeIcon(task.type)}</span>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {task.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(task.dueDate))}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 今日日程 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>今日日程</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/schedule">
                    查看时间表
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>{formatDate(new Date())}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!todaySchedule || todaySchedule.items.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">暂无日程安排</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link href="/schedule">自动生成时间表</Link>
                    </Button>
                  </div>
                ) : (
                  todaySchedule.items.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 rounded-lg border p-4"
                    >
                      <div className="flex-shrink-0 w-16 text-sm text-muted-foreground">
                        {new Date(item.startTime).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex-1">
                        {item.isBreak ? (
                          <p className="text-muted-foreground">☕ 休息时间</p>
                        ) : (
                          <p className="font-medium">
                            {item.task?.title || "未知任务"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
