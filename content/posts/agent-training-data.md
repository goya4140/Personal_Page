数据收集得到的领域文档、代码仓库、API 文档、用户轨迹、教程和工作流规范，通常不能直接用于 Agent 训练。它们需要逐步增加任务、动作、状态和验证结构，才能分别满足预训练、监督微调（SFT）和强化学习（RL）的要求。本文将这一过程概括为指令化、动作化、环境化和奖励化。预训练、SFT 与 RL 并非与四步平行的数据类别：经过基础规范化的材料可用于预训练；指令化和动作化主要形成 SFT 数据；环境化和奖励化则进一步产生可用于 RL 的交互经验。

## 指令化

指令化将文档、issue、教程或业务规范转化为明确任务，并划分模型可见上下文、环境隐藏状态和验证器私有信息。用于预训练时，领域材料可以保留文档、代码、schema 或弱标注轨迹的序列形态，重点是来源、版本、去重和许可；用于 SFT 时，则必须形成信息充分、目标明确的 instruction–response 样本。若把参考 patch、隐藏测试或完整操作答案写入输入，会造成标签泄露；若省略权限、历史状态或成功条件，任务又会变成欠约束问题。

[Self-Instruct](https://arxiv.org/abs/2212.10560) 展示了从少量 seed 自动生成 instruction、input 和 output 的通用范式，但启发式过滤不能证明任务事实正确。[SWE-bench](https://arxiv.org/abs/2310.06770) 则从真实 GitHub issue 提取任务，并用 base commit、仓库和测试保留执行上下文。[DIVE](https://arxiv.org/abs/2603.11076) 进一步采用 evidence-first 流程：先执行真实工具取得证据，再生成被证据支持的任务，从而减少与工具能力不匹配或没有可验证答案的合成请求。由此，指令化不只是文本改写，而是建立任务、证据和信息边界之间的对应关系。

## 动作化

动作化将最终回答或操作步骤转化为 Agent 可学习的动作接口与轨迹。对于工具 Agent，SFT 标签不仅包括文本答案，还应包含工具选择、参数、返回结果和跨轮依赖。[Toolformer](https://arxiv.org/abs/2302.04761)、[API-Bank](https://arxiv.org/abs/2304.08244) 与 [ToolLLM/ToolBench](https://arxiv.org/abs/2307.16789) 分别展示了工具调用自举、可运行训练/评测和大规模 API 路径合成。[APIGen](https://arxiv.org/abs/2406.18518) 使用格式、执行和语义三级检查，使合成调用从“语法正确”推进到“可执行且与任务语义一致”。

真实工作流还包含澄清、用户修改和工具依赖。[APIGen-MT](https://arxiv.org/abs/2504.03601) 将 ground-truth actions 与多轮对话分离，[TOUCAN](https://arxiv.org/abs/2510.01179) 从真实 MCP 环境生成多工具、多轮轨迹。教程和用户日志也可被动作化为 GUI demonstration，但必须在对应状态中重放；专家或教程给出的一条成功路径并不等于唯一正确路径。动作化后的数据主要服务于 SFT，其最低要求是动作可解析、时序一致、正负标签明确，并避免将事后信息提前写入 observation。

## 环境化

环境化将固定轨迹放回可交互世界，补齐初始状态、动作执行、状态转移、异常、副作用和 reset。SFT 只需要模型模仿已有 demonstration，而 RL 需要模型尝试不同策略并观察后果，因此仅保存一串 tool calls 或静态返回值并不能构成 RL 数据。[ALFWorld](https://arxiv.org/abs/2010.03768)、[WebShop](https://arxiv.org/abs/2207.01206) 和 [InterCode](https://arxiv.org/abs/2306.14898) 分别在具身、网页与代码执行任务中建立 step–observation–reset 接口；[AppWorld](https://arxiv.org/abs/2407.18901) 同时检查目标状态和 collateral damage，使环境能够接受多条策略，而非匹配唯一参考轨迹。

近期工作开始自动扩展环境。[AgentGym](https://arxiv.org/abs/2406.04151) 统一异质环境接口，[EnvScaler](https://arxiv.org/abs/2601.05808) 程序化生成 environment skeleton、scenario 和 rule validator，[EnvFactory](https://arxiv.org/abs/2605.18703) 从真实资源探索可执行环境。软件工程中的 [SWE-Gym](https://arxiv.org/abs/2412.21139)、[SWE-smith](https://arxiv.org/abs/2504.21798) 和 [MEnvAgent](https://arxiv.org/abs/2601.22859) 则将仓库、依赖、容器和测试组织为可重放任务。环境化的质量不能只用环境数量衡量，还应报告状态图、工具组合、异常分支、reset 成功率和版本信息。

## 奖励化

奖励化将成功条件、过程进展、副作用和政策约束转化为 verifier 与 reward，使环境能够产生 RL 信号。最基础的验证检查格式和执行；更强的验证还需判断目标状态是否达成、无关状态是否被破坏，以及结果是否符合语义和政策。[HumanEval](https://arxiv.org/abs/2107.03374) 使用单元测试判断功能正确性，SWE-bench 结合 fail-to-pass 与 regression tests，AppWorld 检查目标状态与 collateral damage，[PaperBench](https://arxiv.org/abs/2504.01848) 则结合程序执行、fresh reproduction 和层级 rubric。

终局 reward 稳定但稀疏，长轨迹还需要可靠的过程信号。[Verifiable Process Rewards](https://arxiv.org/abs/2605.10325) 使用 symbolic 或 algorithmic intermediate oracle 构造 turn-level reward；[COVERT](https://arxiv.org/abs/2604.09813) 在保持 oracle 不变的条件下加入 distractor、模糊请求和错误工具输出；[Envs-FORGE](https://arxiv.org/abs/2608.14312) 根据当前 policy 的通过率与 verifier reward 调整环境难度。这些方法把 RL 数据从静态轨迹扩展为“环境—rollout—验证器”的组合，但也使 verifier 偏差成为核心风险：如果任务生成器与验证器同源，或 reward 只接受参考路径，模型可能学习投机而非真实工作流能力。

| 处理步骤 | 新增结构 | 主要训练用途 | 核心质量要求 |
|---|---|---|---|
| 指令化 | 任务、上下文和信息边界 | 领域预训练、instruction SFT | 来源与版本明确；任务充分；无答案泄露 |
| 动作化 | 工具 schema、动作和轨迹 | Tool-use / GUI / multi-turn SFT | 动作可解析、可执行、时序一致 |
| 环境化 | 初始状态、状态转移、异常与 reset | 轨迹重放、offline/online RL | 状态真实、可重置、能检查副作用 |
| 奖励化 | verifier、reward、政策约束与预算 | RL、curriculum、失败恢复 | 验证独立；接受等价路径；防止 reward hacking |

四步构成一条带反馈的数据转化链。指令化与动作化产生 Agent SFT 所需的任务和行为监督；环境化与奖励化将这些监督扩展为可探索、可验证的 RL 经验。RL rollout 中产生的失败还可经过定位、修复和重新执行，回流为新的 SFT 修复轨迹或异常恢复环境。由此，预训练提供领域与工具知识，SFT 提供稳定的行动初始化，RL 则学习长期后果与恢复策略，而三者的要求被统一到同一套数据处理过程中。
