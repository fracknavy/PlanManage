import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PlanManage - 智能计划与时间表管理",
    template: "%s | PlanManage",
  },
  description: "智能任务规划、自动排程、时间表管理应用，帮助您高效管理时间和任务",
  keywords: ["任务管理", "时间管理", "计划", "日程", "排程", "GTD", "效率工具"],
  authors: [{ name: "PlanManage Team" }],
  creator: "PlanManage",
  publisher: "PlanManage",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://planmanage.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    title: "PlanManage - 智能计划与时间表管理",
    description: "智能任务规划、自动排程、时间表管理应用，帮助您高效管理时间和任务",
    siteName: "PlanManage",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PlanManage - 智能计划与时间表管理",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlanManage - 智能计划与时间表管理",
    description: "智能任务规划、自动排程、时间表管理应用，帮助您高效管理时间和任务",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
