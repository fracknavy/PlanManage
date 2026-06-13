// PlanManage Service Worker
const CACHE_NAME = "planmanage-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/tasks",
  "/schedule",
  "/links",
  "/settings",
  "/manifest.json",
];

// 安装事件 - 缓存静态资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 获取事件 - 网络优先策略
self.addEventListener("fetch", (event) => {
  // 跳过非 GET 请求
  if (event.request.method !== "GET") {
    return;
  }

  // 跳过 API 请求
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 检查响应是否有效
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // 克隆响应
        const responseToCache = response.clone();

        // 缓存响应
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // 网络失败，尝试从缓存获取
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }

          // 如果是导航请求，返回离线页面
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }

          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});

// 推送事件 - 处理推送通知
self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || "您有一条新通知",
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || "1",
      url: data.url || "/",
    },
    actions: data.actions || [
      {
        action: "open",
        title: "打开",
        icon: "/icons/checkmark.png",
      },
      {
        action: "close",
        title: "关闭",
        icon: "/icons/xmark.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "PlanManage", options)
  );
});

// 通知点击事件
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // 如果已经有窗口打开，聚焦它
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      // 否则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// 同步事件 - 后台同步
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(syncTasks());
  }
});

// 同步任务函数
async function syncTasks() {
  try {
    // 这里可以添加离线数据同步逻辑
    console.log("Syncing tasks...");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
