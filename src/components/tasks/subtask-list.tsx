"use client";

import { useState } from "react";
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { getPriorityColor, getStatusColor } from "@/lib/utils";

interface SubtaskListProps {
  parentTaskId: string;
  subtasks: Task[];
  onSubtaskUpdate: () => void;
}

export function SubtaskList({ parentTaskId, subtasks, onSubtaskUpdate }: SubtaskListProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const completedCount = subtasks.filter((t) => t.status === "COMPLETED").length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newSubtaskTitle,
          parentId: parentTaskId,
          estimatedTime: 30,
          priority: "MEDIUM",
          type: "OTHER",
        }),
      });

      if (response.ok) {
        setNewSubtaskTitle("");
        setIsAdding(false);
        onSubtaskUpdate();
        toast({
          title: "子任务已添加",
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "添加子任务失败",
        variant: "destructive",
      });
    }
  };

  const handleCompleteSubtask = async (subtaskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${subtaskId}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        onSubtaskUpdate();
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "完成子任务失败",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${subtaskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onSubtaskUpdate();
        toast({
          title: "子任务已删除",
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "删除子任务失败",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="ml-6 border-l-2 border-muted pl-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          子任务 ({completedCount}/{subtasks.length})
        </button>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{progress}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50"
            >
              {subtask.status === "COMPLETED" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <button
                  onClick={() => handleCompleteSubtask(subtask.id)}
                  className="h-4 w-4 rounded-full border-2 border-muted-foreground hover:border-primary transition-colors flex-shrink-0"
                />
              )}
              <span
                className={`flex-1 text-sm ${
                  subtask.status === "COMPLETED"
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {subtask.title}
              </span>
              <Badge className={getPriorityColor(subtask.priority)} variant="outline">
                {subtask.priority}
              </Badge>
              <Badge className={getStatusColor(subtask.status)} variant="outline">
                {subtask.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDeleteSubtask(subtask.id)}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          ))}

          {isAdding && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="输入子任务标题"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubtask();
                  if (e.key === "Escape") setIsAdding(false);
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleAddSubtask}>
                添加
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                取消
              </Button>
            </div>
          )}

          {subtasks.length === 0 && !isAdding && (
            <p className="text-sm text-muted-foreground py-2">
              暂无子任务
            </p>
          )}
        </div>
      )}
    </div>
  );
}
