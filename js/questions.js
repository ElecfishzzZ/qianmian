// 12维度 × 78题 爱情观问卷
// 每题归属维度、题号、题目文本

const QUESTIONNAIRE = {
  title: "你的爱情观",
  description: "78道陈述题，探索你在爱情中的12个维度，发现属于你的爱情人格类型",
  questionCount: 78,
  dimensions: [
    { id: "conflict", name: "冲突处理", category: "精神观念", questionCount: 7 },
    { id: "attachment", name: "依恋风格", category: "精神观念", questionCount: 7 },
    { id: "intimacy", name: "亲密表达", category: "精神观念", questionCount: 7 },
    { id: "trust", name: "信任与安全感", category: "精神观念", questionCount: 7 },
    { id: "independence", name: "独立与依赖", category: "精神观念", questionCount: 7 },
    { id: "giving", name: "付出与索取", category: "精神观念", questionCount: 7 },
    { id: "romance", name: "浪漫认知", category: "精神观念", questionCount: 7 },
    { id: "communication", name: "沟通模式", category: "精神观念", questionCount: 7 },
    { id: "past", name: "过往影响", category: "精神观念", questionCount: 7 },
    { id: "future", name: "未来期望", category: "现实条件", questionCount: 5 },
    { id: "standards", name: "择偶标准", category: "现实条件", questionCount: 5 },
    { id: "sex", name: "性观念", category: "现实条件", questionCount: 5 }
  ],
  questions: [
    // 一、冲突处理（7题）
    { id: 1, dimension: "conflict", text: "与爱人发生争执时，我倾向于当场把话说开，而不是各自冷静。" },
    { id: 2, dimension: "conflict", text: "吵架后，我通常是先主动打破沉默的那一方。" },
    { id: 3, dimension: "conflict", text: "我认为情侣之间的争吵反而有助于加深彼此了解。" },
    { id: 4, dimension: "conflict", text: "在激烈争吵中，我很难控制自己不说出伤人的话。" },
    { id: 5, dimension: "conflict", text: "对方如果长时间冷战，我会感到极度焦虑。" },
    { id: 6, dimension: "conflict", text: "我更愿意妥协让步，而不是坚持争出对错。" },
    { id: 7, dimension: "conflict", text: "我认为吵架后必须把问题彻底谈透，否则下次还会重演。" },

    // 二、依恋风格（7题）
    { id: 8, dimension: "attachment", text: "我常常担心爱人会突然不再喜欢我。" },
    { id: 9, dimension: "attachment", text: "即使在一段稳定的关系中，我也需要对方频繁地表达爱意来获得安心。" },
    { id: 10, dimension: "attachment", text: "当对方没有及时回复消息时，我容易脑补出各种不好的可能。" },
    { id: 11, dimension: "attachment", text: "我觉得自己不太需要别人的情感支持，一个人也能过得很好。" },
    { id: 12, dimension: "attachment", text: "对方向我表达浓烈的情感时，我有时会感到不自在甚至想躲开。" },
    { id: 13, dimension: "attachment", text: "我需要较多的独处时间，过于亲密的距离感会让我有压力。" },
    { id: 14, dimension: "attachment", text: "我在感情中既能安心依赖对方，也能接受对方依赖我。" },

    // 三、亲密表达（7题）
    { id: 15, dimension: "intimacy", text: "我经常通过肢体接触（拥抱、牵手等）来表达爱意。" },
    { id: 16, dimension: "intimacy", text: "对我来说，说“我爱你”是一件自然且频繁的事。" },
    { id: 17, dimension: "intimacy", text: "我更习惯用实际行动（做饭、接送、修东西）来表达关心，而不是嘴上说。" },
    { id: 18, dimension: "intimacy", text: "在公共场合，我不介意与伴侣有适度的亲密举动。" },
    { id: 19, dimension: "intimacy", text: "我认为给对方精心准备礼物是表达爱的重要方式。" },
    { id: 20, dimension: "intimacy", text: "比起收到礼物，我更喜欢对方花时间专注地陪我。" },
    { id: 21, dimension: "intimacy", text: "我发现自己在感情中不太擅长主动表达亲密，更多是被动回应。" },

    // 四、信任与安全感（7题）
    { id: 22, dimension: "trust", text: "我认为情侣之间查看对方手机是可接受的行为。" },
    { id: 23, dimension: "trust", text: "如果对方有亲密的异性朋友，我会感到不安。" },
    { id: 24, dimension: "trust", text: "我完全信任我的伴侣，不需要通过任何方式去验证。" },
    { id: 25, dimension: "trust", text: "对方偶尔不报备行踪，不会让我觉得有什么问题。" },
    { id: 26, dimension: "trust", text: "过去的感情中被欺骗的经历，深刻影响了我现在的信任能力。" },
    { id: 27, dimension: "trust", text: "我认为情侣之间保持一定的隐私空间与信任并不矛盾。" },
    { id: 28, dimension: "trust", text: "如果我发现对方对我有所隐瞒，即便很小的事，我也会动摇信任。" },

    // 五、独立与依赖（7题）
    { id: 29, dimension: "independence", text: "即使在恋爱中，我也坚持保有自己的社交圈子和兴趣爱好。" },
    { id: 30, dimension: "independence", text: "遇到困难时，我的第一反应是自己想办法解决，而不是找伴侣求助。" },
    { id: 31, dimension: "independence", text: "我希望恋爱后双方保留各自的经济独立性。" },
    { id: 32, dimension: "independence", text: "我愿意为了一段认真的关系搬去对方的城市生活。" },
    { id: 33, dimension: "independence", text: "生活中一些小事（如选餐厅、规划行程），我更习惯让对方做决定。" },
    { id: 34, dimension: "independence", text: "我害怕在感情中失去自我，所以会有意识地保持一定距离。" },
    { id: 35, dimension: "independence", text: "我认为真正好的关系是互相依赖又不失独立，两者可以平衡。" },

    // 六、付出与索取（7题）
    { id: 36, dimension: "giving", text: "在感情里我通常是付出更多的那一方。" },
    { id: 37, dimension: "giving", text: "当我付出很多而对方没有同等回应时，我会感到委屈和不满。" },
    { id: 38, dimension: "giving", text: "我认为爱一个人就应该无条件付出，不期待回报。" },
    { id: 39, dimension: "giving", text: "我在感情中更习惯接受对方的付出，而不是主动给予。" },
    { id: 40, dimension: "giving", text: "我会因为对方的付出而产生“欠了对方”的心理压力。" },
    { id: 41, dimension: "giving", text: "我认为健康和长久的关系需要双方付出大致对等。" },
    { id: 42, dimension: "giving", text: "为了伴侣的重要目标，我愿意暂时牺牲自己的利益。" },

    // 七、浪漫认知（7题）
    { id: 43, dimension: "romance", text: "我相信一见钟情的存在。" },
    { id: 44, dimension: "romance", text: "对我来说，仪式感（纪念日、惊喜、情书）是感情的必需品。" },
    { id: 45, dimension: "romance", text: "我认为浪漫会随着时间推移自然消退，维持感情靠的是责任而非浪漫。" },
    { id: 46, dimension: "romance", text: "我愿意花大量精力为伴侣策划一次惊喜。" },
    { id: 47, dimension: "romance", text: "如果没有浪漫和激情，一段关系对我来说就失去了意义。" },
    { id: 48, dimension: "romance", text: "我认为平平淡淡、细水长流的感情比轰轰烈烈更珍贵。" },
    { id: 49, dimension: "romance", text: "我对电影和小说中描绘的爱情抱有真实的期待。" },

    // 八、沟通模式（7题）
    { id: 50, dimension: "communication", text: "在感情中，我倾向于有话直说，不喜欢拐弯抹角。" },
    { id: 51, dimension: "communication", text: "当我对关系不满意时，我往往会用冷落对方的方式来表达，而不是直接说出来。" },
    { id: 52, dimension: "communication", text: "我喜欢与伴侣进行深入的、触及内心的对话。" },
    { id: 53, dimension: "communication", text: "对方流露出负面情绪时，我会主动询问并尝试理解。" },
    { id: 54, dimension: "communication", text: "我在沟通中容易情绪上头，事后又后悔自己说过的话。" },
    { id: 55, dimension: "communication", text: "我更习惯用文字（消息、信）来表达感受，而不是面对面说。" },
    { id: 56, dimension: "communication", text: "谈论感情中的问题时，我会刻意用“我感觉……”而不是“你总是……”的表达方式。" },

    // 九、过往影响（7题）
    { id: 57, dimension: "past", text: "我的原生家庭深刻塑造了我对爱情的期待和恐惧。" },
    { id: 58, dimension: "past", text: "父母之间的相处模式，是我理想关系的参照或反面教材。" },
    { id: 59, dimension: "past", text: "过往的某段感情经历，至今仍影响着我对新关系的信任程度。" },
    { id: 60, dimension: "past", text: "童年时期的情感经历（被忽视、被过度保护等），影响了我在感情中的行为模式。" },
    { id: 61, dimension: "past", text: "我会有意识地从过去的感情教训中学习，避免重蹈覆辙。" },
    { id: 62, dimension: "past", text: "我觉得自己尚未从某段过去的感情中完全走出来。" },
    { id: 63, dimension: "past", text: "我认为一个人的成长经历决定了 TA 的爱情底色，改变空间有限。" },

    // 十、未来期望（5题）
    { id: 64, dimension: "future", text: "婚姻对我来说是感情关系的必要目标。" },
    { id: 65, dimension: "future", text: "我认为婚前同居是检验双方是否合适的重要步骤。" },
    { id: 66, dimension: "future", text: "生育子女是我规划中的人生必选项。" },
    { id: 67, dimension: "future", text: "在事业与家庭发生冲突时，我愿意优先考虑家庭。" },
    { id: 68, dimension: "future", text: "我不确定自己是否想要一段终身承诺的关系，更愿意走一步看一步。" },

    // 十一、择偶标准（5题）
    { id: 69, dimension: "standards", text: "在选择伴侣时，性格和三观比外貌更让我看重。" },
    { id: 70, dimension: "standards", text: "对方的经济条件和事业发展前景是我选择伴侣的重要考量。" },
    { id: 71, dimension: "standards", text: "家庭背景和社会地位相似的人，更适合与我建立长期关系。" },
    { id: 72, dimension: "standards", text: "我认为兴趣爱好高度一致是维持长期关系的关键条件。" },
    { id: 73, dimension: "standards", text: "对方的外貌和气质必须达到一定标准，我才能产生进一步发展的意愿。" },

    // 十二、性观念（5题）
    { id: 74, dimension: "sex", text: "我愿意与伴侣开放地讨论性方面的需求和偏好。" },
    { id: 75, dimension: "sex", text: "我认为性是感情关系中非常重要的一部分，不和谐的性会影响关系质量。" },
    { id: 76, dimension: "sex", text: "我认为在关系早期就发生性行为是不合适的。" },
    { id: 77, dimension: "sex", text: "没有爱的性对我来说是无法接受的。" },
    { id: 78, dimension: "sex", text: "我会因为伴侣在性方面的观念与自己不一致而认真考虑是否继续这段关系。" }
  ]
};
