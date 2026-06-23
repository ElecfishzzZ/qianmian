/**
 * Cloudflare Worker — DeepSeek API 代理
 *
 * 用途：解决浏览器端直接调用 DeepSeek API 的 CORS 跨域问题。
 *
 * 部署步骤：
 * 1. 注册 Cloudflare 账号 → Workers & Pages → 创建 Worker
 * 2. 将本文件内容粘贴到编辑器 → 点击"部署"
 * 3. 获得 Worker URL（如 https://your-proxy.workers.dev）
 * 4. 在千面的 AI 设置中填入该 URL 作为"代理地址"
 *
 * 隐私说明：
 * - 此代理仅做请求转发，不存储、不记录任何数据
 * - 代码运行在您自己的 Cloudflare 账号下，千面作者无权访问
 */

export default {
  async fetch(request) {
    // CORS 预检
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    // 仅接受 POST（chat completions）
    if (request.method !== "POST") {
      return new Response("仅支持 POST 请求。请在千面设置中填入此 Worker URL 作为代理地址。", {
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    // 从请求体中提取目标 URL（千面会将完整 endpoint 发在请求体中，这里接收并转发）
    // 实际上千面发送的请求已经是到代理地址的，代理需要知道真正的目标。
    // 千面会在请求头 X-Target-URL 中发送真正的 API endpoint。
    const targetUrl = request.headers.get("X-Target-URL");
    if (!targetUrl) {
      return new Response("缺少 X-Target-URL 头", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    // 转发请求
    const modifiedRequest = new Request(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("Content-Type") || "application/json",
        "Authorization": request.headers.get("Authorization") || ""
      },
      body: request.body
    });

    try {
      const response = await fetch(modifiedRequest);
      const modifiedResponse = new Response(response.body, response);
      modifiedResponse.headers.set("Access-Control-Allow-Origin", "*");
      return modifiedResponse;
    } catch (e) {
      return new Response(JSON.stringify({ error: "代理请求失败: " + e.message }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
