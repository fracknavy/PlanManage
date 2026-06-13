"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  RefreshCw,
  GripVertical,
  Coffee,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Schedule, ScheduleItem } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { BreakTimer } from "@/components/schedule/break-timer";

interface SortableItemProps {
  item: ScheduleItem;
  onComplete?: (taskId: string) => void;
  onSkipBreak?: (itemId: string) => void;
}

function SortableItem({ item, onComplete, onSkipBreak }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center rounded-lg border p-4 ${
        item.isBreak
          ? "bg-muted/50 border-dashed"
          : "bg-card"
      } ${isDragging ? "shadow-lg" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="mr-4 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-shrink-0 w-20 text-sm text-muted-foreground">
        {formatTime(new Date(item.startTime))}
        <span className="mx-1">-</span>
        {formatTime(new Date(item.endTime))}
      </div>

      <div className="flex-1 ml-4">
        {item.isBreak ? (
          <div className="flex items-center text-muted-foreground">
            <Coffee className="mr-2 h-4 w-4" />
            休息时间
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-lg mr-2">
              {item.task?.type === "WORK"
                ? "💼"
                : item.task?.type === "STUDY"
                ? "📚"
                : item.task?.type === "HEALTH"
                ? "❤️"
                : "📌"}
            </span>
            <span className="font-medium">{item.task?.title || "未知任务"}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {item.isBreak && onSkipBreak && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSkipBreak(item.id)}
          >
            跳过
          </Button>
        )}
        {!item.isBreak && item.taskId && onComplete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onComplete(item.taskId!)}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function DragOverlayItem({ item }: { item: ScheduleItem }) {
  return (
    <div className="flex items-center rounded-lg border p-4 bg-card shadow-xl">
      <div className="mr-4">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-shrink-0 w-20 text-sm text-muted-foreground">
        {formatTime(new Date(item.startTime))}
        <span className="mx-1">-</span>
        {formatTime(new Date(item.endTime))}
      </div>
      <div className="flex-1 ml-4">
        {item.isBreak ? (
          <div className="flex items-center text-muted-foreground">
            <Coffee className="mr-2 h-4 w-4" />
            休息时间
          </div>
        ) : (
          <div className="flex items-center">
            <span className="font-medium">{item.task?.title || "未知任务"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 空时间轴组件 - 类似苹果日历
function EmptyTimeline() {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 - 22:00
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <div className="relative">
      {/* 当前时间指示器 */}
      {currentHour >= 6 && currentHour < 23 && (
        <div
          className="absolute left-0 right-0 z-10 flex items-center"
          style={{ top: `${((currentHour - 6) * 60 + currentMinute) * (64 / 60)}px` }}
        >
          <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5" />
          <div className="flex-1 h-[2px] bg-red-500" />
        </div>
      )}

      {/* 时间轴 */}
      <div className="space-y-0">
        {hours.map((hour) => {
          const isPast = hour < currentHour;
          const isCurrent = hour === currentHour;

          return (
            <div key={hour} className="flex group">
              {/* 时间标签 */}
              <div className="w-16 flex-shrink-0 text-right pr-4 pt-0">
                <span
                  className={`text-sm ${
                    isCurrent
                      ? "text-red-500 font-medium"
                      : isPast
                      ? "text-muted-foreground/50"
                      : "text-muted-foreground"
                  }`}
                >
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>

              {/* 时间格子 */}
              <div
                className={`flex-1 h-16 border-t border-l pl-2 relative cursor-pointer
                  ${isCurrent ? "border-red-500/30 bg-red-500/5" : "border-border"}
                  ${isPast ? "opacity-50" : ""}
                  hover:bg-muted/50 transition-colors`}
              >
                {/* 半小时线 */}
                <div className="absolute left-0 right-0 top-8 border-t border-dashed border-border/50" />

                {/* 添加任务按钮 (hover 显示) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Plus className="h-4 w-4" />
                    <span>点击添加任务</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 周视图时间轴组件
function WeekTimeline({ date, items }: { date: Date; items: ScheduleItem[] }) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 - 22:00
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // 计算任务在时间轴上的位置
  const getItemPosition = (item: ScheduleItem) => {
    const start = new Date(item.startTime);
    const end = new Date(item.endTime);
    const startMinutes = (start.getHours() - 6) * 60 + start.getMinutes();
    const endMinutes = (end.getHours() - 6) * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;
    return {
      top: `${startMinutes * (32 / 60)}px`,
      height: `${Math.max(duration * (32 / 60), 20)}px`,
    };
  };

  return (
    <div className="relative h-[544px] overflow-hidden"> {/* 17 hours * 32px */}
      {/* 当前时间指示器 - 仅今天显示 */}
      {isToday && currentHour >= 6 && currentHour < 23 && (
        <div
          className="absolute left-0 right-0 z-20 flex items-center"
          style={{ top: `${((currentHour - 6) * 60 + currentMinute) * (32 / 60)}px` }}
        >
          <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
          <div className="flex-1 h-[2px] bg-red-500" />
        </div>
      )}

      {/* 时间格子背景 */}
      <div className="absolute inset-0">
        {hours.map((hour) => (
          <div
            key={hour}
            className={`h-8 border-b ${
              isToday && hour === currentHour
                ? "border-red-500/30 bg-red-500/5"
                : "border-border/50"
            }`}
          />
        ))}
      </div>

      {/* 任务项 */}
      <div className="absolute inset-0 left-1 right-1">
        {items.map((item) => {
          const pos = getItemPosition(item);
          return (
            <div
              key={item.id}
              className={`absolute left-0 right-0 rounded px-1.5 py-0.5 text-xs overflow-hidden cursor-pointer
                ${item.isBreak ? "bg-muted/70" : "bg-primary/10 border border-primary/20"}`}
              style={{ top: pos.top, height: pos.height }}
            >
              {item.isBreak ? (
                <span className="text-muted-foreground">☕</span>
              ) : (
                <span className="font-medium truncate block">
                  {item.task?.title || "任务"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("day");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeBreak, setActiveBreak] = useState<ScheduleItem | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, view]);

  const fetchSchedule = async () => {
    try {
      const dateStr = selectedDate.toISOString();
      const response = await fetch(
        `/api/schedule?date=${dateStr}&view=${view}`
      );

      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Fetch schedule error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "时间表已生成",
          description: "已根据任务权重自动排程",
        });
        fetchSchedule();
      } else {
        throw new Error("生成失败");
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "生成时间表失败",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // 找到包含这些项目的日程
    const schedule = schedules.find((s) =>
      s.items.some((item) => item.id === active.id)
    );

    if (!schedule) return;

    const oldIndex = schedule.items.findIndex((item) => item.id === active.id);
    const newIndex = schedule.items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // 本地更新
    const newItems = arrayMove(schedule.items, oldIndex, newIndex);
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === schedule.id ? { ...s, items: newItems } : s
      )
    );

    // 保存到后端
    try {
      const item = newItems[newIndex];
      const prevItem = newIndex > 0 ? newItems[newIndex - 1] : null;

      // 计算新的开始时间
      let newStartTime: Date;
      if (prevItem) {
        // 在前一个任务结束后开始
        newStartTime = new Date(prevItem.endTime);
        if (!prevItem.isBreak && !item.isBreak) {
          // 如果都不是休息时间，添加5分钟间隔
          newStartTime = new Date(newStartTime.getTime() + 5 * 60000);
        }
      } else {
        newStartTime = new Date(item.startTime);
      }

      const duration =
        new Date(item.endTime).getTime() - new Date(item.startTime).getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);

      const response = await fetch(`/api/schedule/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          order: newIndex,
        }),
      });

      if (!response.ok) {
        throw new Error("更新失败");
      }

      // 刷新数据
      fetchSchedule();
    } catch (error) {
      toast({
        title: "错误",
        description: "保存排序失败",
        variant: "destructive",
      });
      fetchSchedule();
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "任务已完成",
          description: "已自动插入休息时间",
        });
        fetchSchedule();
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "完成任务失败",
        variant: "destructive",
      });
    }
  };

  const handleSkipBreak = async (itemId: string) => {
    try {
      const response = await fetch(`/api/schedule/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "已跳过休息",
          description: "休息时间已移除",
        });
        fetchSchedule();
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "跳过休息失败",
        variant: "destructive",
      });
    }
  };

  const handleBreakEnd = () => {
    setActiveBreak(null);
    fetchSchedule();
  };

  // 获取当前周的日期列表
  const getWeekDates = () => {
    const dates: Date[] = [];
    const startOfWeek = new Date(selectedDate);
    // 调整到本周一 (getDay: 0=周日, 1=周一, ..., 6=周六)
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 如果是周日，回退6天到周一
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 获取周视图数据（包含空日期填充）
  const getWeekSchedules = () => {
    const weekDates = getWeekDates();
    return weekDates.map((date) => {
      const existingSchedule = schedules.find((s) => {
        const scheduleDate = new Date(s.date);
        return (
          scheduleDate.getDate() === date.getDate() &&
          scheduleDate.getMonth() === date.getMonth() &&
          scheduleDate.getFullYear() === date.getFullYear()
        );
      });

      return {
        id: existingSchedule?.id || `empty-${date.toISOString()}`,
        date: date.toISOString(),
        items: existingSchedule?.items || [],
      };
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  const currentSchedule = schedules.find((s) => {
    const scheduleDate = new Date(s.date);
    return (
      scheduleDate.getDate() === selectedDate.getDate() &&
      scheduleDate.getMonth() === selectedDate.getMonth() &&
      scheduleDate.getFullYear() === selectedDate.getFullYear()
    );
  });

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
          <h1 className="text-3xl font-bold">时间表</h1>
          <Button onClick={handleGenerateSchedule} disabled={isGenerating}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "生成中..." : "重新排程"}
          </Button>
        </div>

        {/* 休息时间管理 */}
        {activeBreak && (
          <BreakTimer
            duration={
              Math.round(
                (new Date(activeBreak.endTime).getTime() -
                  new Date(activeBreak.startTime).getTime()) /
                  60000
              )
            }
            onBreakEnd={handleBreakEnd}
            onSkip={() => {
              handleSkipBreak(activeBreak.id);
              setActiveBreak(null);
            }}
            autoStart
          />
        )}

        <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="day">今日视图</TabsTrigger>
              <TabsTrigger value="week">周视图</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
                <Calendar className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {view === "day"
                  ? formatDate(selectedDate)
                  : (() => {
                      const weekDates = getWeekDates();
                      const startDate = weekDates[0];
                      const endDate = weekDates[6];
                      return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
                    })()}
              </span>
              <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="day" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{formatDate(selectedDate)}</CardTitle>
                <CardDescription>
                  {currentSchedule?.items.length || 0} 个日程安排
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!currentSchedule || currentSchedule.items.length === 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-muted-foreground">
                        暂无日程安排，时间轴可点击添加任务
                      </p>
                      <Button onClick={handleGenerateSchedule} disabled={isGenerating} size="sm">
                        <RefreshCw
                          className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                        />
                        {isGenerating ? "生成中..." : "自动排程"}
                      </Button>
                    </div>
                    <EmptyTimeline />
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={currentSchedule.items.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {currentSchedule.items.map((item) => (
                          <SortableItem
                            key={item.id}
                            item={item}
                            onComplete={
                              item.taskId
                                ? () => handleCompleteTask(item.taskId!)
                                : undefined
                            }
                            onSkipBreak={
                              item.isBreak
                                ? () => handleSkipBreak(item.id)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId ? (
                        <DragOverlayItem
                          item={
                            currentSchedule.items.find(
                              (item) => item.id === activeId
                            )!
                          }
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="week" className="mt-6">
            <div className="grid grid-cols-7 gap-2">
              {getWeekSchedules().map((schedule) => {
                const scheduleDate = new Date(schedule.date);
                const isToday =
                  scheduleDate.getDate() === new Date().getDate() &&
                  scheduleDate.getMonth() === new Date().getMonth() &&
                  scheduleDate.getFullYear() === new Date().getFullYear();

                return (
                  <Card
                    key={schedule.id}
                    className={isToday ? "border-primary" : ""}
                  >
                    <CardHeader className="p-2">
                      <CardTitle className={`text-sm ${isToday ? "text-primary" : ""}`}>
                        {scheduleDate.toLocaleDateString("zh-CN", {
                          weekday: "short",
                        })}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {scheduleDate.getMonth() + 1}/{scheduleDate.getDate()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 pt-0">
                      <WeekTimeline date={scheduleDate} items={schedule.items} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
