// AI 模块 — DeepSeek / OpenAI 兼容 API 调用
// 支持自定义端点和代理

const AI = {

  // 构建 OpenAI 兼容的 chat completion 请求
  async callDeepSeek(config, systemPrompt, userMessage, retries = 3) {
    const apiEndpoint = config.endpoint || "https://api.deepseek.com/v1";
    const model = config.model || "deepseek-chat";

    // 如果配置了代理，请求发到代理，真实 endpoint 放在 header 中
    const useProxy = !!config.proxy;
    const requestUrl = useProxy
      ? config.proxy.replace(/\/+$/, "")
      : apiEndpoint.replace(/\/+$/, "") + "/chat/completions";

    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + config.key
    };
    if (useProxy) {
      headers["X-Target-URL"] = apiEndpoint.replace(/\/+$/, "") + "/chat/completions";
    }

    const body = JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 2000,
      temperature: 0.8
    });

    let lastError = null;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const resp = await fetch(requestUrl, {
          method: "POST",
          headers: headers,
          body: body
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${errText}`);
        }

        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content || "";
        return { success: true, content };
      } catch (e) {
        lastError = e;
        if (attempt < retries - 1) {
          await this._sleep(1000 * (attempt + 1));
        }
      }
    }
    return { success: false, error: lastError?.message || "未知错误" };
  },

  // 测试连接
  async testConnection(config) {
    const result = await this.callDeepSeek(config,
      "你是一个助手，请简短回复。",
      "Hi",
      1
    );
    return result;
  },

  // 生成 AI 画像
  async generateProfile(config, scores, answers) {
    const dimLines = VECTOR_DIMENSIONS.map(dim => {
      const score = scores[dim] || 3;
      return `${DIMENSION_NAMES[dim]}: ${score.toFixed(1)}/5`;
    }).join("\n");

    const systemPrompt = `你是一位资深的爱情心理咨询师。请根据用户的12维度爱情观测评得分，生成一份个性化的爱情人格画像报告。

要求：
1. 为用户命名一个独特的爱情人格名称（如"理性守护者""浪漫冒险家"等）
2. 描述用户的3个核心爱情特质
3. 指出2个爱情盲区或成长空间
4. 描述用户在关系中的典型行为模式
5. 给出2-3条切实可行的成长建议
6. 以一句有力量的爱情金句收尾

字数要求：600-1000字。语气温暖、有洞察力，避免说教。`;

    const userMessage = `以下是我的12维度爱情观测评得分（1-5分）：\n${dimLines}\n\n请根据以上得分为我生成爱情人格画像。`;

    const result = await this.callDeepSeek(config, systemPrompt, userMessage, 3);

    if (!result.success || !result.content || result.content.length < 500) {
      return { success: false, error: result.error || "AI返回内容不足500字，已自动降级为离线报告" };
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const report = result.content + `\n\n━━━━━━━━━━━━━━━━━━\n测试时间: ${timeStr}\nAI 模型: ${config.model || "deepseek-chat"}\n千面 · 了解你的每一面`;

    return {
      success: true,
      report,
      model: config.model
    };
  },

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
