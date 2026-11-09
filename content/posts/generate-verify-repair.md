生成—验证—修复（Generate–Verify–Repair, G–V–R）是贯穿 coding-agent 任务构造、执行和训练的基本循环。系统首先生成候选程序或更完整的可执行任务包，在实际环境中运行并收集测试、状态变化或过程评价等证据，再根据失败证据定位并修复代码、任务描述、环境、验证器或交互轨迹。与普通的“生成后自我反思”不同，G–V–R 要求反馈来自可执行或可审计的证据，并在修复后从干净状态重新验证；因此，被维护的对象不只是最终代码，而是任务、环境、验证器、候选解和数据血缘之间的一致关系。

## 生成

生成环节负责构造后续可以执行和验证的对象。早期工作主要生成满足形式规格的程序或通过测试的补丁，例如 Sketch 在含有 holes 的部分程序中搜索满足 specification 的实现，CEGIS 将 verifier 返回的反例加入下一轮约束；GenProg、SemFix 和 Angelix 则分别通过测试驱动搜索或语义约束生成修复补丁。[Sketch](https://doi.org/10.1145/1168857.1168907) [CEGIS](https://arxiv.org/abs/1407.5397) [GenProg](https://doi.org/10.1109/ICSE.2009.5070536) [SemFix](https://doi.org/10.1109/ICSE.2013.6606623) [Angelix](https://doi.org/10.1145/2884781.2884807) 在现代 coding-agent 中，生成对象已从单个程序扩展为包含任务描述、repository snapshot、依赖环境、测试、reference solution 和交互轨迹的 executable bundle。

生成可以从不同可信种子出发。SWE-bench 和 SWE-Gym 从真实 issue/PR 构建 repo-level 任务与训练环境，保留较强的生态真实性，但也继承了公开数据污染、任务描述欠规格和环境漂移。[SWE-bench](https://arxiv.org/abs/2310.06770) [SWE-Gym](https://arxiv.org/abs/2412.21139) R2E-Gym 从 commit 生成测试并反向生成任务描述；SWE-smith 先建立可运行环境，再注入会破坏已有测试的缺陷。这两种方法更容易规模化，却分别面临实现线索泄露以及 synthetic defect 与真实 issue 分布不一致的问题。[R2E-Gym](https://arxiv.org/abs/2504.07164) [SWE-smith](https://arxiv.org/abs/2504.21798)

更进一步的工作尝试共同生成任务、环境、验证器和训练轨迹。SWE-Factory 自动构建和修复 issue evaluation environment，并用 exit code 与 fail-to-pass 检查验证任务；Terminal-World 以 agent skill 共同导出 instruction、environment 和 teacher trajectory；CLI-Universe 先按 capability taxonomy 生成 blueprint，再通过 Docker、rubric、hint filtering 和 fail-to-pass 门禁筛选任务。[SWE-Factory v3](https://arxiv.org/abs/2506.10954v3) [Terminal-World](https://arxiv.org/abs/2605.20876) [CLI-Universe](https://arxiv.org/abs/2606.22883) Meta-Task 把“生成 terminal task”本身定义为一个可执行任务，RST 则让通过验证的任务成为下一轮递归生成的种子。[Meta-Task](https://arxiv.org/abs/2607.27929) [RST](https://arxiv.org/abs/2608.05466) 这类系统除了报告生成数量，还应报告环境构建成功率、候选淘汰率、验证通过率、单个有效任务成本以及跨真实任务的迁移效果；任务更长或更难解并不自动等于更真实。

生成对象的结构决定了后续能够验证哪些行为，也限定了失败后可以修改哪些组件。若任务、环境和测试彼此错位，再强的模型也只能在错误问题上优化；验证得到的反例、失败测试和拒绝原因因而需要回流为下一轮生成的条件，而修复后的 bundle 还应连同 seed、模型、验证器版本和 repair history 一起保存，避免递归生成或数据划分中的 lineage leakage。

## 验证

验证环节负责判断生成对象是否满足任务要求，并产生足以指导下一步决策的证据。验证对象既包括候选代码的功能与回归，也包括环境能否稳定执行、任务描述是否充分、测试是否接受不同的合法实现、轨迹是否违反安全或策略约束。因而 verifier 不应被视为天然正确的单一 oracle，而应被视为一个需要版本化、校准和审计的证据栈。

最直接的验证方式是形式规格或可执行测试。Sketch、CEGIS 和语义修复方法能通过 checker、symbolic execution 或 constraints 返回具有明确语义的反例；HumanEval、APPS、SWE-bench 和多数 terminal tasks 则依靠隐藏测试、exit code 或状态变化判断正确性。[HumanEval](https://arxiv.org/abs/2107.03374) [APPS](https://arxiv.org/abs/2105.09938) 可执行测试便于自动化，但它们只验证被编码的行为。UnsatGuided 已表明，自动增加测试可以减少部分 regression-introduction，却因 oracle problem 难以补全 incomplete fixing。[UnsatGuided](https://arxiv.org/abs/1810.10614)

当人工测试不足时，可以补充生成测试、性质检查和学习型 verifier。CodeT 同时生成 code 与 tests，并依据 dual execution agreement 排序候选；Property-Generated Solver 用 property-based testing 检查不变量，减少直接猜测具体输出 oracle 的依赖。[CodeT](https://arxiv.org/abs/2207.10397) [Property-Generated Solver](https://arxiv.org/abs/2506.18315) CodeRanker 在不执行代码的情况下预测编译或运行时错误；LEVER 同时读取任务、程序和真实 execution result；R2E-Gym 则显示 executable 与 execution-free verifier 的错误模式具有互补性。[CodeRanker](https://arxiv.org/abs/2206.03865) [LEVER](https://arxiv.org/abs/2302.08468) 这些方法提高了覆盖或排序能力，但 code、test、property 和 learned judge 若来自相同模型与数据，仍可能形成 correlated error，因此多数票不能替代证据独立性。

对于长轨迹，仅判断最终 pass/fail 很难定位责任步骤。过程 verifier 为中间动作提供 rubric 或 reward，SWE-TRACE 将 stepwise oracle、过程奖励模型和 test-time pruning 串联起来；TrajDebug 进一步追踪 error lifecycle、resolution status 和 terminal impact，以区分已被恢复的局部错误与真正导致终局失败的 critical error。[SWE-TRACE](https://arxiv.org/abs/2604.14820) [TrajDebug](https://arxiv.org/abs/2608.06346) 在安全场景中，AgentDojo 分别评价任务效用与 prompt-injection security，AgentSentry 则通过 counterfactual re-execution 定位多轮工具调用中的 takeover point。[AgentDojo](https://arxiv.org/abs/2406.13352) [AgentSentry](https://arxiv.org/abs/2602.22724) 因此，验证输出不应压缩为单一分数，而应至少区分功能、回归、安全、成本、重放稳定性和 provenance。

由此得到的验证结果既决定生成对象能否被接受，也为下一步修复提供依据。一个简单的“失败”标签不足以支持可靠修复，证据还应指向具体组件、步骤或状态变化；生成阶段也应避免候选、测试和 judge 共享完全相同的偏差。由于修复还可能改变测试、环境或策略，每次重新接受结果时都需要固定 verifier 版本，并在 reference solution、独立合法实现、near-miss 和 adversarial shortcut 上重新检查误收与误拒。

## 修复

修复环节负责把验证失败转化为有边界的状态修改。其对象不只包括代码或补丁，还可能是任务描述、依赖环境、测试和 grader、上下文记忆、动作接口或模型 policy；有些失败适合局部 repair，有些只需 rerank，另一些已经破坏任务身份或血缘，应重新生成或直接丢弃。修复的核心因而不是“再写一次”，而是先确定失败由哪个组件或哪一个因果分叉造成，再选择最小且可重放的修改。

对候选程序的修复可以使用测试反馈、语义约束或工具证据。SemFix、DirectFix 和 Angelix 将失败转成 repair constraints，并尽量保留原程序结构；Self-Debugging 和 CRITIC 使用执行结果或外部工具修改生成内容；Agentless 则把 repo repair 固定为 localization、repair 和 patch validation 三阶段，减少自由 agent 的无效探索。[DirectFix](https://doi.org/10.1109/ICSE.2015.63) [Self-Debugging](https://arxiv.org/abs/2304.05128) [CRITIC](https://arxiv.org/abs/2305.11738) [Agentless](https://arxiv.org/abs/2407.01489) SEIDR 显式比较 repair-focused、replace-focused 和 hybrid 策略，说明“修旧候选还是生成新候选”本身也应成为可评价的路由决策。[SEIDR](https://arxiv.org/abs/2503.07693)

修复也可以作用于轨迹、上下文和数据。Reflexion 将任务反馈写入 episodic memory，以改变下一轮 trial；PromptArmor 在 agent 处理输入前检测并移除潜在注入；CompactionRL 联合学习任务执行与历史压缩，处理长轨迹超过 context window 的问题。[Reflexion](https://arxiv.org/abs/2303.11366) [PromptArmor](https://arxiv.org/abs/2507.15219) [CompactionRL](https://arxiv.org/abs/2607.05378) 这些方法的共同风险是“修复”可能删除有用证据或把错误反思长期写入状态。因此，context repair 不应只按压缩率或语言流畅度评价，而应检查压缩或净化后是否仍能复现原来的故障定位和 repair decision。

失败与修复轨迹还可以转成训练信号。DAgger 在 learner 实际访问的状态上请求 expert correction；ETO 把失败轨迹与更优 continuation 组成 preference pairs；DPO 和 DMPO 分别提供单轮与多轮偏好优化工具。[DAgger](https://proceedings.mlr.press/v15/ross11a.html) [ETO](https://arxiv.org/abs/2403.02502) [DPO](https://arxiv.org/abs/2305.18290) [DMPO](https://arxiv.org/abs/2406.14868) 但失败轨迹不能被整条标成负样本：有效前缀、错误证据和成功 recovery 都可能有训练价值。更合适的数据结构是在相同起始状态下保存 bad action、失败 observation、诊断过程和 repaired sibling，并视用途选择 bad-action loss mask、recovery SFT、preference learning 或过程奖励。

修复后的状态不能直接被视为成功，而应重新进入执行和验证流程；如果被修改的是 prompt、environment 或 verifier，还要检查任务身份是否发生漂移、旧结果是否需要重标，以及训练与测试的血缘是否遭到破坏。这样，三个操作才闭合为 `versioned generation → independent verification → component/causal diagnosis → targeted repair or discard → clean replay → adversarial audit → freeze and lineage`：系统优化的不是对固定测试的适应，而是任务、环境、验证器、解和轨迹之间持续成立的关系。
