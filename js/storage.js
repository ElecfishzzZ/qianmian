// localStorage 封装层
// 所有数据 JSON 序列化存储，统一前缀 qm_

const STORAGE = {
  _prefix: "qm_",

  _key(name) {
    return this._prefix + name;
  },

  get(key, fallback) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(this._key(key), JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(this._key(key));
  },

  // --- 隐私同意 ---
  getPrivacyAgreed() {
    return this.get("privacy_agreed", false);
  },
  setPrivacyAgreed() {
    this.set("privacy_agreed", true);
  },

  // --- AI 配置 ---
  getAIConfig() {
    return this.get("ai_config", { key: "", endpoint: "https://api.deepseek.com/v1", model: "deepseek-chat", proxy: "" });
  },
  setAIConfig(config) {
    this.set("ai_config", config);
  },

  // --- 导入的题库 ---
  getImportedQuestionnaires() {
    return this.get("imported_questionnaires", []);
  },
  addImportedQuestionnaire(q) {
    const list = this.getImportedQuestionnaires();
    list.push(q);
    this.set("imported_questionnaires", list);
  },
  removeImportedQuestionnaire(id) {
    const list = this.getImportedQuestionnaires().filter(q => q.id !== id);
    this.set("imported_questionnaires", list);
  },

  // --- 答题进度（当前进行中的） ---
  getProgress(questionnaireId) {
    return this.get("progress_" + questionnaireId, { answers: {}, startedAt: null });
  },
  setProgress(questionnaireId, progress) {
    this.set("progress_" + questionnaireId, progress);
  },
  clearProgress(questionnaireId) {
    this.remove("progress_" + questionnaireId);
  },

  // --- 画像历史 ---
  getProfileHistory() {
    return this.get("profile_history", []);
  },
  addProfile(profile) {
    const list = this.getProfileHistory();
    list.unshift(profile); // 最新的在前
    this.set("profile_history", list);
    return list;
  },
  deleteProfile(id) {
    const list = this.getProfileHistory().filter(p => p.id !== id);
    this.set("profile_history", list);
    return list;
  },

  // --- 答题记录（已完成的历史答案，供回顾） ---
  getAnswerRecords() {
    return this.get("answer_records", []);
  },
  addAnswerRecord(record) {
    const list = this.getAnswerRecords();
    list.unshift(record);
    this.set("answer_records", list);
    return list;
  }
};
