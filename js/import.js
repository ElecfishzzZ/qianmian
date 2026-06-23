// 题库导入模块 — CSV / 纯文本解析

const Import = {

  // 解析 CSV 文本
  // 支持格式: 维度,题号,题目 或 维度\t题号\t题目
  parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const questions = [];
    let questionIdCounter = 0;

    // 检测分隔符
    const sep = text.includes(",") ? "," : "\t";

    for (const line of lines) {
      const parts = line.split(sep);
      if (parts.length < 2) continue;

      // 尝试跳过表头行
      const first = parts[0].trim();
      if (first === "维度" || first === "题号" || first === "题目" || first === "dimension") continue;

      const dimension = parts[0].trim();
      const questionText = parts.length >= 3 ? parts.slice(2).join(sep).trim() : parts[1].trim();

      if (!questionText) continue;

      questionIdCounter++;
      questions.push({
        id: questionIdCounter,
        dimension: dimension,
        text: questionText
      });
    }

    return questions;
  },

  // 解析纯文本
  // 支持格式: 【维度名】题目文本  或   维度名：题目文本  或   每行一题（无维度）
  parsePlainText(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const questions = [];
    let questionIdCounter = 0;
    let currentDimension = "默认维度";

    // 检测维度标记模式
    const dimPattern1 = /^【(.+?)】(.*)/;  // 【冲突处理】题目文本
    const dimPattern2 = /^(.+?)：(.*)/;    // 冲突处理：题目文本

    let hasDimMarkers = false;
    for (const line of lines) {
      const m1 = line.match(dimPattern1);
      const m2 = line.match(dimPattern2);
      if (m1 || m2) {
        hasDimMarkers = true;
        break;
      }
    }

    for (const line of lines) {
      const m1 = line.match(dimPattern1);
      const m2 = line.match(dimPattern2);

      if (hasDimMarkers && (m1 || m2)) {
        const match = m1 || m2;
        currentDimension = match[1].trim();
        const questionText = match[2].trim();
        if (questionText) {
          questionIdCounter++;
          questions.push({
            id: questionIdCounter,
            dimension: currentDimension,
            text: questionText
          });
        }
      } else {
        questionIdCounter++;
        questions.push({
          id: questionIdCounter,
          dimension: currentDimension,
          text: line.trim()
        });
      }
    }

    return questions;
  },

  // 自动检测格式并解析
  parse(text) {
    const trimmed = text.trim();
    // 如果包含逗号或制表符分隔，尝试 CSV
    if (trimmed.includes(",") || trimmed.includes("\t")) {
      const csvResult = this.parseCSV(trimmed);
      // 如果 CSV 解析出了有效题目，返回 CSV 结果
      if (csvResult.length > 0 && csvResult[0].dimension && csvResult[0].text) {
        return csvResult;
      }
    }
    return this.parsePlainText(trimmed);
  },

  // 构建导入的问卷对象
  buildQuestionnaire(name, questions) {
    // 为维度去重并建立映射
    const dimSet = new Map();
    for (const q of questions) {
      if (!dimSet.has(q.dimension)) {
        dimSet.set(q.dimension, { id: q.dimension, name: q.dimension, category: "导入", questionCount: 0 });
      }
      dimSet.get(q.dimension).questionCount++;
    }

    return {
      id: "imported_" + Date.now(),
      title: name,
      description: `导入题库 · ${questions.length}题`,
      questionCount: questions.length,
      isBuiltIn: false,
      dimensions: Array.from(dimSet.values()),
      questions: questions,
      supportsPersona: false // 导入的题库不支持人格匹配
    };
  }
};
