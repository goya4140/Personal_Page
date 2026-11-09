> 本文结合一手论文与作者项目页，整理评分规则的构造与验证。文中“作者报告”限定于相应研究的实验设置；跨工作比较与研究建议明确作为本文综合，而不把它们表述为既有结论。

开放式 coding agent 的评测并不只是判断一个 patch 能否通过测试。真实 issue 往往同时包含功能、兼容性、性能、安全、可维护性以及过程约束；其中一部分可以由编译、单元测试或静态分析直接裁决，另一部分却需要解释任务意图、检查证据链并处理多种正确实现。因此，Rubric construction 的关键不在于“为 LLM 写一个更长的评分 prompt”，而在于构造一个**任务需求、环境证据与判别规则共同组成的验证器**。高质量 rubric 把模糊的成功概念分解为可追溯、可观察、可反驳的 criteria；低质量 rubric 则可能只是在把 judge 的偏好、reference implementation 的表面结构或生成器的偏差规模化。

这一视角承接了教育测量中的基本警告：analytic、任务特异的 rubric 与评分者训练通常有助于可靠性，但“存在 rubric”本身不保证其效度。[Jonsson and Svingby, 2007](https://doi.org/10.1016/j.edurev.2007.05.002) [Brookhart and Chen, 2015](https://doi.org/10.1080/00131911.2014.929565) 在 LLM 评价中，这一区分更加重要。FLASK、G-Eval 与 Prometheus 说明细粒度、条件化 judge 能提高诊断性或与人类评分的一致性；但 MT-Bench 同时表明 LLM judge 会受到位置、冗长度和自增强偏差影响。[FLASK](https://arxiv.org/abs/2307.10928) [G-Eval](https://arxiv.org/abs/2303.16634) [Prometheus](https://arxiv.org/abs/2310.08491) [MT-Bench](https://arxiv.org/abs/2306.05685) 因而，本文关注的对象不是单一 judge 的准确率，而是 rubric 从构造到进入训练闭环之前所需的整条验证链。

## 问题定义：Rubric 是需求的可执行近似

设任务需求为 (Q)，环境可获得的证据为 (E)（例如 issue、代码库、测试、运行日志、reference patch 与工具输出），一个 rubric 可表示为：

\[
\mathcal{R} = \{(c_i, p_i, v_i, w_i, g_i)\}_{i=1}^{m},
\]

其中 \(c_i\) 是 criterion，\(p_i\) 是其对应的 requirement provenance，\(v_i\) 是可接受证据或 verifier，\(w_i\) 是权重，\(g_i\) 是所属的层级或 gate。该表示有两个直接含义。第一，每一条 criterion 都应能回指到需求、测试、领域规范或风险约束，而不是来自通用的“回答清晰”“代码优雅”之类脱离任务的偏好。第二，criterion 不应只有自然语言描述；它还需要说明什么证据可以支持或否定它，例如某项测试、一个行为性质、一次工具调用后获得的 artifact，或经校准的人工/LLM 判断。

在 coding agents 中，尤其应分开处理 hard gates 与 soft/process criteria。hard gates 负责不可妥协的约束，如编译成功、禁止篡改 grader、关键安全不变量和可执行测试；soft criteria 则描述定位、证据收集、最小修改、失败恢复与效率。若把两类项目简单加权，一个叙述流畅但功能错误的轨迹可能从 learned judge 获得不当高分。相反，只以最终测试作为唯一反馈，又会使长时程搜索面对极其稀疏的学习信号。SWE-TRACE 和 rubric-supervised critic 分别代表了以过程 rubric 训练 PRM、以及从稀疏真实 outcome 中学习 critic 的两种尝试，但二者均不消除最终独立执行验证的必要性。[SWE-TRACE](https://arxiv.org/abs/2604.14820) [A Rubric-Supervised Critic](https://arxiv.org/abs/2603.03800)

> **构造链条**：需求与环境证据 → 需求图 → 原子准则 → 可执行门禁与过程证据 → 独立验证 → 训练或搜索 → 对抗审计与修订。


## 从固定维度到任务自适应的构造谱系

现有方法可按 rubric 的来源、结构和用途，而不是单纯按发表年份来理解。第一类是**固定能力维度**：FLASK 将评价从整体偏好拆为随指令组合的 skill sets，G-Eval 用评价表单和链式推理约束 judge，Prometheus 则训练显式接受 rubric/reference 的开源 evaluator。这一类工作的贡献是证明 criterion 化评分比单一总分更可诊断；Prometheus 在作者的 45 个 customized-rubric 实验中报告了 0.897 的 Pearson correlation，但这应解读为特定数据与 rubric 条件下的 judge-alignment 证据，而非 rubric 正确性的充分证明。[FLASK](https://arxiv.org/abs/2307.10928) [G-Eval](https://arxiv.org/abs/2303.16634) [Prometheus](https://arxiv.org/abs/2310.08491)

第二类是**题目特异 rubric**。SedarEval 为 1,000 道知识、数学、代码和逻辑题设计逐题的 scoring/deduction points；AlignBench 把中文真实场景、人工核验 reference/evidence 与 rule-calibrated 多维 judge 相连；代码教育中的 Rubric Is All You Need 则在 150 个 DSA 与 80 个 OOP 提交上比较题目特异 rubric。它们共同说明，任务细节、扣分点和证据来源应进入 rubric，而非只依赖通用 helpfulness 维度。[SedarEval](https://aclanthology.org/2024.findings-emnlp.984/) [AlignBench](https://aclanthology.org/2024.acl-long.624/) [Rubric Is All You Need](https://arxiv.org/abs/2503.23989) 但题目特异性也带来人工构建、reference 锚定和跨任务维护成本；更关键的是，criterion 若从 gold patch 的表面结构抽取，便可能拒绝行为等价的 alternative patch。

第三类将 rubric 扩展到**层级任务与过程轨迹**。PaperBench 把 20 个 AI 论文复现任务拆为 8,316 个可单独评分的层级节点，并与原论文作者共同开发 rubric，是对长时程部分进展给分的代表性尝试。[PaperBench](https://arxiv.org/abs/2504.01848) 面向软件工程，SWE-TRACE 以 Rubric-Agent 产生中间步骤的密集反馈并训练 PRM；另一项 critic 工作从真实人机 trace 中定义 24 个可观察行为特征，在 SWE-bench 的重排和早停中取得收益。[SWE-TRACE](https://arxiv.org/abs/2604.14820) [A Rubric-Supervised Critic](https://arxiv.org/abs/2603.03800) 这类方法的核心价值不在于用语言 judge 替代测试，而在于把最终成功前可观测的中间证据变成可学习信号；其风险则是局部行为分数和最终成功之间并没有自动的因果关系。

第四类是**自动生成、筛选和重构 rubric**。OpenRubrics 从 preferred/rejected response 的差异中抽取 hard rules 与 implicit principles，并以 preference-label consistency 过滤；Auto-Rubric 用 verification-driven refinement 和压缩目标从少量 preference pairs 得到分层 core set；RRD 显式针对 coverage 缺失、维度混杂和 criterion 冗余进行递归分解、过滤和相关性权重控制。[OpenRubrics](https://arxiv.org/abs/2510.07743) [Auto-Rubric](https://arxiv.org/abs/2510.17314) [RRD](https://arxiv.org/abs/2602.05125) RubricHub 则将 principle-guided synthesis、multi-model aggregation 与 difficulty evolution 组合为 coarse-to-fine pipeline，构造 110k 多领域数据；RubricRAG 以检索相似任务 rubric 补充领域知识。[RubricHub](https://aclanthology.org/2026.acl-long.1445/) [RubricRAG](https://arxiv.org/abs/2603.20882) 这些工作把人工编写瓶颈转化为生成、过滤与版本化问题，但也把 generator monoculture、偏好数据偏差与检索泄露带入了验证器。

最后，rubric 已从评价工具变成**训练信号**。Rubrics as Rewards 在 HealthBench 与 GPQA-Diamond 上将 instance-specific rubric 用于 on-policy RL，作者报告相对 direct Likert judge reward 最多 31% 与 7% 的提升；OpenRS 通过 pairwise adaptive meta-rubric 和可验证 pointwise rubric 进行 pairwise RL；AdaRubric 则从任务描述生成 agent-specific dimensions，生成 DPO 偏好对。[Rubrics as Rewards](https://arxiv.org/abs/2507.17746) [OpenRS](https://arxiv.org/abs/2602.14069) [AdaRubric](https://arxiv.org/abs/2603.21362) 这条路径提升了训练密度，却使 rubric 成为被策略主动优化的目标。因此，静态 test-set agreement 不足以论证“RL-safe”：策略会寻找 criterion 漏洞、利用 judge 偏差或在工具环境中制造表面证据。

## 方法比较：应比较 verifier 结构，而非只比较单一分数

表 4.5-1 用统一维度压缩主要工作。表中“主要证据”说明 criterion 最终依赖什么；“主要边界”不是对论文质量的否定，而是指出其结果不能被外推到何处。

| 方法 | Rubric 来源与结构 | 任务/环境 | 主要证据与反馈位置 | 主要结果或贡献 | 主要边界 |
|---|---|---|---|---|---|
| FLASK | 指令条件的 skill sets | 开放式 LLM 指令 | human/model 细粒度评分，final | 从整体分数转向能力诊断 | taxonomy 与 judge 对任务分布敏感 |
| Prometheus | 用户 rubric + 可选 reference，flat score rubric | 长文本/开放回答 | rubric-conditioned 13B judge，final | 45 rubrics 上作者报告 (r=0.897) | 合成 teacher、reference 依赖、非 RL 审计 |
| SedarEval | 每题 scoring/deduction rubric | 知识、数学、代码、逻辑 | evaluator LM，final | 1,000 个逐题 rubric | 人工构建成本；多正确解覆盖未充分表征 |
| AlignBench | 人工核验 evidence + 多维规则 | 中文开放问答 | rule-calibrated LLM judge，final | evidence-aware 中文对齐评测 | 非 repo/agent 环境，网页证据会漂移 |
| PaperBench | 作者共建 hierarchical artifact rubric | AI 论文复现 agent | LLM judge，任务/子任务级 | 20 任务、8,316 节点的部分进展评测 | 层级误差累积；实现相似性偏差 |
| Rubric Is All You Need | question-specific code rubric | DSA/OOP 学生代码 | multi-agent grading，final | 代码教育的逻辑评估与 Leniency 指标 | 小规模教育数据，不代表生产 repo |
| SWE-TRACE | 中间步骤 heuristic rubric | SWE agent | PRM，RL + test-time pruning | 过程反馈、token/latency 优化 | PRM hacking、短轨迹偏好、独立测试需求 |
| Critic Rubrics | trace-observable 24 行为项 | 真实人机 coding traces | critic，rerank/early stop/training | 由稀疏 outcome 学 critic | 行为项是代理变量，因果效度未知 |
| OpenRubrics / Auto-Rubric / RRD | contrastive rules；压缩层级；递归去冗余 | RM 与开放任务 | generated rubric → RM/RFT | 规模化生成与 criterion filtering | preference/generator 同源、coverage 不足 |
| RubricHub | coarse-to-fine 合成、聚合、难度演化 | 多领域 post-training | RuFT → RuRL | 110k rubric 数据与训练管线 | 合成数据单一化、benchmark optimization |
| RubricBench | 专家 atomic rubric gold | 困难 pairwise comparisons | rubric meta-evaluation | 直接测 human/model rubric 差距 | 规模和领域限制；gold 仍需审计 |
| RaR / OpenRS / AdaRubric | instance/meta/task-adaptive rubric | 医疗/科学或 agent 轨迹 | RL / pairwise RL / DPO | 将 rubric 变为学习信号 | policy-shift 与 reward hacking 尚非充分解决 |
| LLMEval-Logic / ClinConsensus | 专家原子项 + solver/阈值 | 中文逻辑 / 医疗 | Z3 或 dual judge，final | 形式/领域专家锚定 critical coverage | 形式化语义、隐私与领域迁移风险 |

跨论文报告至少应把四类问题分开：**rubric 是否覆盖需求**、**judge 是否按 rubric 评分**、**分数是否与人类/执行结果一致**、以及**优化该分数后真实能力是否提升**。把这四个问题合并为一项 Pearson 或 pairwise accuracy，会混淆根本不同的失效模式。LLM-Rubric 显示校准层可以缩小特定人类评分尺度上的误差；RubricBench 和近期 paper-reproduction meta-evaluation 则表明，模型写出的 rubric 即使自然流畅，也可能与专家原子 criterion 存在明显差距。[LLM-Rubric](https://aclanthology.org/2024.acl-long.745/) [RubricBench](https://aclanthology.org/2026.acl-long.1439/) [Can LLMs Write Reliable Rubrics?](https://arxiv.org/abs/2607.12835)

> **两个概念轴**：准则从通用维度到任务自适应维度，反馈从终局评分到过程诊断与训练闭环。这是方法归类，不是性能排行榜。


## 针对 coding agents 的构造与验证协议

基于上述比较，coding-agent rubric 应采用“先 specification，后轨迹”的构造顺序。首先，从 issue、接口契约、仓库约束、测试和历史行为形成 requirement graph，并对每条 requirement 指定 provenance。随后把 requirement 分为 hard gates、关键功能、边界/回归、质量约束和可选过程证据；每项 criterion 保持原子性，即一次失败应尽可能归因到一个明确的 requirement。第三，为每项 criterion 指定最强可用 verifier：运行测试或静态不变量优先于 LLM 判断；只有在无法直接执行的质量或过程项上才使用 rubric-conditioned judge。最后，使用 reference patch、不同正确 patch、单项违例 mutation、near-miss 和对抗性轨迹验证 rubric 的判别行为。

可将该协议写成最小验收表：

| 检验 | 应通过的对象 | 应拒绝的对象 | 失败意味着什么 |
|---|---|---|---|
| Reference acceptance | reference patch / 已验证轨迹 | — | criterion 或 verifier 实现错误 |
| Alternative acceptance | 行为等价但结构不同的 patch | — | rubric 过拟合 reference 表面形式 |
| Single-criterion mutation | 不违反该 criterion 的 patch | 只违反该 criterion 的 near-miss | criterion 不原子、证据错配或权重不当 |
| Harness integrity | 原始/随机重跑环境 | 篡改 grader、mock 掩盖失败 | verifier 可被 bypass |
| Judge robustness | 改写、排序、长度扰动后的等价轨迹 | — | rubric wording/format 偏差 |
| Policy-shift audit | 训练前后真实任务成功 | 高 reward、低真实成功轨迹 | reward hacking 或 judge OOD |

该协议把 PaperBench 的层级 artifact 思路、SWE-TRACE 的密集过程反馈、RubricBench 的原子 criterion 对照、以及 LLMEval-Logic 的形式验证锚定置于同一个框架中，而不把任一工作误作完整解决方案。[PaperBench](https://arxiv.org/abs/2504.01848) [SWE-TRACE](https://arxiv.org/abs/2604.14820) [RubricBench](https://aclanthology.org/2026.acl-long.1439/) [LLMEval-Logic](https://arxiv.org/abs/2605.19597)

## 局限：现有证据尚不能证明什么

第一，绝大多数结果仍是特定 benchmark、judge、prompt 和模型版本下的相关性或下游增益，不能证明自动 rubric 对任务真值具有充分效度。第二，许多自动生成 pipeline 的 generator、filter、judge 共享同一个模型家族或偏好数据源；这会使同源偏差在各环节一致，从而在内部指标上看似稳定。第三，reference-conditioned 方法可能将“接近参考答案”误当作“满足规格”，在多正确解的代码任务中尤为危险。第四，RL 或 reranking 的结果并不天然说明 reward 安全：训练策略对 rubric 的长期优化会改变 judge 所见轨迹分布。第五，在医疗、个人健康和真实代码库等高风险场景，除了技术误判，数据隐私、责任归属、rubric 更新、专家分歧和审计可追溯性都构成治理问题。ClinConsensus 与 RubricsTree 说明专家锚定和层级结构的价值，但也表明这些成本不能由纯自动化流程抹除。[ClinConsensus](https://arxiv.org/abs/2603.02097) [RubricsTree](https://arxiv.org/abs/2606.18203)

## 开放问题与研究议程

**Rubric adequacy benchmark。** 最直接的缺口不是再训练一个更强 judge，而是建立对 rubric 本身的反事实测试：自动构造每条 criterion 的 alternative pass、single-failure near-miss 与 adversarial bypass，以 criterion-level true/false positive 衡量 coverage 和判别性。RubricBench 已提供专家原子 rubric 的重要起点，但仍需要连接到可执行行为与 mutation testing。[RubricBench](https://aclanthology.org/2026.acl-long.1439/)

**多正确解下的 specification-first verification。** 代码 rubric 必须从外部行为、接口契约和不变量，而非 gold patch 的语法/文件结构推导。一个有前景的方向是将 property-based testing、metamorphic relations、静态分析与语义 judge 组成异构 verifier ensemble，并明确报告 alternative-solution acceptance rate。

**Rubric–policy co-evolution。** 当 rubric 进入 RL、DPO 或 test-time search 后，验证对象变成“面对主动优化的策略，rubric 是否仍代表真实目标”。所需的实验不应止于 Best-of-​N，而应包括 frozen anchor rubric、训练后独立测试、对抗 red-teaming、replay relabel 和 reward-hacking success rate。RaR、OpenRS、SWE-TRACE 与 AdaRubric 展示了闭环潜力，也使这项审计成为前提而非附加项。[RaR](https://arxiv.org/abs/2507.17746) [OpenRS](https://arxiv.org/abs/2602.14069) [SWE-TRACE](https://arxiv.org/abs/2604.14820) [AdaRubric](https://arxiv.org/abs/2603.21362)

**过程信号的因果效度。** “成功轨迹常出现某行为”不表示该行为促成成功。未来研究可在相同环境状态下比较 sibling actions，或通过 counterfactual replay/step ablation 测量删除某过程项后成功率的变化；这将把 PRM 从语言风格 critic 推向更接近因果 verifier 的对象。

**跨域、跨语言和跨 harness 的独立 holdout。** 所谓泛化不能只在英语指令改写上测量。最小协议应同时保留 domain、language、tool/harness、judge 和 generator holdout。中文逻辑和中文临床场景尤其应被视作独立 domain，而非英文基准的翻译补充。[LLMEval-Logic](https://arxiv.org/abs/2605.19597) [ClinConsensus](https://arxiv.org/abs/2603.02097)

**人机协同与版本治理。** 人类不必逐项从零撰写 rubric，而应被优先配置在高分歧、低置信度、高风险或高 reward-gradient 的 frontier cases。一个可审计系统应版本化记录 criterion 的来源、生成模型和 prompt、修改者、验证样本、已知 exploit 与撤回历史；这既是复现要求，也是高风险部署的治理底座。

## 小结

Rubric construction 的研究重心应从“让 LLM 更会打分”转向“让评价规则在需求、证据和被优化策略面前仍保持有效”。固定维度 judge 提供了可诊断的起点，题目特异和层级 rubric 将任务结构带入评价，自动生成与 rubric reward 则扩展了规模与训练密度；然而，规模化也放大了遗漏、同源偏差和 reward hacking。对 coding agents 而言，最可靠的设计不是选择测试或 rubric 其一，而是以可执行 hard gates 锚定最终 correctness，以原子化过程 rubric 提供密集反馈，并以替代正确解、mutation、对抗轨迹和人类复核持续检验两者之间的差距。
