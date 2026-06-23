// 千面 — 主控制器
// 页面切换、事件绑定、答题流程

const App = {

  // 当前状态
  state: {
    currentPage: "home",
    currentQuestionnaire: null,   // 当前正在做的问卷对象
    currentDimIndex: 0,           // 当前维度步骤（0-11）
    answers: {},                  // { questionId: score }
    questionnaireId: null,        // 问卷ID
    viewingProfileId: null        // 正在查看的历史画像ID
  },

  // ========== 初始化 ==========
  init() {
    this.checkPrivacy();
    this.bindGlobalEvents();
    this.renderHome();
  },

  checkPrivacy() {
    if (!STORAGE.getPrivacyAgreed()) {
      this.showPrivacyModal();
    }
  },

  // ========== 页面导航 ==========
  navigate(page) {
    this.state.currentPage = page;
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    const target = document.getElementById("page-" + page);
    if (target) target.classList.add("active");
    window.scrollTo(0, 0);
  },

  goBack() {
    const { currentPage } = this.state;
    if (currentPage === "quiz") {
      // 返回首页，清除进度
      if (this.state.currentQuestionnaire) {
        STORAGE.clearProgress(this.state.currentQuestionnaire.id);
      }
      this.state.currentQuestionnaire = null;
      this.state.currentDimIndex = 0;
      this.state.answers = {};
      this.navigate("home");
    } else if (currentPage === "result" || currentPage === "history") {
      this.renderHome();
    } else {
      this.navigate("home");
    }
  },

  // ========== 全局事件 ==========
  bindGlobalEvents() {
    // 返回按钮
    document.getElementById("btn-back").addEventListener("click", () => this.goBack());

    // 设置按钮
    document.getElementById("btn-settings").addEventListener("click", () => this.showSettingsModal());

    // 关闭弹窗
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("active");
      });
    });
  },

  // ========== 首页 ==========
  renderHome() {
    this.navigate("home");
    document.getElementById("btn-back").style.visibility = "hidden";

    const container = document.getElementById("home-content");
    const importedQs = STORAGE.getImportedQuestionnaires();

    let importedHTML = "";
    if (importedQs.length > 0) {
      importedHTML = importedQs.map(q => `
        <div class="questionnaire-card">
          <div class="card-title">${this._esc(q.title)}</div>
          <div class="card-desc">${this._esc(q.description)}</div>
          <div class="card-meta">${q.questionCount} 题 · ${q.dimensions.length} 维度 · 导入题库</div>
          <button class="btn btn-primary btn-sm" onclick="App.startQuiz('${q.id}')">开始测试 →</button>
        </div>
      `).join("");
    }

    container.innerHTML = `
      <div class="home-header">
        <div class="home-logo">🎭</div>
        <div class="home-title">千面</div>
        <div class="home-subtitle">了解你的每一面</div>
      </div>

      <div class="questionnaire-card">
        <span class="card-badge">内置</span>
        <div class="card-title">${QUESTIONNAIRE.title}</div>
        <div class="card-desc">${QUESTIONNAIRE.description}</div>
        <div class="card-meta">${QUESTIONNAIRE.questionCount} 题 · ${QUESTIONNAIRE.dimensions.length} 维度</div>
        <button class="btn btn-primary" onclick="App.startQuiz('builtin')">开始测试 →</button>
      </div>

      ${importedHTML}

      <div class="home-actions">
        <div class="home-action-item" onclick="App.renderHistory()">
          <span class="home-action-icon">📋</span>
          历史记录
        </div>
        <div class="home-action-item" onclick="App.showImportModal()">
          <span class="home-action-icon">📥</span>
          导入题库
        </div>
      </div>
    `;
  },

  // ========== 开始答题 ==========
  startQuiz(questionnaireId) {
    document.getElementById("btn-back").style.visibility = "visible";

    if (questionnaireId === "builtin") {
      this.state.currentQuestionnaire = {
        id: "builtin",
        title: QUESTIONNAIRE.title,
        description: QUESTIONNAIRE.description,
        questionCount: QUESTIONNAIRE.questionCount,
        isBuiltIn: true,
        dimensions: QUESTIONNAIRE.dimensions,
        questions: QUESTIONNAIRE.questions,
        supportsPersona: true
      };
    } else {
      const importedQs = STORAGE.getImportedQuestionnaires();
      const q = importedQs.find(x => x.id === questionnaireId);
      if (!q) {
        this.showToast("题库未找到", "error");
        return;
      }
      this.state.currentQuestionnaire = q;
    }

    this.state.currentDimIndex = 0;
    this.state.answers = {};
    this.state.questionnaireId = questionnaireId;

    // 尝试恢复进度
    const saved = STORAGE.getProgress(questionnaireId);
    if (saved.answers && Object.keys(saved.answers).length > 0) {
      this.state.answers = saved.answers;
      // 找到第一个未完成的维度
      const q = this.state.currentQuestionnaire;
      for (let i = 0; i < q.dimensions.length; i++) {
        const dimQuestions = q.questions.filter(q => q.dimension === q.dimensions[i].id);
        const allAnswered = dimQuestions.every(q => this.state.answers[q.id] != null);
        if (!allAnswered) {
          this.state.currentDimIndex = i;
          break;
        }
      }
    }

    this.renderQuizStep();
  },

  // ========== 答题步骤渲染 ==========
  renderQuizStep() {
    this.navigate("quiz");

    const q = this.state.currentQuestionnaire;
    const dims = q.dimensions;
    const dimIndex = this.state.currentDimIndex;
    const dim = dims[dimIndex];
    const dimQuestions = q.questions.filter(q => q.dimension === dim.id);

    // 进度
    const totalSteps = dims.length;
    const progressPct = Math.round((dimIndex / totalSteps) * 100);
    const answeredCount = Object.keys(this.state.answers).length;
    const totalQuestions = q.questionCount;

    document.getElementById("quiz-content").innerHTML = `
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" style="width:${progressPct}%"></div>
      </div>
      <div class="quiz-progress-text">维度 ${dimIndex + 1} / ${totalSteps} · 已完成 ${answeredCount} / ${totalQuestions} 题</div>

      <div class="quiz-dim-title">${dim.name}</div>
      <div class="quiz-dim-desc">${dim.category} · ${dim.questionCount} 题</div>

      <div id="dim-questions">
        ${dimQuestions.map(q => this._renderQuestion(q)).join("")}
      </div>

      <div class="quiz-nav">
        ${dimIndex > 0 ? '<button class="btn btn-outline" onclick="App.prevDim()">← 上一维度</button>' : '<div></div>'}
        ${dimIndex < totalSteps - 1
          ? '<button class="btn btn-primary" onclick="App.nextDim()">下一维度 →</button>'
          : '<button class="btn btn-primary" onclick="App.submitQuiz()">提交答卷 ✓</button>'}
      </div>
    `;

    window.scrollTo(0, 0);
  },

  _renderQuestion(q) {
    const currentScore = this.state.answers[q.id] || 0;
    const labels = ["非常赞同", "比较赞同", "中立", "不太赞同", "非常不赞同"];

    let optionsHTML = "";
    for (let i = 1; i <= 5; i++) {
      const selected = currentScore === i ? " selected" : "";
      optionsHTML += `
        <div class="scale-option${selected}" onclick="App.selectAnswer(${q.id}, ${i})" data-qid="${q.id}" data-score="${i}">
          <div class="scale-dot"></div>
          <span class="scale-label">${labels[i - 1]}</span>
        </div>
      `;
    }

    return `
      <div class="quiz-question" id="question-${q.id}">
        <div class="quiz-question-num">第 ${q.id} 题</div>
        <div class="quiz-question-text">${this._esc(q.text)}</div>
        <div class="scale-options">${optionsHTML}</div>
      </div>
    `;
  },

  selectAnswer(qid, score) {
    this.state.answers[qid] = score;

    // 更新当前页面的选中状态
    const questionEl = document.getElementById("question-" + qid);
    if (questionEl) {
      questionEl.querySelectorAll(".scale-option").forEach(opt => {
        opt.classList.toggle("selected", parseInt(opt.dataset.score) === score);
      });
    }

    // 实时保存进度
    if (this.state.currentQuestionnaire) {
      STORAGE.setProgress(this.state.currentQuestionnaire.id, {
        answers: this.state.answers,
        startedAt: this.state.answers._startedAt || new Date().toISOString()
      });
    }
  },

  prevDim() {
    if (this.state.currentDimIndex > 0) {
      this.state.currentDimIndex--;
      this.renderQuizStep();
    }
  },

  nextDim() {
    const q = this.state.currentQuestionnaire;
    const dim = q.dimensions[this.state.currentDimIndex];
    const dimQuestions = q.questions.filter(q => q.dimension === dim.id);
    const unanswered = dimQuestions.filter(q => this.state.answers[q.id] == null);

    if (unanswered.length > 0) {
      const nums = unanswered.map(q => q.id).join("、");
      this.showToast(`请完成第 ${nums} 题后再进入下一维度`, "error");
      return;
    }

    if (this.state.currentDimIndex < q.dimensions.length - 1) {
      this.state.currentDimIndex++;
      this.renderQuizStep();
    }
  },

  // ========== 提交答卷 ==========
  submitQuiz() {
    const q = this.state.currentQuestionnaire;
    const unanswered = q.questions.filter(q => this.state.answers[q.id] == null);

    if (unanswered.length > 0) {
      const nums = unanswered.map(q => q.id).join("、");
      this.showToast(`还有 ${unanswered.length} 题未完成：第 ${nums} 题`, "error");
      // 跳到第一个未完成题所在的维度
      const firstUnansweredDim = q.dimensions.findIndex(dim =>
        unanswered.some(uq => uq.dimension === dim.id)
      );
      if (firstUnansweredDim >= 0) {
        this.state.currentDimIndex = firstUnansweredDim;
        this.renderQuizStep();
      }
      return;
    }

    // 清除进度
    STORAGE.clearProgress(q.id);

    // 运行引擎
    let profile;
    if (q.supportsPersona !== false) {
      profile = Engine.run(this.state.answers);
    } else {
      // 导入题库：只展示维度均分
      const scores = Engine.calcDimensionScores(this.state.answers);
      profile = Engine.generateFallbackProfile(scores);
      profile.personalityType = "维度分析";
      profile.content = this._buildImportResult(scores);
    }

    profile.id = "profile_" + Date.now();
    profile.questionnaireTitle = q.title;
    STORAGE.addProfile(profile);

    // 保存答题记录（供 AI 重试使用）
    STORAGE.addAnswerRecord({
      questionnaireId: q.id,
      answers: { ...this.state.answers },
      timestamp: new Date().toISOString()
    });

    this.state.viewingProfileId = profile.id;
    this.renderResult(profile);
  },

  _buildImportResult(scores) {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let report = `维度分析报告\n\n测试时间: ${timeStr}\n\n━━━━━━━━━━━━━━━━━━\n\n`;
    report += `此为导入题库，不支持人格类型匹配。以下是各维度的得分概况：\n\n`;

    for (const [dim, score] of Object.entries(scores)) {
      const name = DIMENSION_NAMES[dim] || dim;
      const level = score >= 4 ? "较高" : score <= 2 ? "较低" : "中等";
      const bar = "█".repeat(Math.round(score)) + "░".repeat(5 - Math.round(score));
      report += `${name}: ${bar} ${score.toFixed(1)}/5 (${level})\n`;
    }

    report += `\n━━━━━━━━━━━━━━━━━━\n千面 · 了解你的每一面`;
    return report;
  },

  // ========== 结果页 ==========
  renderResult(profile) {
    this.navigate("result");
    document.getElementById("btn-back").style.visibility = "visible";

    const simPercent = (profile.similarityScore * 100).toFixed(1);
    const timeStr = new Date(profile.timestamp).toLocaleString("zh-CN");

    let secondaryHTML = "";
    if (profile.secondaryType) {
      secondaryHTML = `<div class="result-similarity">第二匹配: ${profile.secondaryType}</div>`;
    }

    let aiBadge = "";
    if (profile.usedAi) {
      aiBadge = `<span class="card-badge" style="background:#6B9080;margin-left:8px;">AI 辅助</span>`;
    }

    document.getElementById("result-content").innerHTML = `
      <div class="result-header">
        <div class="result-type-name">${this._esc(profile.personalityType)}${aiBadge}</div>
        ${profile.similarityScore > 0 ? `<div class="result-similarity">相似度: ${simPercent}%</div>` : ""}
        ${secondaryHTML}
        <div class="result-time">${timeStr}</div>
      </div>

      <div class="result-content" id="report-text">${this._esc(profile.content)}</div>

      <div class="result-actions">
        <button class="btn btn-outline btn-sm" onclick="App.copyReport()">📋 复制报告</button>
        <button class="btn btn-outline btn-sm" onclick="App.shareLongImage()">📸 保存长图</button>
      </div>

      <div class="result-actions" style="margin-top:8px;">
        <button class="btn btn-primary btn-sm" onclick="App.redoQuiz()">再做一次</button>
        ${this.state.currentQuestionnaire && this.state.currentQuestionnaire.supportsPersona !== false
          ? '<button class="btn btn-outline btn-sm" onclick="App.retryWithAI()">🤖 AI 深度分析</button>'
          : ""}
      </div>

      <div class="result-footer">千面 · 了解你的每一面</div>
    `;

    window.scrollTo(0, 0);
  },

  async copyReport() {
    const text = document.getElementById("report-text")?.textContent || "";
    const result = await Share.copyText(text);
    this.showToast(result.success ? "已复制到剪贴板" : result.error, result.success ? "success" : "error");
  },

  async shareLongImage() {
    this.showToast("正在生成图片...", "success");
    // 给报告区域一个临时 id
    const reportEl = document.getElementById("report-text");
    if (reportEl) reportEl.id = "share-target";
    const result = await Share.generateLongImage("share-target");
    if (reportEl) reportEl.id = "report-text";
    if (!result.success) {
      this.showToast(result.error, "error");
    }
  },

  redoQuiz() {
    this.state.answers = {};
    this.state.currentDimIndex = 0;
    this.state.viewingProfileId = null;
    if (this.state.currentQuestionnaire) {
      this.startQuiz(this.state.currentQuestionnaire.id);
    } else {
      this.renderHome();
    }
  },

  async retryWithAI() {
    const config = STORAGE.getAIConfig();
    if (!config.key) {
      this.showToast("请先在设置中配置 AI Key", "error");
      this.showSettingsModal();
      return;
    }

    const profiles = STORAGE.getProfileHistory();
    const profile = profiles.find(p => p.id === this.state.viewingProfileId);
    if (!profile) {
      this.showToast("画像数据丢失，请重新答题", "error");
      return;
    }

    this.showToast("正在调用 AI 生成深度画像...", "success");

    const result = await AI.generateProfile(config, profile.dimensionScores, {});

    if (result.success) {
      profile.content = result.report;
      profile.usedAi = true;
      profile.aiModel = result.model;
      const list = STORAGE.getProfileHistory();
      const idx = list.findIndex(p => p.id === profile.id);
      if (idx >= 0) {
        list[idx] = profile;
        STORAGE.set("profile_history", list);
      }
      this.renderResult(profile);
      this.showToast("AI 画像生成完成", "success");
    } else {
      this.showToast(result.error || "AI 调用失败，已保留离线报告", "error");
    }
  },

  // ========== 历史记录 ==========
  renderHistory() {
    this.navigate("history");
    document.getElementById("btn-back").style.visibility = "visible";

    const profiles = STORAGE.getProfileHistory();
    const container = document.getElementById("history-content");

    if (profiles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-state-icon">📭</span>
          <div class="empty-state-text">暂无历史记录</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="history-list">
        ${profiles.map(p => {
          const timeStr = new Date(p.timestamp).toLocaleString("zh-CN");
          return `
            <div class="history-item" onclick="App.viewHistoryProfile('${p.id}')">
              <div class="history-item-info">
                <div class="history-item-type">${this._esc(p.personalityType)}${p.usedAi ? ' <span class="history-item-badge">AI</span>' : ''}</div>
                <div class="history-item-time">${timeStr} · ${this._esc(p.questionnaireTitle || "你的爱情观")}</div>
              </div>
              <button class="history-item-delete" onclick="App.deleteHistory(event, '${p.id}')" title="删除">✕</button>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  viewHistoryProfile(id) {
    const profiles = STORAGE.getProfileHistory();
    const profile = profiles.find(p => p.id === id);
    if (!profile) {
      this.showToast("画像记录未找到", "error");
      return;
    }
    this.state.viewingProfileId = id;
    this.renderResult(profile);
  },

  deleteHistory(event, id) {
    event.stopPropagation();
    if (confirm("确定要删除这条记录吗？")) {
      STORAGE.deleteProfile(id);
      this.renderHistory();
      this.showToast("已删除", "success");
    }
  },

  // ========== 设置弹窗（AI配置） ==========
  showSettingsModal() {
    const config = STORAGE.getAIConfig();
    document.getElementById("settings-content").innerHTML = `
      <div class="modal-title">
        设置
        <button class="modal-close" onclick="App.closeModal('modal-settings')">✕</button>
      </div>

      <div class="form-group">
        <label class="form-label">API Key</label>
        <input class="form-input" type="password" id="setting-key" value="${this._esc(config.key || '')}" placeholder="sk-...">
      </div>

      <div class="form-group">
        <label class="form-label">API 端点</label>
        <input class="form-input" type="text" id="setting-endpoint" value="${this._esc(config.endpoint || 'https://api.deepseek.com/v1')}" placeholder="https://api.deepseek.com/v1">
      </div>

      <div class="form-group">
        <label class="form-label">代理地址（可选，用于解决 CORS 问题）</label>
        <input class="form-input" type="text" id="setting-proxy" value="${this._esc(config.proxy || '')}" placeholder="https://your-proxy.workers.dev">
        <div class="form-hint">如遇到跨域错误，请部署 <code>proxy/worker.js</code> 并填入代理地址</div>
      </div>

      <div class="form-group">
        <label class="form-label">模型</label>
        <input class="form-input" type="text" id="setting-model" value="${this._esc(config.model || 'deepseek-chat')}" placeholder="deepseek-chat">
      </div>

      <div class="form-hint" style="margin-bottom:16px;">
        支持 DeepSeek 及所有 OpenAI 兼容 API。<br>
        API Key 仅存储在浏览器本地，不会上传至任何服务器。
      </div>

      <div style="display:flex;gap:10px;">
        <button class="btn btn-outline btn-sm" style="flex:1;" onclick="App.testAIConnection()">🔗 测试连接</button>
        <button class="btn btn-primary btn-sm" style="flex:1;" onclick="App.saveAISettings()">保存</button>
      </div>

      <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--divider);">
        <button class="btn btn-outline btn-sm btn-block" onclick="App.showImportModal(); App.closeModal('modal-settings');">📥 导入题库</button>
      </div>
    `;

    document.getElementById("modal-settings").classList.add("active");
  },

  saveAISettings() {
    const config = {
      key: document.getElementById("setting-key").value.trim(),
      endpoint: document.getElementById("setting-endpoint").value.trim() || "https://api.deepseek.com/v1",
      model: document.getElementById("setting-model").value.trim() || "deepseek-chat",
      proxy: document.getElementById("setting-proxy").value.trim()
    };
    STORAGE.setAIConfig(config);
    this.closeModal("modal-settings");
    this.showToast("设置已保存", "success");
  },

  async testAIConnection() {
    const key = document.getElementById("setting-key").value.trim();
    const endpoint = document.getElementById("setting-endpoint").value.trim() || "https://api.deepseek.com/v1";
    const proxy = document.getElementById("setting-proxy").value.trim();
    const model = document.getElementById("setting-model").value.trim() || "deepseek-chat";

    if (!key) {
      this.showToast("请先填写 API Key", "error");
      return;
    }

    this.showToast("正在测试连接...", "success");
    const result = await AI.testConnection({ key, endpoint, proxy, model });
    if (result.success) {
      this.showToast("连接成功！", "success");
    } else {
      this.showToast("连接失败: " + (result.error || "未知错误"), "error");
    }
  },

  // ========== 导入弹窗 ==========
  showImportModal() {
    document.getElementById("import-content").innerHTML = `
      <div class="modal-title">
        导入题库
        <button class="modal-close" onclick="App.closeModal('modal-import')">✕</button>
      </div>

      <div class="form-group">
        <label class="form-label">选择文件（CSV 或纯文本）</label>
        <input class="form-input" type="file" id="import-file" accept=".csv,.txt,.text" onchange="App.handleImportFile(event)">
      </div>

      <div class="form-group">
        <label class="form-label">或粘贴文本内容</label>
        <textarea class="form-input" id="import-text" rows="6" placeholder="CSV格式：维度,题号,题目&#10;或纯文本：【维度名】题目内容"></textarea>
      </div>

      <button class="btn btn-outline btn-sm btn-block" onclick="App.parseImportText()">解析预览</button>

      <div id="import-preview"></div>
    `;

    document.getElementById("modal-import").classList.add("active");
  },

  handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("import-text").value = e.target.result;
    };
    reader.readAsText(file, "UTF-8");
  },

  parseImportText() {
    const text = document.getElementById("import-text").value.trim();
    if (!text) {
      this.showToast("请粘贴文本或选择文件", "error");
      return;
    }

    const questions = Import.parse(text);
    if (questions.length === 0) {
      this.showToast("未能解析出有效题目，请检查格式", "error");
      return;
    }

    // 按维度分组
    const dimMap = new Map();
    for (const q of questions) {
      if (!dimMap.has(q.dimension)) dimMap.set(q.dimension, []);
      dimMap.get(q.dimension).push(q);
    }

    let previewHTML = `<div class="form-group" style="margin-top:16px;">
      <label class="form-label">问卷名称</label>
      <input class="form-input" type="text" id="import-name" value="导入题库" placeholder="给你的题库起个名字">
    </div>`;

    previewHTML += `<p style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">解析结果：${questions.length} 题，${dimMap.size} 个维度</p>`;
    previewHTML += `<div class="import-preview-list">`;

    for (const [dim, qs] of dimMap) {
      previewHTML += qs.map(q => `
        <div class="import-preview-item">
          <span><span class="import-preview-dim">${this._esc(dim)}</span>${this._esc(q.text)}</span>
          <button style="background:none;border:none;cursor:pointer;color:var(--error);font-size:16px;" onclick="this.closest('.import-preview-item').remove()">✕</button>
        </div>
      `).join("");
    }

    previewHTML += `</div>
      <button class="btn btn-primary btn-sm btn-block" onclick="App.confirmImport()">确认导入</button>`;

    document.getElementById("import-preview").innerHTML = previewHTML;
  },

  confirmImport() {
    const name = document.getElementById("import-name").value.trim() || "导入题库";
    const items = document.querySelectorAll("#import-preview .import-preview-item");
    const questions = [];

    items.forEach(item => {
      const span = item.querySelector("span");
      const dimEl = span.querySelector(".import-preview-dim");
      if (dimEl) {
        const dim = dimEl.textContent;
        const text = span.textContent.replace(dim, "").trim();
        if (text) {
          questions.push({ id: questions.length + 1, dimension: dim, text });
        }
      }
    });

    if (questions.length === 0) {
      this.showToast("没有可导入的题目", "error");
      return;
    }

    const q = Import.buildQuestionnaire(name, questions);
    STORAGE.addImportedQuestionnaire(q);
    this.closeModal("modal-import");
    this.renderHome();
    this.showToast(`已导入"${name}"（${questions.length}题）`, "success");
  },

  // ========== 隐私弹窗 ==========
  showPrivacyModal() {
    document.getElementById("privacy-content").innerHTML = `
      <div class="modal-title">隐私声明</div>
      <div class="privacy-content">
        <p>欢迎使用<strong>千面</strong>。在开始之前，请了解以下隐私保护措施：</p>
        <p style="margin-top:12px;">
          ✅ <strong>数据本地存储</strong>：所有答题记录和画像结果仅保存在您的浏览器本地存储中，不会上传至任何服务器。<br><br>
          ✅ <strong>AI 调用数据流向</strong>：AI 功能需您自行配置 API Key（如 DeepSeek），答题数据仅发送至您指定的 AI 服务商进行画像生成，千面本身不收集、不存储您的数据。<br><br>
          ✅ <strong>Key 自主配置</strong>：API Key 由您自行填入并存储在浏览器本地，您可以随时修改或删除。<br><br>
          ✅ <strong>数据清除</strong>：清除浏览器数据即永久删除所有记录。
        </p>
      </div>
      <button class="btn btn-primary btn-block" onclick="App.agreePrivacy()">同意并继续</button>
    `;

    document.getElementById("modal-privacy").classList.add("active");
  },

  agreePrivacy() {
    STORAGE.setPrivacyAgreed();
    this.closeModal("modal-privacy");
  },

  // ========== 工具方法 ==========
  closeModal(id) {
    document.getElementById(id).classList.remove("active");
  },

  showToast(msg, type) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.className = "toast " + (type || "") + " show";
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  },

  _esc(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
};

// 启动
document.addEventListener("DOMContentLoaded", () => App.init());
