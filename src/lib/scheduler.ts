import { SchedulerTask, TimeSlot, ScheduleConfig } from "@/types";
import { addMinutes, diffInMinutes, parseTimeString } from "./utils";

interface ScoredTask extends SchedulerTask {
  score: number;
}

/**
 * 计算任务综合分数
 * 分数越高，优先级越高
 */
function calculateTaskScore(task: SchedulerTask, now: Date): number {
  let score = 0;

  // 1. 权重分数 (0-100)
  score += task.weight * 10;

  // 2. 优先级分数
  const priorityScores = {
    URGENT: 40,
    HIGH: 30,
    MEDIUM: 20,
    LOW: 10,
  };
  score += priorityScores[task.priority] || 20;

  // 3. 截止时间紧迫度 (0-50)
  if (task.dueDate) {
    const hoursUntilDue = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDue <= 0) {
      score += 50; // 已过期，最高紧迫度
    } else if (hoursUntilDue <= 24) {
      score += 40; // 24小时内
    } else if (hoursUntilDue <= 72) {
      score += 30; // 3天内
    } else if (hoursUntilDue <= 168) {
      score += 20; // 一周内
    } else {
      score += 10;
    }
  }

  // 4. 预计耗时权重 (耗时越短，越容易安排)
  if (task.estimatedTime <= 30) {
    score += 10;
  } else if (task.estimatedTime <= 60) {
    score += 5;
  }

  return score;
}

/**
 * 检查时间槽是否与已有安排冲突
 */
function hasConflict(
  start: Date,
  end: Date,
  existingSlots: TimeSlot[]
): boolean {
  return existingSlots.some((slot) => {
    if (slot.isBreak) return false; // 休息时间不计入冲突
    return start < slot.end && end > slot.start;
  });
}

/**
 * 生成休息时间槽
 */
function createBreakSlot(
  afterTask: TimeSlot,
  breakDuration: number
): TimeSlot {
  const breakStart = new Date(afterTask.end);
  const breakEnd = addMinutes(breakStart, breakDuration);
  return {
    start: breakStart,
    end: breakEnd,
    isBreak: true,
  };
}

/**
 * 自动排程算法
 *
 * 算法逻辑：
 * 1. 固定任务优先安排
 * 2. 计算每个任务的综合分数
 * 3. 按分数从高到低安排任务
 * 4. 高权重任务优先，冲突时低权重任务后移
 * 5. 在连续任务之间自动插入休息时间
 */
export function autoSchedule(
  tasks: SchedulerTask[],
  config: ScheduleConfig,
  date: Date,
  existingSlots: TimeSlot[] = []
): TimeSlot[] {
  const now = new Date();
  const scheduledSlots: TimeSlot[] = [...existingSlots];

  // 解析工作时间
  const workStart = parseTimeString(config.workStartTime, date);
  const workEnd = parseTimeString(config.workEndTime, date);

  // 如果当前时间已过工作开始时间，从当前时间开始
  const effectiveStart = now > workStart ? now : workStart;

  // 分离固定任务和可安排任务
  const fixedTasks = tasks.filter((t) => t.isFixed && t.fixedStart && t.fixedEnd);
  const flexibleTasks = tasks.filter((t) => !t.isFixed && t.status !== "COMPLETED");

  // 1. 先安排固定任务
  fixedTasks.forEach((task) => {
    if (task.fixedStart && task.fixedEnd) {
      scheduledSlots.push({
        start: task.fixedStart,
        end: task.fixedEnd,
        taskId: task.id,
      });
    }
  });

  // 2. 计算可安排任务的分数并排序
  const scoredTasks: ScoredTask[] = flexibleTasks
    .map((task) => ({
      ...task,
      score: calculateTaskScore(task, now),
    }))
    .sort((a, b) => b.score - a.score);

  // 3. 按分数安排任务
  let currentTime = effectiveStart;
  let lastTaskEnd: Date | null = null;

  for (const task of scoredTasks) {
    // 检查是否还有足够时间
    if (currentTime >= workEnd) {
      break; // 工作时间结束
    }

    // 计算任务结束时间
    const taskEnd = addMinutes(currentTime, task.estimatedTime);

    // 检查是否超出工作时间
    if (taskEnd > workEnd) {
      // 尝试安排到下一天（这里简化处理，跳过）
      continue;
    }

    // 检查与固定任务的冲突
    if (!hasConflict(currentTime, taskEnd, scheduledSlots)) {
      // 在连续任务之间插入休息时间
      if (lastTaskEnd && diffInMinutes(lastTaskEnd, currentTime) < config.breakDuration) {
        const breakSlot = createBreakSlot(
          { start: lastTaskEnd, end: lastTaskEnd },
          config.breakDuration
        );
        scheduledSlots.push(breakSlot);
        currentTime = breakSlot.end;
      }

      // 安排任务
      scheduledSlots.push({
        start: currentTime,
        end: taskEnd,
        taskId: task.id,
      });

      lastTaskEnd = taskEnd;
      currentTime = taskEnd;
    } else {
      // 有冲突，尝试找到下一个可用时间槽
      const nextAvailable = findNextAvailableSlot(
        currentTime,
        task.estimatedTime,
        workEnd,
        scheduledSlots
      );

      if (nextAvailable) {
        scheduledSlots.push({
          start: nextAvailable.start,
          end: nextAvailable.end,
          taskId: task.id,
        });
        lastTaskEnd = nextAvailable.end;
        currentTime = nextAvailable.end;
      }
    }
  }

  // 按时间排序
  scheduledSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

  return scheduledSlots;
}

/**
 * 查找下一个可用时间槽
 */
function findNextAvailableSlot(
  after: Date,
  duration: number,
  before: Date,
  existingSlots: TimeSlot[]
): TimeSlot | null {
  let current = after;

  while (current < before) {
    const end = addMinutes(current, duration);
    if (end > before) return null;

    if (!hasConflict(current, end, existingSlots)) {
      return { start: current, end };
    }

    // 移动到下一个30分钟间隔
    current = addMinutes(current, 30);
  }

  return null;
}

/**
 * 重新排程 - 考虑已完成的任务
 */
export function reschedule(
  tasks: SchedulerTask[],
  config: ScheduleConfig,
  date: Date,
  completedTaskIds: string[]
): TimeSlot[] {
  // 过滤掉已完成的任务
  const activeTasks = tasks.filter(
    (t) => !completedTaskIds.includes(t.id) && t.status !== "COMPLETED"
  );

  return autoSchedule(activeTasks, config, date);
}

/**
 * 检测任务冲突
 */
export function detectConflicts(
  tasks: SchedulerTask[],
  scheduleSlots: TimeSlot[]
): Array<{ task1: SchedulerTask; task2: SchedulerTask }> {
  const conflicts: Array<{ task1: SchedulerTask; task2: SchedulerTask }> = [];
  const taskSlots = scheduleSlots.filter((s) => s.taskId);

  for (let i = 0; i < taskSlots.length; i++) {
    for (let j = i + 1; j < taskSlots.length; j++) {
      const slot1 = taskSlots[i];
      const slot2 = taskSlots[j];

      if (slot1.start < slot2.end && slot1.end > slot2.start) {
        const task1 = tasks.find((t) => t.id === slot1.taskId);
        const task2 = tasks.find((t) => t.id === slot2.taskId);

        if (task1 && task2) {
          conflicts.push({ task1, task2 });
        }
      }
    }
  }

  return conflicts;
}
