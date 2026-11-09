Aman Madaan et al. 2023, NeurIPS. [arXiv:2303.17651](https://arxiv.org/abs/2303.17651); [authors’ repository](https://github.com/madaan/self-refine).

## Research question

Can a single LLM improve output quality through a feedback–revision loop without additional training, supervised data, or reinforcement learning?

## Research setting

Seven types of text, reasoning, and coding tasks. The same LLM acts as generator, feedback provider, and refiner. Evaluation uses automated metrics and human assessments.

## Method and reported findings

The paper reports an average absolute improvement of approximately 20% across tasks. The method is simple and model-agnostic, making it useful as an inference-time refinement baseline.

## Limitations and risks

The generator and verifier share a strong common origin. Subjective metrics may reward superficial rewriting. Without execution-based checks, functional correctness cannot be guaranteed. The loop may oscillate.

## Place in our research framework

Place this under “minimal self-feedback baseline.” It helps explain which loops are insufficient to qualify as rigorous G–V–R. Relevant dimensions include role independence, external evidence, and stopping criteria.
