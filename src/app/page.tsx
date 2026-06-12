import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, CheckCircle2, Clock, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span className="font-bold">PlanManage</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">登录</Link>
            </Button>
            <Button asChild>
              <Link href="/register">注册</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-1">
        {/* Hero 部分 */}
        <section className="container flex flex-col items-center justify-center space-y-4 py-24 text-center md:py-32">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              智能计划管理
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              根据任务权重自动排程，智能管理您的时间。支持拖拽排序、冲突检测、自动休息。
            </p>
          </div>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/register">
                开始使用
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">了解更多</Link>
            </Button>
          </div>
        </section>

        {/* 特性部分 */}
        <section id="features" className="container space-y-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold">核心功能</h2>
            <p className="mt-2 text-muted-foreground">
              让时间管理变得简单高效
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-6">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold">智能排程</h3>
              <p className="mt-2 text-muted-foreground">
                根据任务权重、优先级、截止时间自动安排日程，高权重任务优先处理
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <Calendar className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold">拖拽排序</h3>
              <p className="mt-2 text-muted-foreground">
                直观的拖拽界面，轻松调整任务顺序，实时保存到数据库
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <Clock className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold">冲突检测</h3>
              <p className="mt-2 text-muted-foreground">
                自动检测时间冲突，固定任务不可移动，智能调整其他任务
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold">完成与休息</h3>
              <p className="mt-2 text-muted-foreground">
                完成任务后自动插入休息时间，帮助恢复精力，保持高效状态
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold">链接解析</h3>
              <p className="mt-2 text-muted-foreground">
                输入网页链接，自动提取标题、描述、封面图，一键创建任务
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <Calendar className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold">多视图</h3>
              <p className="mt-2 text-muted-foreground">
                支持今日视图和周视图，全面掌控时间安排
              </p>
            </div>
          </div>
        </section>

        {/* CTA 部分 */}
        <section className="container py-24">
          <div className="rounded-lg bg-muted p-8 text-center">
            <h2 className="text-3xl font-bold">开始管理您的时间</h2>
            <p className="mt-2 text-muted-foreground">
              立即注册，体验智能时间管理
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/register">
                免费注册
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">PlanManage</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 PlanManage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
