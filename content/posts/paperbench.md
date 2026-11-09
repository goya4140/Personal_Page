AI agent 能否从零复现前沿 AI 研究，及如何对长时程部分进展自动判分。

## 设置

20 篇 ICML 2024 Spotlight/Oral 的复现；8,316 个独立可评分子任务；rubric 与对应论文作者共同开发，另建 judge benchmark。

## 方法与作者报告

把大任务层级分解为 artifact/子任务 criterion 并由 LLM judge 评分；最佳被测 agent 平均复现分数为 21.0%。

## 局限与风险

论文复现是昂贵且特化环境；hierarchy 或 reference artifact 可能诱导“贴近 gold”而非接受另一正确路径；judge error 会沿树累积。

## 在研究框架中的位置

§“hierarchical rubric for long-horizon agents”；可复用图：任务→层级 artifact rubric→judge→failure analysis。
