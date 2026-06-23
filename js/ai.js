// AI 模块 — DeepSeek / OpenAI 兼容 API 调用
// 支持自定义端点和代理

const AI = {

  // 构建 OpenAI 兼容的 chat completion 请求
  async callDeepSeek(config, systemPrompt, userMessage, retries = 3) {
    const apiEndpoint = config.endpoint || "https://api.deepseek.com/v1";
    const model = config.model || "deepseek-chat";

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
  async generateProfile(config, scores) {
    const description = Engine.scoresToDescription(scores);

    const systemPrompt = `你是一个善于洞察人心的观察者。你会根据一个人在爱情中各个侧面的表现，描绘出TA的爱情人格画像。

你的文字应该像一个了解TA多年的朋友写下的观察笔记——温暖、有洞察力、不说教。你看到的不是分数，而是一个活生生的人。

请不要在回答中出现任何数字、分数、等级、百分比，也不要使用"评分""得分""维度""量表"等词汇。不要分析你是如何得出结论的，直接给出结论本身。`;

    const userMessage = `以下是我在爱情中各个侧面的表现描述：\n${description}\n\n请根据这些描述，为我写一份爱情人格画像。要求：\n1. 给我一个独特的爱情人格名称\n2. 描绘我在爱情中的整体模样\n3. 写出我可能有的情感特质和行为倾向\n4. 指出我可能需要注意的地方\n5. 给出一两条成长方向\n6. 用一句有力量的话收尾\n\n字数600-1000字。不要出现任何评分数字或分析过程。`;

    const result = await this.callDeepSeek(config, systemPrompt, userMessage, 3);

    if (!result.success || !result.content || result.content.length < 500) {
      return { success: false, error: result.error || "AI返回内容不足500字，已自动降级为离线报告" };
    }

    const report = result.content;

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
