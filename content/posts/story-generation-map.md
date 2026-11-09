> **一句话定位：** AI for Writing / Story Generation 研究如何让模型参与从灵感、规划、起草、续写到修改和评价的完整创作过程。这里重点关注长篇规划、状态记忆、交互选择，以及叙事质量的评价。



## 1. 这个领域在研究什么

AI for Writing 是一个跨越自然语言处理、人工智能、计算创造力与人机交互的领域。它并不只问“模型能否写出一段通顺文本”，而是在研究：**机器能否理解写作目标，组织长程结构，形成有因果关系的事件，维持人物与世界的一致性，并与作者或读者进行有效协作。**

Story Generation 是其中最具挑战性的分支之一。故事是典型的开放式生成对象：同一个提示可以对应大量同样合理、但情节和表达完全不同的答案。因此，它同时考验语言能力、规划能力、常识推理、人物建模、创造性和读者体验。

现有研究大致可以用两个维度组织。

| 维度 | 类型 | 核心问题 |
|---|---|---|
| 谁是主要作者 | 独立生成 | 模型从提示、主题或大纲出发生成故事 |
| 谁是主要作者 | 作者辅助 | 人类主导，模型负责建议、续写、改写、反馈或局部素材 |
| 生成尺度 | 短故事 | 几句话至数百词，强调事件完整性与结局 |
| 生成尺度 | 长篇故事/小说 | 数千词以上，强调规划、记忆和长程一致性 |
| 控制方式 | 条件生成 | 按主题、角色、风格、情感弧、大纲或知识生成 |
| 控制方式 | 交互生成 | 作者或读者在过程中选择、编辑或提供反馈 |

从创作流程看，研究对象通常包括五个环节：

1. **构思（Ideation）**：主题、人物、世界观、冲突和灵感生成；
2. **规划（Planning）**：故事线、大纲、章节、情感弧和角色目标；
3. **起草（Drafting）**：将计划实现为可读的叙事文本；
4. **修订（Revision）**：检测重复、矛盾、平淡情节和风格问题并重写；
5. **评价（Evaluation）**：判断文本是否通顺、连贯、有趣、有创造性，并忠实满足创作约束。



> 这个领域的核心矛盾是：**语言模型擅长局部流畅，却不天然具备全局故事规划；故事评价又是开放、主观且多维的，不能只依靠与参考答案的词面相似度。**



---

## 2. 核心问题一：如何生成

### 2.1 直接生成与续写

最直接的设定是给模型一个标题、写作提示或故事开头，让模型继续生成。这种方式简单、灵活，但容易出现：情节漂移、重复、突然引入新人物、前后事实矛盾、结局仓促，以及篇幅越长质量越差。

