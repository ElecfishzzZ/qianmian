// 离线规则引擎
// 维度均分计算 → 余弦相似度匹配 → 画像生成

const Engine = {

  // 计算各维度均分（1-5），返回 { conflict: 3.2, attachment: 4.1, ... }
  calcDimensionScores(answers) {
    const dims = {};
    for (const q of QUESTIONNAIRE.questions) {
      if (answers[q.id] == null) continue; // 跳过未答题
      if (!dims[q.dimension]) dims[q.dimension] = { sum: 0, count: 0 };
      dims[q.dimension].sum += answers[q.id];
      dims[q.dimension].count += 1;
    }
    const scores = {};
    for (const [dim, v] of Object.entries(dims)) {
      scores[dim] = v.count > 0 ? v.sum / v.count : 3;
    }
    return scores;
  },

  // 将维度得分对象转为12维数组（按VECTOR_DIMENSIONS顺序）
  toVector(scores) {
    return VECTOR_DIMENSIONS.map(d => scores[d] || 3);
  },

  // 余弦相似度
  cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  // 匹配最相似的人格类型
  match(scores) {
    const userVec = this.toVector(scores);
    const results = PERSONA_TEMPLATES.map(t => ({
      ...t,
      similarity: this.cosineSimilarity(userVec, t.vector)
    }));
    results.sort((a, b) => b.similarity - a.similarity);
    return {
      primary: results[0],
      secondary: results[1] || null
    };
  },

  // 生成画像文本（离线模板 + 维度解读拼接）
  generateProfile(matchResult, scores) {
    const { primary, secondary } = matchResult;
    const simPercent = (primary.similarity * 100).toFixed(1);

    // 维度解读
    const dimLines = VECTOR_DIMENSIONS.map(dim => {
      const score = scores[dim] || 3;
      const name = DIMENSION_NAMES[dim];
      const level = score >= 4 ? "较高" : score <= 2 ? "较低" : "中等";
      return `${name}: ${level} (${score.toFixed(1)}/5)`;
    }).join("\n");

    // 组装报告
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let report = `【${primary.name}】相似度: ${simPercent}%\n`;
    if (secondary && secondary.similarity > 0.7) {
      report += `第二匹配: ${secondary.name} (${(secondary.similarity * 100).toFixed(1)}%)\n`;
    }
    report += `测试时间: ${timeStr}\n\n`;
    report += `━━━━━━━━━━━━━━━━━━\n\n`;
    report += primary.template + `\n\n`;
    report += `━━━━━━━━━━━━━━━━━━\n\n`;
    report += `12维度分析:\n${dimLines}\n\n`;
    report += `━━━━━━━━━━━━━━━━━━\n`;
    report += `千面 · 了解你的每一面`;

    return {
      personalityType: primary.name,
      secondaryType: secondary && secondary.similarity > 0.7 ? secondary.name : null,
      similarityScore: primary.similarity,
      content: report,
      dimensionScores: scores,
      usedAi: false,
      aiModel: null,
      timestamp: now.toISOString()
    };
  },

  // 生成通用画像（兜底——没有匹配到模板时）
  generateFallbackProfile(scores) {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const dimLines = VECTOR_DIMENSIONS.map(dim => {
      const score = scores[dim] || 3;
      const name = DIMENSION_NAMES[dim];
      const level = score >= 4 ? "较高" : score <= 2 ? "较低" : "中等";
      return `${name}: ${level} (${score.toFixed(1)}/5)`;
    }).join("\n");

    const report = `你的爱情人格画像\n\n测试时间: ${timeStr}\n\n━━━━━━━━━━━━━━━━━━\n\n你的各维度得分较为均衡，未呈现典型的极端人格类型。以下是你12个爱情维度的详细分析，帮助你更深入地了解自己的爱情观。\n\n${dimLines}\n\n━━━━━━━━━━━━━━━━━━\n千面 · 了解你的每一面`;

    return {
      personalityType: "独特人格",
      secondaryType: null,
      similarityScore: 0,
      content: report,
      dimensionScores: scores,
      usedAi: false,
      aiModel: null,
      timestamp: now.toISOString()
    };
  },

  // 完整流程：答题 → 计算 → 匹配 → 生成报告
  run(answers) {
    const scores = this.calcDimensionScores(answers);
    const matchResult = this.match(scores);
    if (matchResult.primary && matchResult.primary.similarity > 0) {
      return this.generateProfile(matchResult, scores);
    }
    return this.generateFallbackProfile(scores);
  }
};
