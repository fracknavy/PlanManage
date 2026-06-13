import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadOptions {
  maxSize?: number; // 字节
  allowedTypes?: string[];
  uploadDir?: string;
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  uploadDir: "uploads/avatars",
};

/**
 * 上传文件
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 检查文件大小
  if (file.size > opts.maxSize!) {
    return {
      success: false,
      error: `文件大小超过限制（最大 ${opts.maxSize! / 1024 / 1024}MB）`,
    };
  }

  // 检查文件类型
  if (!opts.allowedTypes!.includes(file.type)) {
    return {
      success: false,
      error: `不支持的文件类型: ${file.type}`,
    };
  }

  try {
    // 创建上传目录
    const uploadDir = join(process.cwd(), opts.uploadDir!);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = join(uploadDir, filename);

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 写入文件
    await writeFile(filepath, buffer);

    // 返回访问 URL
    const url = `/${opts.uploadDir}/${filename}`;

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "文件上传失败",
    };
  }
}

/**
 * 上传头像
 */
export async function uploadAvatar(file: File): Promise<UploadResult> {
  return uploadFile(file, {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    uploadDir: "uploads/avatars",
  });
}

/**
 * 删除文件
 */
export async function deleteFile(filepath: string): Promise<boolean> {
  try {
    const { unlink } = await import("fs/promises");
    const fullPath = join(process.cwd(), filepath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Delete file error:", error);
    return false;
  }
}

/**
 * 生成头像占位符 URL
 */
export function getAvatarPlaceholder(name?: string): string {
  if (!name) {
    return "/avatars/default.png";
  }

  // 使用 DiceBear API 生成头像
  const encodedName = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodedName}`;
}

/**
 * 验证图片尺寸
 */
export async function validateImageDimensions(
  file: File,
  maxWidth: number = 500,
  maxHeight: number = 500
): Promise<{ valid: boolean; width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: img.width <= maxWidth && img.height <= maxHeight,
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false });
    };

    img.src = url;
  });
}
