Agents can write runnable harnesses. Can they also select versions that improve beyond their development feedback? HarnessDev evaluates the runnable artifacts and separates the model that creates a harness from the one that executes it. In only **2 of 9** evolution lineages did the creator declare the best version on the held-out set. [Yuhao Wu et al., arXiv v1](https://arxiv.org/abs/2609.01437v1)

## 1. Understanding the Topic: How Should We Measure a Better Harness?

A spreadsheet agent may declare completion after inserting formulas while leaving some cells empty. A completion check could catch that case and also impede legitimate exits. Evaluation needs to account for improvement on visible tasks, improvement on unseen tasks, and execution-token cost. Another runtime model may also have different stopping and tool-calling behavior.

## 2. Related Work: From Optimizing a Harness to Evaluating Its Developer

The [Darwin Gödel Machine](https://arxiv.org/abs/2505.22954v3) studies branching search over coding-agent versions. [HarnessEvolve](https://arxiv.org/abs/2609.00829v1) uses reference traces to diagnose failures and screen updates. HarnessDev measures **whether a developer model can create and select reproducibly runnable artifacts**, and compares those artifacts under their paired models and a common executor. [Related work](https://arxiv.org/html/2609.01437v1#S5)

## 3. Research Questions: Creation, Evolution, and Transfer

1. Can models turn a weak runnable seed and a few examples into an effective harness?
2. Given task feedback, can a creator choose a version that also improves on unseen tasks?
3. How much of a harness's performance survives a change of executor?

## 4. Understanding the Method: Frozen Commits Across Two Development Stages

![HarnessDev compares harness components across domains and stages](../assets/img/blog/harnessdev/architecture.png "Figure 1 · Original Figure 5, PDF page 10, shows execution loops, tool policies, and other architecture features across domains and stages. Reproduced unchanged.")

**Creation.** A creator starts from a weak runnable seed and edits an executable artifact within common entry-point and audit constraints. It can debug on visible examples. An independent environment evaluates the frozen submission. Self-Eval uses the creator as executor, while Unified-Eval uses Gemini 3.1 Pro for all submissions. [Paper workflow and Section 3](https://arxiv.org/html/2609.01437v1#S1.F1)

**Evolution.** The creator starts from its Code harness and improves it with feedback from **100** SWE-Pro tasks and **89** Terminal-Bench tasks. A commit enters the official trajectory only after both evaluations finish, and the feedback score equally weights the two percentages. After development, the authors evaluate each official version on **630** separate SWE-Pro tasks, withholding those scores from the creator. [Sections 3 and 4.3](https://arxiv.org/html/2609.01437v1#S4.SS3)

## 5. Experimental Design and Results

### Main Evaluation 1: Creation Depends on the Task and Executor

Creation covers **6** creator models, **4** domains, and **5** benchmarks with **2,207** unique downstream instances. Results typically average three independent creations per creator and benchmark. The table excerpts Opus 4.8 Self-Eval and the human-engineered reference, using each benchmark's native metric. [Sections 4.1–4.2 and Table 3](https://arxiv.org/html/2609.01437v1#S4.SS2)

| Benchmark | Opus 4.8 | Human-engineered reference |
| --- | ---: | ---: |
| SWE-Pro | 69.3 | 80.0 |
| Terminal-Bench 2.1 | 64.8 | 88.8 |
| MLE-bench | 32.9 | 24.0 |
| EQ-Bench3 | 84.6 | 83.7 |
| BrowseComp | 52.4 | 92.2 |

Writing and machine-learning experimentation approach or exceed the selected references, while search shows a larger gap. Some references are external system results with different executors. Rankings change under a fixed executor, so Self-Eval also reflects harness–model compatibility. [Tables 3–4](https://arxiv.org/html/2609.01437v1#S4.SS2)

### Main Evaluation 2: Held-Out Gains Are Smaller Than Feedback Gains

All five self-runtime declarations improve on the held-out set, by **1.43–4.44** percentage points with a mean of **3.11**. Under fixed Gemini, only Opus improves and the other three lineages regress. For example, GPT-5.5's fixed-executor feedback score moves from **56.6** to **59.1**, while its held-out score drops from **42.22** to **31.90**. [Table 6 and Figure 8](https://arxiv.org/html/2609.01437v1#S4.SS3)

### Supporting Analysis: Trace the Score Back to the Executed Change

Feedback and held-out scores move in the same direction for **34** of **64** comparable switches (**53.1%**). One positive case is Opus detecting that many runs claimed success without passing the task and adding a completion check. Such changes can be inspected in the execution path. With one evolution trajectory per creator–executor setting and held-out evaluation limited to SWE-Pro, the comparisons support diagnosis more directly than statistical generalization. [Section 4.3 and limitations](https://arxiv.org/html/2609.01437v1#S4.SS3)

## 6. Our Reflections

### Topic Reflection: What Is This Field Studying?

HarnessDev makes **version selection** measurable. A developer needs to establish which change actually executed, whether a feedback change exceeds noise, and which executor behavior the change relies on.

### Limitation Reflection: What Remains Unresolved?

Repeated use of visible tasks can amplify lucky runs. Held-out evolution covers one code benchmark, leaving writing, analysis, and research evolution untested. Specializing a harness for one model may also be useful and needs a separate assessment from portability. [Section 6](https://arxiv.org/html/2609.01437v1#S6)

### Solution Reflection: What Directions Could Address These Issues?

Freeze the incumbent and candidate, rerun them with independent seeds and two executors, and select on reserved validation data. Then evaluate on a hidden set from a different task distribution, compare with a simple search baseline under matched budgets, and retain the execution paths and resource costs associated with each change.

*Figure 1 reproduces HarnessDev v1 Figure 5 unchanged under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/).*
