Aman Madaan 等，2023，NeurIPS。[arXiv:2303.17651](https://arxiv.org/abs/2303.17651)；[作者仓库](https://github.com/madaan/self-refine)。

## 研究问题

无需额外训练、监督数据或 RL，单一 LLM 能否通过反馈—改写循环提高输出质量。

## 研究设置

七类文本、推理和代码相关任务；同一 LLM 扮演 generator、feedback provider、refiner；自动指标与人评。

## 方法与作者报告

各任务平均约 20% absolute improvement；方法简单且模型无关，适合作为 inference-time refinement baseline。

## 局限与风险

generator/verifier 高度同源；主观指标可能奖励表面改写；缺少 hard execution 时无法保证功能正确；循环可能振荡。

## 在研究框架中的位置

放入“最小 self-feedback baseline”；用于说明何种循环还不足以称为严格 G–V–R。维度：角色独立性、外部证据、停止条件。
