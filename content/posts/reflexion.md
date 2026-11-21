Noah Shinn、Federico Cassano、Edward Berman、Ashwin Gopinath、Karthik Narasimhan、Shunyu Yao，2023，NeurIPS。[arXiv:2303.11366](https://arxiv.org/abs/2303.11366)；[作者仓库](https://github.com/noahshinn/reflexion)。

## 研究问题

agent 能否不更新权重，而把任务反馈转为语言 reflection 存入 episodic memory，以改善后续 trial。

## 研究设置

ALFWorld、HotPotQA、HumanEval 等；环境/测试给反馈；actor、evaluator、self-reflection；多次 trial。

## 方法与作者报告

跨决策、问答与代码任务改善 baseline；论文设置下 HumanEval 91% pass@1。贡献是 memory-level policy adaptation，而非参数学习。

## 局限与风险

反思可能错误并长期污染 memory；结果强依赖基础模型与反馈；HumanEval 数字不可跨 scaffold 直接比较。

## 在研究框架中的位置

放入“repair working memory”；支持修复对象可从 artifact 扩展到策略上下文。维度：记忆持久性、反馈来源、跨 trial 状态。
