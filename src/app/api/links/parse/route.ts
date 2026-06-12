import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { linkParseSchema } from "@/validators/schemas";

async function fetchWithTimeout(url: string, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

function extractMetaContent(html: string, metaName: string): string | null {
  // 转义 metaName 中的特殊字符（如 og:image 中的冒号）
  const escapedName = metaName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // 匹配 property 属性（各种顺序）
  const patterns = [
    // property="xxx" content="yyy"
    new RegExp(`<meta[^>]*property=["']${escapedName}["'][^>]*content=["']([^"']*?)["']`, "i"),
    // content="yyy" property="xxx"
    new RegExp(`<meta[^>]*content=["']([^"']*?)["'][^>]*property=["']${escapedName}["']`, "i"),
    // name="xxx" content="yyy"
    new RegExp(`<meta[^>]*name=["']${escapedName}["'][^>]*content=["']([^"']*?)["']`, "i"),
    // content="yyy" name="xxx"
    new RegExp(`<meta[^>]*content=["']([^"']*?)["'][^>]*name=["']${escapedName}["']`, "i"),
    // itemprop="xxx" content="yyy"
    new RegExp(`<meta[^>]*itemprop=["']${escapedName}["'][^>]*content=["']([^"']*?)["']`, "i"),
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match && match[1]) {
      // 解码 HTML 实体
      return decodeHtmlEntities(match[1].trim());
    }
  }

  return null;
}

function decodeHtmlEntities(text: string): string {
  const entities: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
    "&apos;": "'",
  };

  return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
}

function extractTitle(html: string): string | null {
  // 优先从 og:title 获取
  const ogTitle = extractMetaContent(html, "og:title");
  if (ogTitle) return ogTitle;

  // 从 title 标签获取
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

function extractDescription(html: string): string | null {
  // 优先从 og:description 获取
  const ogDesc = extractMetaContent(html, "og:description");
  if (ogDesc) return ogDesc;

  // 从 meta description 获取
  const metaDesc = extractMetaContent(html, "description");
  return metaDesc;
}

function extractImage(html: string, baseUrl: string): string | null {
  // 按优先级尝试多种图片标签
  const imageSelectors = [
    "og:image",           // Open Graph 标准
    "twitter:image",      // Twitter Card
    "twitter:image:src",  // Twitter Card 备选
    "thumbnail",          // 一些视频网站
    "video:thumbnail",    // 视频专用
    "image",              // 通用 meta name
  ];

  for (const selector of imageSelectors) {
    const image = extractMetaContent(html, selector);
    if (image) {
      // 如果是相对路径，转换为绝对路径
      if (image.startsWith("http")) {
        return image;
      }
      try {
        return new URL(image, baseUrl).href;
      } catch {
        continue;
      }
    }
  }

  // 尝试从 JSON-LD 提取（很多视频网站使用）
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const jsonLdMatch = jsonLdRegex.exec(html);
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);
      // 检查 thumbnailUrl 或 image 字段
      const thumbnail = jsonLd.thumbnailUrl || jsonLd.image;
      if (thumbnail) {
        const thumbUrl = Array.isArray(thumbnail) ? thumbnail[0] : thumbnail;
        if (typeof thumbUrl === "string") {
          return thumbUrl.startsWith("http") ? thumbUrl : new URL(thumbUrl, baseUrl).href;
        }
        if (thumbUrl?.url) {
          return thumbUrl.url.startsWith("http") ? thumbUrl.url : new URL(thumbUrl.url, baseUrl).href;
        }
      }
    } catch {
      // JSON 解析失败，继续
    }
  }

  // 尝试提取视频 poster 属性
  const posterRegex = /<video[^>]*poster=["']([^"']*)["']/i;
  const posterMatch = html.match(posterRegex);
  if (posterMatch) {
    const poster = posterMatch[1];
    if (poster.startsWith("http")) {
      return poster;
    }
    try {
      return new URL(poster, baseUrl).href;
    } catch {
      // 继续
    }
  }

  return null;
}

