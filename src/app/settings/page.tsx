"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Clock, Coffee, Weight } from "lucide-react";

interface UserSettings {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  defaultWorkStartTime: string;
  defaultWorkEndTime: string;
  defaultBreakDuration: number;
  defaultTaskWeight: number;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    id: "",
    email: "",
    name: "",
    avatarUrl: "",
    defaultWorkStartTime: "09:00",
    defaultWorkEndTime: "18:00",
    defaultBreakDuration: 15,
    defaultTaskWeight: 5,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          defaultWorkStartTime: settings.defaultWorkStartTime,
          defaultWorkEndTime: settings.defaultWorkEndTime,
          defaultBreakDuration: settings.defaultBreakDuration,
          defaultTaskWeight: settings.defaultTaskWeight,
        }),
      });

      if (response.ok) {
        toast({
          title: "设置已保存",
        });
      } else {
        throw new Error("保存失败");
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "保存设置失败",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">设置</h1>

        {/* 个人信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <CardTitle>个人信息</CardTitle>
            </div>
            <CardDescription>您的账户基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input value={settings.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input value={settings.name || ""} disabled />
            </div>
          </CardContent>
        </Card>

        {/* 工作时间设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <CardTitle>工作时间</CardTitle>
            </div>
            <CardDescription>
              设置默认的工作时间，用于自动排程
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workStart">开始时间</Label>
                <Input
                  id="workStart"
                  type="time"
                  value={settings.defaultWorkStartTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultWorkStartTime: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workEnd">结束时间</Label>
                <Input
                  id="workEnd"
                  type="time"
                  value={settings.defaultWorkEndTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultWorkEndTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 休息时间设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Coffee className="h-5 w-5" />
              <CardTitle>休息时间</CardTitle>
            </div>
            <CardDescription>
              完成任务后自动插入的休息时间
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="breakDuration">休息时长（分钟）</Label>
              <Input
                id="breakDuration"
                type="number"
                min="5"
                max="60"
                value={settings.defaultBreakDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultBreakDuration: parseInt(e.target.value) || 15,
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                建议 10-20 分钟，帮助恢复精力
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 任务权重设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Weight className="h-5 w-5" />
              <CardTitle>默认任务权重</CardTitle>
            </div>
            <CardDescription>
              新建任务时的默认权重值
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="taskWeight">权重 (1-10)</Label>
              <Input
                id="taskWeight"
                type="number"
                min="1"
                max="10"
                value={settings.defaultTaskWeight}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultTaskWeight: parseInt(e.target.value) || 5,
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                权重越高，自动排程时优先级越高
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存设置"}
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
