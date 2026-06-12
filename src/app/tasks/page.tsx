"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, Priority, TaskStatus, TaskType } from "@/types";
import {
  formatDate,
  getPriorityColor,
  getStatusColor,
  getTypeIcon,
} from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { SubtaskList } from "@/components/tasks/subtask-list";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<TaskType | "ALL">("ALL");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, statusFilter, priorityFilter, typeFilter]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // 状态过滤
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // 优先级过滤
    if (priorityFilter !== "ALL") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // 类型过滤
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((task) => task.type === typeFilter);
    }

    setFilteredTasks(filtered);
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
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "完成任务失败",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "任务已删除",
        });
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "删除任务失败",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">任务管理</h1>
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              新建任务
            </Link>
          </Button>
        </div>

        {/* 过滤器 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索任务..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "ALL")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有状态</SelectItem>
                  <SelectItem value="NOT_STARTED">未开始</SelectItem>
                  <SelectItem value="IN_PROGRESS">进行中</SelectItem>
                  <SelectItem value="COMPLETED">已完成</SelectItem>
                  <SelectItem value="OVERDUE">已延期</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Priority | "ALL")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有优先级</SelectItem>
                  <SelectItem value="URGENT">紧急</SelectItem>
                  <SelectItem value="HIGH">高</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="LOW">低</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TaskType | "ALL")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有类型</SelectItem>
                  <SelectItem value="WORK">工作</SelectItem>
                  <SelectItem value="STUDY">学习</SelectItem>
                  <SelectItem value="PERSONAL">个人</SelectItem>
                  <SelectItem value="HEALTH">健康</SelectItem>
                  <SelectItem value="OTHER">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 任务列表 */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">暂无任务</p>
                <p className="text-muted-foreground mb-4">
                  {tasks.length === 0
                    ? "创建您的第一个任务开始使用"
                    : "没有符合筛选条件的任务"}
                </p>
                {tasks.length === 0 && (
                  <Button asChild>
                    <Link href="/tasks/new">
                      <Plus className="mr-2 h-4 w-4" />
                      新建任务
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="task-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {task.status === "COMPLETED" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="h-5 w-5 rounded-full border-2 border-muted-foreground hover:border-primary transition-colors"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getTypeIcon(task.type)}</span>
                          <h3 className={`font-medium ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </h3>
                        </div>
                        {task.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === "URGENT" && <AlertCircle className="mr-1 h-3 w-3" />}
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="mr-1 h-3 w-3" />
                            {task.estimatedTime}分钟
                          </Badge>
                          {task.dueDate && (
                            <Badge variant="outline">
                              截止: {formatDate(new Date(task.dueDate))}
                            </Badge>
                          )}
                          {task.isFixed && (
                            <Badge variant="secondary">固定时间</Badge>
                          )}
                          {task.isRecurring && (
                            <Badge variant="secondary">重复任务</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tasks/${task.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        {task.status !== "COMPLETED" && (
                          <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            标记完成
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setTaskToDelete(task.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* 子任务列表 */}
                  {task.children && task.children.length > 0 && (
                    <div className="mt-4">
                      <SubtaskList
                        parentTaskId={task.id}
                        subtasks={task.children}
                        onSubtaskUpdate={fetchTasks}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 删除确认对话框 */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
              <DialogDescription>
                确定要删除这个任务吗？此操作无法撤销。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDeleteTask}>
                删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
}