这一阶段的代表工作是 [Hierarchical Neural Story Generation](https://aclanthology.org/P18-1082/)。它发布 WritingPrompts 数据集，并说明单纯逐词生成不足以形成高层结构，因而将“生成故事前提”和“根据前提生成正文”分为两个层次。

### 2.2 Plan-and-Write：先规划，再写作

当前长篇故事生成的主流思想是把创作分为两个层次：

\(x \rightarrow P \rightarrow Y\)

其中，\(x\) 是提示或设定，\(P\) 是故事计划，\(Y\) 是最终正文。

规划可以是事件序列、关键词故事线、章节大纲、层级大纲、情感弧或人物目标。正文生成器不再完全自由续写，而是逐段完成计划。

关键演进包括：

- [Plan-and-Write](https://ojs.aaai.org/index.php/AAAI/article/view/4726)（AAAI 2019）：比较一次性规划完整故事线与边规划边写作；
- [PlotMachines](https://aclanthology.org/2020.emnlp-main.349/)（EMNLP 2020）：在按大纲写作时追踪动态 plot state；
- [Re3](https://aclanthology.org/2022.emnlp-main.296/)（EMNLP 2022）：生成全局计划，递归注入计划和当前状态，并对候选续写进行重排与事实修订；
- [DOC](https://aclanthology.org/2023.acl-long.190/)（ACL 2023）：使用更细的层级大纲和细粒度控制器生成数千词故事；
- [DOME](https://aclanthology.org/2025.naacl-long.63/)（NAACL 2025）：动态展开层级大纲，并用时间知识图谱记忆人物与事件变化。

这里已经形成一个相对稳定的认识：**长篇生成不是把上下文窗口加长就够了，而是需要将宏观规划和局部实现分离，同时允许计划随着写作进程动态调整。**

### 2.3 记忆、状态与知识增强

长篇故事必须知道“到目前为止发生了什么”。需要维护的状态至少包括：

- 人物属性、目标、关系、知识和情绪；
- 世界规则、地点、物品和社会关系；
- 已发生事件、因果关系和时间顺序；
- 未完成的承诺、伏笔和待回收冲突；
- 当前大纲位置和结局进度。

常见实现包括摘要记忆、检索记忆、人物档案、事件图、知识图谱和显式状态表。[RecurrentGPT](https://arxiv.org/abs/2305.13304) 用自然语言长短期记忆支持逐段长文本生成；DOME 则进一步使用带时间信息的知识图谱检测上下文冲突。

### 2.4 候选生成、批评与修订

另一条路线是不接受模型第一次生成的结果，而是执行：

\(\text{Draft} \rightarrow \text{Critique} \rightarrow \text{Select/Revise}\)

Re3 会生成多个候选并根据情节连贯性和提示相关性重排；[Collective Critics for Creative Story Generation](https://aclanthology.org/2024.emnlp-main.1046/)（EMNLP 2024）让多个 critic 和一个 leader 分别改进计划与正文，兼顾连贯性、创造性和表现力。这一方向把评价模型直接放进生成环路，是“如何生成”与“如何评估”开始融合的地方。

### 2.5 人机协作写作

AI 不一定取代作者，也可以成为创作工具：

- [Wordcraft](https://doi.org/10.1145/3490099.3511105)（IUI 2022）：为作者提供续写、替换和改写建议；
- [CoAuthor](https://arxiv.org/abs/2201.06796)（CHI 2022）：记录 63 位写作者与 GPT-3 的 1,445 次写作会话，用于研究人机协作；
- [Dramatron](https://arxiv.org/abs/2209.14958)（CHI 2023）：从 logline 分层生成角色、情节点、场景和对白，并由专业编剧使用和评价；
- [Plan, Write, and Revise](https://aclanthology.org/N19-4016/)（INLG 2019）：比较人类在规划、写作和修改阶段参与的不同方式。

这些研究说明，好的写作系统不仅要生成高质量文本，还需要支持可控、可理解、可撤销和可修改的创作过程。

---

## 3. 核心问题二：如何评估

### 3.1 为什么故事不能只用 BLEU、ROUGE

故事生成具有严重的 one-to-many 特征：同一提示可能存在无数合理故事。一个优秀故事不需要与某篇参考故事使用相同词语。因此，BLEU、ROUGE、词向量相似度等参考式指标通常只能衡量表面接近程度，不能可靠衡量情节质量、创造性或读者感受。

[UNION](https://aclanthology.org/2020.emnlp-main.736/) 和 [OpenMEVA](https://aclanthology.org/2021.acl-long.500/) 系统展示了这一问题：普通自动指标与人类判断相关性不足，也难以识别事件顺序错误、长程不连贯和因果常识问题。

### 3.2 应当评价哪些维度

故事评价不应该只有一个“总体质量分”。至少应拆为以下层次：

| 层次 | 评价维度 | 典型问题 |
|---|---|---|
| 语言层 | 流畅性、语法、可读性、风格 | 句子是否自然，叙述视角和文体是否稳定 |
| 局部叙事层 | 相邻段落衔接、事件合理性 | 当前事件是否自然承接前文 |
| 全局叙事层 | 情节连贯、因果、时间、人物一致性 | 数章前的信息是否仍然成立 |
| 结构层 | 开端、发展、高潮、结局、节奏 | 是否构成完整故事，而不是片段堆积 |
| 控制层 | 提示、大纲、风格和约束满足 | 是否写了用户要求的故事 |
| 创造性层 | 新颖性、意外性、表现力、趣味性 | 是否避免套路，同时仍然合理 |
| 读者层 | 沉浸、情感、共情、继续阅读意愿 | 作品是否真正影响读者 |

[DeltaScore](https://aclanthology.org/2023.findings-emnlp.353/) 针对流畅性、连贯性、相关性、逻辑性和趣味性进行细粒度评价；[Psychological Depth Scale](https://aclanthology.org/2024.emnlp-main.953/) 则从文学理论和读者体验出发评价真实性、复杂性、情感、共情与投入。

### 3.3 自动评价的主要范式

**1. 基于规则或结构的检查**

检查人物属性是否冲突、时间是否倒置、是否重复情节、事件是否违反世界规则、是否覆盖大纲条目。这类指标可解释且可靠，但只能覆盖预先形式化的错误。

**2. 学习式无参考指标**

UNION 通过区分真实故事和人工扰动故事，学习识别重复、逻辑冲突与长程不连贯。OpenMEVA 不只是一个指标，而是用于检验故事评价指标是否具有相关性、泛化性、鲁棒性和篇章错误识别能力的 benchmark。

**3. 扰动式评价**

DeltaScore 对故事施加与某一质量维度对应的扰动，再观察语言模型概率变化，以衡量故事在该维度上的质量。

**4. LLM-as-a-Judge**

[Do Language Models Enjoy Their Own Stories?](https://aclanthology.org/2024.tacl-1.62/)（TACL 2024）系统研究 LLM 能否替代人工评价。结论是 LLM judge 在系统级评价上优于传统指标，但仍受提示、解释质量、自我偏好和模型偏差影响。更可靠的做法是采用分解式 checklist、交换候选顺序、多评委和人工校准，而不是让单个模型直接给一个总分。

**5. 人类读者评价**

人类评价仍然是开放故事评价的关键依据。推荐优先使用成对偏好，而不是要求读者精确区分 6 分和 7 分。常见问题包括：哪个故事更连贯、更有趣、更符合设定、更想继续读，以及读者是否能指出具体矛盾。

### 3.4 推荐的评价组合



> 不要寻找一个“万能故事分数”。更稳妥的方案是四层评价：**确定性状态检查＋故事专用自动指标＋经人工校准的多维 LLM Judge＋真实读者成对偏好/行为数据。**



建议实验中同时报告：

1. **硬约束指标**：人物、时间、物品、地点、事件承诺冲突率；
2. **生成质量指标**：流畅、连贯、因果、相关、风格、创造性；
3. **控制指标**：提示遵循、大纲覆盖、目标达成；
4. **人工指标**：总体偏好、继续阅读意愿、情感投入；
5. **过程指标**：写作成本、推理成本、失败恢复与用户干预次数。

---

## 4. 论文阅读清单

### A. 先建立领域地图：综述

1. [Text-to-Text Automatic Story Generation: A Survey](https://aclanthology.org/2026.eacl-srw.39/) — EACL SRW 2026；系统综述 2021–2025 年文本到文本故事生成工作。
2. [A Survey on LLMs for Story Generation](https://aclanthology.org/2025.findings-emnlp.750/) — Findings of EMNLP 2025；区分独立生成和作者辅助，是当前最直接的 LLM 综述。
3. [Narrative Theory-Driven LLM Methods for Automatic Story Generation and Understanding](https://arxiv.org/abs/2602.15851) — 2026；从叙事理论组织生成、理解与评价。
4. [Automatic Story Generation: A Survey of Approaches](https://doi.org/10.1145/3453156) — ACM Computing Surveys 2021；补齐符号规划、传统神经方法和评价历史。

### B. “如何生成”：基础与长篇生成

5. [Hierarchical Neural Story Generation](https://aclanthology.org/P18-1082/) — ACL 2018；WritingPrompts 与层级生成基础。
6. [Plan-and-Write: Towards Better Automatic Storytelling](https://ojs.aaai.org/index.php/AAAI/article/view/4726) — AAAI 2019；显式故事线规划。
7. [PlotMachines](https://aclanthology.org/2020.emnlp-main.349/) — EMNLP 2020；大纲条件生成与动态情节状态。
8. [Re3: Generating Longer Stories With Recursive Reprompting and Revision](https://aclanthology.org/2022.emnlp-main.296/) — EMNLP 2022；规划、候选重排和一致性修改。
9. [DOC: Improving Long Story Coherence With Detailed Outline Control](https://aclanthology.org/2023.acl-long.190/) — ACL 2023；详细层级大纲和数千词故事控制。
10. [Collective Critics for Creative Story Generation](https://aclanthology.org/2024.emnlp-main.1046/) — EMNLP 2024；多 critic 迭代改进计划与正文。
11. [Generating Long-form Story Using Dynamic Hierarchical Outlining with Memory-Enhancement](https://aclanthology.org/2025.naacl-long.63/) — NAACL 2025；动态大纲、时间知识图谱和冲突检测。
12. [STORYTELLER: An Enhanced Plot-Planning Framework](https://aclanthology.org/2025.findings-acl.1071/) — Findings of ACL 2025；强化情节规划的连贯性与衔接。
13. [From Style to Story: A Curriculum Learning Approach for Imitative Novel Generation](https://aclanthology.org/2026.findings-acl.968/) — Findings of ACL 2026；风格、人物、世界观与情节的模仿式小说生成。

### C. “如何评估”：故事专用评价

14. [UNION: An Unreferenced Metric for Evaluating Open-ended Story Generation](https://aclanthology.org/2020.emnlp-main.736/) — EMNLP 2020；无参考故事质量指标。
15. [OpenMEVA](https://aclanthology.org/2021.acl-long.500/) — ACL 2021；检验自动指标相关性、泛化、鲁棒性和篇章错误识别能力。
16. [DeltaScore](https://aclanthology.org/2023.findings-emnlp.353/) — Findings of EMNLP 2023；基于扰动的细粒度故事评价。
17. [Do Language Models Enjoy Their Own Stories?](https://aclanthology.org/2024.tacl-1.62/) — TACL 2024；系统研究 LLM-as-a-Judge 用于故事评价的能力与偏差。
18. [Measuring Psychological Depth in Language Models](https://aclanthology.org/2024.emnlp-main.953/) — EMNLP 2024；从读者心理体验评价真实性、情感、复杂性和共情。
19. [CoKe: Customizable Fine-Grained Story Evaluation](https://aclanthology.org/2025.gem-1.31/) — GEM 2025；面向不同评价维度的可定制细粒度评价。
20. [Help Me Write a Story](https://aclanthology.org/2025.acl-long.1254/) — ACL 2025；通过人工注入写作问题研究 LLM 能否识别故事缺陷并给出反馈。

### D. 人机协作写作

21. [Plan, Write, and Revise](https://aclanthology.org/N19-4016/) — INLG 2019；比较人类在规划、写作和修订阶段的参与。
22. [Wordcraft](https://doi.org/10.1145/3490099.3511105) — IUI 2022；专业故事写作辅助界面。
23. [CoAuthor](https://arxiv.org/abs/2201.06796) — CHI 2022；大规模人类—GPT-3 写作过程数据。
24. [Co-Writing Screenplays and Theatre Scripts with Language Models](https://arxiv.org/abs/2209.14958) — CHI 2023；Dramatron 与专业编剧评价。

### E. 交互式小说与读者选择

25. [How to Tame Your Plotline](https://aclanthology.org/2024.wnu-1.2/) — WNU 2024；每轮生成故事片段和三个候选动作，用户选择后继续。
26. [RecurrentGPT](https://arxiv.org/abs/2305.13304) — 2023；长短期记忆、长文本生成和多个候选发展计划。
27. [Procedural Generation of Interactive Stories Using Language Models](https://pcgworkshop.com/archive/freiknecht2020procedural.pdf) — 2020；比较分析式、掩码式和自由生成式选项。
28. [Branching Narratives: Character Decision Points Detection](https://aclanthology.org/2024.games-1.8/) — Games and NLP 2024；检测真正改变剧情的角色决策点。
29. [Generating Relaxed, Obvious, and Dilemma Choices with Dunyazad](https://ojs.aaai.org/index.php/AIIDE/article/view/12791) — AIIDE 2015；生成不同心理效果的叙事选择。
30. [Towards a Theory of Choice Poetics](https://www.fdg2014.org/papers/fdg2014_paper_19.pdf) — FDG 2014；从 framing、options 和 outcomes 理解选择的叙事作用。
31. [Choose Your Own Adventure: Paired Suggestions](https://aclanthology.org/2021.naacl-main.279/) — NAACL 2021；用人类对候选续写的选择评价故事模型。
32. [Rushes: A Human Preference Dataset for Pluralistic Alignment](https://arxiv.org/abs/2607.20767) — 2026；8,167 名用户的 44,226 个叙事选择事件。
33. [Can LLM Agents Stick to the Script?](https://arxiv.org/abs/2608.08160) — ICML 2026；长程交互叙事中的事实和叙事承诺保持。

---

## 5. 建议阅读顺序

如果目标是快速形成研究方案，建议按下列顺序：

1. **领域总览**：A Survey on LLMs for Story Generation；
2. **生成范式**：Plan-and-Write → Re3 → DOC → DOME；
3. **评价范式**：UNION → OpenMEVA → DeltaScore → Do Language Models Enjoy Their Own Stories?；
4. **交互任务**：How to Tame Your Plotline → RecurrentGPT → CHADPOD → Dunyazad；
5. **交互评价设计**：Choice Poetics → Rushes → NCP-Bench。

最终应形成的研究认识是：**生成端需要“规划—记忆—正文—决策—状态更新”的闭环；评价端需要同时覆盖文本质量、故事结构、选择质量、后果忠实度、长程一致性与真实读者体验。**







---

*检索与整理时间：2026-09-02。阅读清单优先链接 ACL Anthology、AAAI、ACM/DOI 与 arXiv 原始论文页面。*
