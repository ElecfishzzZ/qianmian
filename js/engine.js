// 离线规则引擎
// 维度均分计算 → 余弦相似度匹配 → 画像生成

const Engine = {

  // 计算各维度均分（1-5），返回 { conflict: 3.2, attachment: 4.1, ... }
  calcDimensionScores(answers) {
    const dims = {};
    for (const q of QUESTIONNAIRE.questions) {
      if (answers[q.id] == null) continue;
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

  // 将维度得分转为自然语言描述（供 AI 使用）
  scoresToDescription(scores) {
    const parts = [];
    for (const dim of VECTOR_DIMENSIONS) {
      const score = scores[dim] || 3;
      const name = DIMENSION_NAMES[dim];
      if (score >= 4.2) {
        parts.push(`在${name}方面，你表现出明显的倾向`);
      } else if (score >= 3.5) {
        parts.push(`在${name}方面，你处于中等偏上的水平`);
      } else if (score <= 1.8) {
        parts.push(`在${name}方面，你表现出明显的反向倾向`);
      } else if (score <= 2.5) {
        parts.push(`在${name}方面，你处于中等偏下的水平`);
      } else {
        parts.push(`在${name}方面，你的态度比较平衡`);
      }
    }
    return parts.join("；");
  },

  // 生成画像文本（仅人格名 + 模板正文，不展示评分）
  generateProfile(matchResult, scores) {
    const { primary, secondary } = matchResult;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let report = primary.template;
    if (secondary && secondary.similarity > 0.7) {
      report += `\n\n此外，你的画像中也包含一些「${secondary.name}」的影子。`;
    }
    report += `\n\n测试时间: ${timeStr}\n千面 · 了解你的每一面`;

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

  // 通用兜底画像
  generateFallbackProfile(scores) {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const report = `你的爱情人格画像\n\n你在各个爱情维度上的表现比较均衡，没有呈现极端的倾向。这让你在关系中能够灵活应对不同的情境，但也意味着你可能还在探索自己真正想要的是什么。这种平衡本身就是一种难得的状态——不急不躁，从容地走在了解自己的路上。\n\n测试时间: ${timeStr}\n千面 · 了解你的每一面`;

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
