Zhibin Gou, Zhihong Shao, Yeyun Gong, Yelong Shen, Yujiu Yang, Nan Duan, and Weizhu Chen. 2023, ICLR 2024. [arXiv:2305.11738](https://arxiv.org/abs/2305.11738).

## Research question

How can models move beyond confident, purely verbal critique and use external tools to verify and progressively revise their outputs?

## Research setting

Free-form question answering, mathematical program synthesis, and toxicity reduction. Tools include search and code execution; the model progressively amends its output using tool evidence.

## Method and reported findings

The method consistently improves corresponding baselines across multiple tasks. Its central contribution is grounding critique in tools, rather than proving that arbitrary tool feedback is reliable.

## Limitations and risks

Tool selection, queries, and interpretation of outputs can all be wrong. Iteration increases cost. Tool responses may contain prompt injections or incomplete evidence.

## Place in our research framework

Place this under “tool-grounded verify–repair.” It supports treating observations as repair evidence. Relevant dimensions include tool type, evidence independence, revision count, and safety boundaries.
