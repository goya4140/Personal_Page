Noah Shinn, Federico Cassano, Edward Berman, Ashwin Gopinath, Karthik Narasimhan, and Shunyu Yao. 2023, NeurIPS. [arXiv:2303.11366](https://arxiv.org/abs/2303.11366); [authors’ repository](https://github.com/noahshinn/reflexion).

## Research question

Can an agent improve subsequent trials without updating its weights by converting task feedback into verbal reflections stored in episodic memory?

## Research setting

ALFWorld, HotPotQA, HumanEval, and other tasks; feedback from environments or tests; an actor, evaluator, and self-reflection component; multiple trials.

## Method and reported findings

The approach improves baselines across decision-making, question-answering, and coding tasks. Under the paper’s configuration, HumanEval reaches 91% pass@1. The contribution is memory-level policy adaptation rather than parameter learning.

## Limitations and risks

Reflections may be wrong and persistently contaminate memory. Results depend heavily on the base model and feedback. HumanEval figures are not directly comparable across different scaffolds.

## Place in our research framework

Place this under “repair working memory.” It supports extending the object of repair from an artifact to policy context. Relevant dimensions include memory persistence, feedback source, and cross-trial state.
