"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Repeat } from "lucide-react";
import Link from "next/link";
import { Task } from "@/types";
import { createRecurrenceRule, RecurrenceFrequency } from "@/lib/recurrence";

export default function NewTaskPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [parentTasks, setParentTasks] = useState<Task[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceConfig, setRecurrenceConfig] = useState({
    frequency: "daily" as RecurrenceFrequency,
    interval: 1,
    count: 0,
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedTime: 30,
    weight: 5,
    priority: "MEDIUM",
    type: "OTHER",
    isFixed: false,
    dueDate: "",
    sourceUrl: "",
    parentId: "",
  });

  useEffect(() => {
    fetchParentTasks();
  }, []);

  const fetchParentTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        // 只显示没有父任务的任务作为可选父任务
        setParentTasks(data.filter((task: Task) => !task.parentId));
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let recurrenceRule = null;
      if (isRecurring) {
        recurrenceRule = createRecurrenceRule({
          frequency: recurrenceConfig.frequency,
          interval: recurrenceConfig.interval,
          count: recurrenceConfig.count > 0 ? recurrenceConfig.count : undefined,
        });
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          parentId: formData.parentId || null,
          isRecurring,
          recurrenceRule,
        }),
      });

      if (response.ok) {
        toast({
          title: "任务已创建",
        });
        router.push("/tasks");
      } else {
        throw new Error("创建失败");
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "创建任务失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">新建任务</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>任务信息</CardTitle>
            <CardDescription>填写任务的详细信息</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">任务标题 *</Label>
                <Input
                  id="title"
                  placeholder="输入任务标题"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">任务描述</Label>
                <Textarea
                  id="description"
                  placeholder="输入任务描述（可选）"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">预计耗时（分钟）*</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="1"
                    value={formData.estimatedTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedTime: parseInt(e.target.value) || 30,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">权重 (1-10)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseInt(e.target.value) || 5,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>优先级</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">低</SelectItem>
                      <SelectItem value="MEDIUM">中</SelectItem>
                      <SelectItem value="HIGH">高</SelectItem>
                      <SelectItem value="URGENT">紧急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>任务类型</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WORK">工作</SelectItem>
                      <SelectItem value="STUDY">学习</SelectItem>
                      <SelectItem value="PERSONAL">个人</SelectItem>
                      <SelectItem value="HEALTH">健康</SelectItem>
                      <SelectItem value="OTHER">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">截止时间</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceUrl">来源链接</Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.sourceUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceUrl: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>父任务（可选）</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父任务（创建子任务）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无父任务</SelectItem>
                    {parentTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  选择父任务后，此任务将作为子任务
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isRecurring"
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                  <Label htmlFor="isRecurring" className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    重复任务
                  </Label>
                </div>

                {isRecurring && (
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>重复频率</Label>
                        <Select
                          value={recurrenceConfig.frequency}
                          onValueChange={(value) =>
                            setRecurrenceConfig({
                              ...recurrenceConfig,
                              frequency: value as RecurrenceFrequency,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">每天</SelectItem>
                            <SelectItem value="weekly">每周</SelectItem>
                            <SelectItem value="monthly">每月</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>间隔</Label>
                          <Input
                            type="number"
                            min="1"
                            value={recurrenceConfig.interval}
                            onChange={(e) =>
                              setRecurrenceConfig({
                                ...recurrenceConfig,
                                interval: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            每 {recurrenceConfig.interval}{" "}
                            {recurrenceConfig.frequency === "daily"
                              ? "天"
                              : recurrenceConfig.frequency === "weekly"
                              ? "周"
                              : "月"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>重复次数（0为无限）</Label>
                          <Input
                            type="number"
                            min="0"
                            value={recurrenceConfig.count}
                            onChange={(e) =>
                              setRecurrenceConfig({
                                ...recurrenceConfig,
                                count: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFixed"
                  checked={formData.isFixed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFixed: checked })
                  }
                />
                <Label htmlFor="isFixed">固定时间任务（不可被自动排程移动）</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" asChild>
                  <Link href="/tasks">取消</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "创建中..." : "创建任务"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
