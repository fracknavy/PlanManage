"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, SkipForward, Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BreakTimerProps {
  duration: number; // 分钟
  onBreakEnd?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

export function BreakTimer({
  duration,
  onBreakEnd,
  onSkip,
  autoStart = false,
}: BreakTimerProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(duration * 60); // 转换为秒
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 计算进度百分比
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  // 倒计时逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // 休息结束
            setIsRunning(false);
            handleBreakEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, isPaused, timeLeft]);

  // 休息结束处理
  const handleBreakEnd = useCallback(() => {
    // 发送通知
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("休息结束", {
        body: "休息时间已结束，准备开始下一个任务吧！",
        icon: "/favicon.ico",
      });
    }

    toast({
      title: "休息结束",
      description: "休息时间已结束，准备开始下一个任务吧！",
    });

    onBreakEnd?.();
  }, [onBreakEnd, toast]);

  // 开始/继续休息
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  // 暂停休息
  const handlePause = () => {
    setIsPaused(true);
  };

  // 跳过休息
  const handleSkip = () => {
    setIsRunning(false);
    setTimeLeft(0);
    onSkip?.();

    toast({
      title: "已跳过休息",
      description: "休息时间已跳过",
    });
  };

  // 重置休息
  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration * 60);
  };

  // 请求通知权限
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* 图标和标题 */}
          <div className="flex items-center space-x-2">
            <Coffee className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold">休息时间</h3>
          </div>

          {/* 倒计时显示 */}
          <div className="relative w-32 h-32">
            {/* 背景圆环 */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              {/* 进度圆环 */}
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                className="text-blue-500 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            {/* 时间文字 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-mono font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* 状态标签 */}
          <Badge variant={isRunning ? (isPaused ? "secondary" : "default") : "outline"}>
            {!isRunning
              ? "准备开始"
              : isPaused
              ? "已暂停"
              : "休息中"}
          </Badge>

          {/* 控制按钮 */}
          <div className="flex items-center space-x-2">
            {!isRunning ? (
              <Button onClick={handleStart} size="sm">
                <Play className="mr-2 h-4 w-4" />
                开始休息
              </Button>
            ) : isPaused ? (
              <Button onClick={handleStart} size="sm">
                <Play className="mr-2 h-4 w-4" />
                继续
              </Button>
            ) : (
              <Button onClick={handlePause} size="sm" variant="outline">
                <Pause className="mr-2 h-4 w-4" />
                暂停
              </Button>
            )}

            <Button onClick={handleSkip} size="sm" variant="outline">
              <SkipForward className="mr-2 h-4 w-4" />
              跳过
            </Button>

            <Button onClick={handleReset} size="sm" variant="ghost">
              <RotateCcw className="mr-2 h-4 w-4" />
              重置
            </Button>
          </div>

          {/* 提示文字 */}
          <p className="text-sm text-muted-foreground text-center">
            休息一下，放松身心，提高工作效率
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
