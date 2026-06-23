// 分享模块 — 复制 + 长图生成

const Share = {

  // 复制文本到剪贴板
  async copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch {
      // 回退方案
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        document.body.removeChild(textarea);
        return { success: true };
      } catch {
        document.body.removeChild(textarea);
        return { success: false, error: "复制失败，请手动选择文字复制" };
      }
    }
  },

  // 生成分享长图（使用 html2canvas）
  async generateLongImage(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return { success: false, error: "未找到截图元素" };

    // 检查 html2canvas 是否已加载
    if (typeof html2canvas === "undefined") {
      return { success: false, error: "html2canvas 库未加载，请检查网络连接" };
    }

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFF8F0",
        logging: false
      });

      // 转为 Blob 并触发下载
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, "image/png");
      });

      // 尝试使用 Web Share API
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "千面-爱情人格画像.png", { type: "image/png" });
        const shareData = { files: [file], title: "千面 · 爱情人格画像" };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return { success: true };
        }
      }

      // 回退：直接下载
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "千面-爱情人格画像.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || "图片生成失败" };
    }
  }
};
