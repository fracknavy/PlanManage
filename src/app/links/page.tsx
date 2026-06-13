"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Link2,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { LinkParse } from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function LinksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [links, setLinks] = useState<LinkParse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [url, setUrl] = useState("");
  const [parsedResult, setParsedResult] = useState<LinkParse | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links);
      }
    } catch (error) {
      console.error("Fetch links error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParse = async () => {
    if (!url) return;

    setIsParsing(true);
    try {
      const response = await fetch("/api/links/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        setParsedResult(data);
        setShowResult(true);
        fetchLinks();
        toast({
          title: "链接解析成功",
        });
      } else {
        throw new Error("解析失败");
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "解析链接失败，请检查URL是否正确",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreateTask = () => {
    if (!parsedResult) return;

    // 跳转到新建任务页面，并传递链接信息
    const params = new URLSearchParams({
      title: parsedResult.title || "",
      description: parsedResult.description || "",
      sourceUrl: parsedResult.url,
    });

    router.push(`/tasks/new?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条解析记录吗？")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/links?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLinks((prev) => prev.filter((link) => link.id !== id));
        toast({
          title: "删除成功",
        });
      } else {
        throw new Error("删除失败");
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "删除失败，请重试",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
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
        <h1 className="text-3xl font-bold">链接解析</h1>

        {/* 解析输入 */}
        <Card>
          <CardHeader>
            <CardTitle>解析网页链接</CardTitle>
            <CardDescription>
              输入网页URL，自动提取标题、描述和封面图
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleParse();
                    }
                  }}
                />
              </div>
              <Button onClick={handleParse} disabled={isParsing || !url}>
                {isParsing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    解析中...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    解析
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 解析结果 */}
        {parsedResult && (
          <Dialog open={showResult} onOpenChange={setShowResult}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>解析结果</DialogTitle>
                <DialogDescription>
                  可以一键创建为任务
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {parsedResult.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={parsedResult.image}
                      alt={parsedResult.title || "封面图"}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {parsedResult.favicon && (
                      <img
                        src={parsedResult.favicon}
                        alt="favicon"
                        className="w-4 h-4"
                      />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new URL(parsedResult.url).hostname}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">
                    {parsedResult.title || "无标题"}
                  </h3>
                  {parsedResult.description && (
                    <p className="text-muted-foreground">
                      {parsedResult.description}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResult(false)}>
                  关闭
                </Button>
                <Button onClick={handleCreateTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建为任务
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* 历史记录 */}
        <Card>
          <CardHeader>
            <CardTitle>解析历史</CardTitle>
            <CardDescription>最近解析的网页链接</CardDescription>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">暂无解析记录</p>
                <p className="text-muted-foreground">
                  输入网页URL开始解析
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-start space-x-4 rounded-lg border p-4"
                  >
                    {link.favicon && (
                      <img
                        src={link.favicon}
                        alt="favicon"
                        className="w-6 h-6 mt-1"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium truncate">
                          {link.title || "无标题"}
                        </h4>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      {link.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {link.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(new Date(link.parsedAt))}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {link.image && (
                        <img
                          src={link.image}
                          alt={link.title || "封面图"}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(link.id)}
                        disabled={deletingId === link.id}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