function extractFavicon(html: string, baseUrl: string): string | null {
  // 查找 favicon
  const faviconRegex = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i;
  const match = html.match(faviconRegex);
  if (match) {
    const href = match[1];
    if (href.startsWith("http")) {
      return href;
    }
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return href;
    }
  }

  // 默认 favicon
  try {
    return new URL("/favicon.ico", baseUrl).href;
  } catch {
    return null;
  }
}

// 从B站URL提取BV号
function extractBilibiliBV(url: string): string | null {
  const bvRegex = /BV[a-zA-Z0-9]+/;
  const match = url.match(bvRegex);
  return match ? match[0] : null;
}

// 解析B站视频
async function parseBilibiliVideo(url: string): Promise<{ title?: string; description?: string; image?: string } | null> {
  const bvId = extractBilibiliBV(url);
  if (!bvId) return null;

  try {
    const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvId}`;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.bilibili.com",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== 0 || !data.data) return null;

    const videoData = data.data;

    // 处理图片URL
    let image = videoData.pic;
    if (image) {
      // 处理 // 开头的URL
      if (image.startsWith("//")) {
        image = `https:${image}`;
      }
      // 将 http 转换为 https
      if (image.startsWith("http://")) {
        image = image.replace("http://", "https://");
      }
    }

    return {
      title: videoData.title,
      description: videoData.desc,
      image,
    };
  } catch (error) {
    console.error("Parse Bilibili error:", error);
    return null;
  }
}

// 解析YouTube视频
async function parseYouTubeVideo(url: string): Promise<{ title?: string; description?: string; image?: string } | null> {
  // 提取YouTube视频ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  let videoId: string | null = null;
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      videoId = match[1];
      break;
    }
  }

  if (!videoId) return null;

  // YouTube的封面图有固定格式
  return {
    image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}

// 检测是否为特殊网站并调用对应的解析器
async function parseSpecialSite(url: string): Promise<{ title?: string; description?: string; image?: string } | null> {
  const urlLower = url.toLowerCase();

  // B站
  if (urlLower.includes("bilibili.com") || urlLower.includes("b23.tv")) {
    return parseBilibiliVideo(url);
  }

  // YouTube
  if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
    return parseYouTubeVideo(url);
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = linkParseSchema.parse(body);

    console.log("Parsing URL:", validatedData.url);

    let title: string | null = null;
    let description: string | null = null;
    let image: string | null = null;
    let favicon: string | null = null;

    // 先尝试特殊网站解析器（B站、YouTube等）
    const specialResult = await parseSpecialSite(validatedData.url);
    console.log("Special site result:", specialResult);

    if (specialResult) {
      title = specialResult.title || null;
      description = specialResult.description || null;
      image = specialResult.image || null;
    }

    // 通用HTML解析（补充缺失的信息）
    try {
      const response = await fetchWithTimeout(validatedData.url);
      const html = await response.text();

      if (!title) title = extractTitle(html);
      if (!description) description = extractDescription(html);
      if (!image) image = extractImage(html, validatedData.url);
      if (!favicon) favicon = extractFavicon(html, validatedData.url);
    } catch (error) {
      // HTML解析失败，但如果有特殊网站的结果就继续
      console.error("HTML parse failed:", error);
      if (!specialResult) {
        throw error;
      }
    }

    console.log("Final result:", { title, description, image, favicon });

    // 保存解析结果
    const linkParse = await prisma.linkParse.create({
      data: {
        url: validatedData.url,
        title,
        description,
        image,
        favicon,
        userId: session.user.id,
      },
    });

    return NextResponse.json(linkParse);
  } catch (error) {
    console.error("Parse link error:", error);
    return NextResponse.json(
      { error: "解析链接失败，请检查URL是否正确" },
      { status: 500 }
    );
  }
}
