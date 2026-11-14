Zhibin Gou、Zhihong Shao、Yeyun Gong、Yelong Shen、Yujiu Yang、Nan Duan、Weizhu Chen，2023，ICLR 2024。[arXiv:2305.11738](https://arxiv.org/abs/2305.11738)。

## 研究问题

如何避免纯语言自信式 critique，让模型通过外部工具验证并逐步修改输出。

## 研究设置

free-form QA、数学 program synthesis、toxicity reduction；工具包括搜索、代码执行等；模型根据工具证据 progressive amendment。

## 方法与作者报告

在多任务上持续改善相应基线；关键贡献是把 critique grounding 到工具，而非证明任意工具反馈都可靠。

## 局限与风险

工具选择、查询和输出解释均可能错；循环成本增加；工具返回可能包含注入或不完整证据。

## 在研究框架中的位置

放入“tool-grounded verify–repair”；支持将 observation 作为修复证据。维度：工具类型、证据独立性、修订次数、安全边界。
