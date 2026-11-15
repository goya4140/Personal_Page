When an agent gets an answer wrong, should it change the prompt, the skill, or a tool call? HarnessEvolve compares failed training runs against verified reference trajectories and aggregates common errors before editing the agent harness. It reports **76.4%** on SpreadsheetBench, up from **44.3%** with the initial harness. Recent-batch replay and a separate validation set serve different roles in this process. [Wen Jiang et al., arXiv v1](https://arxiv.org/abs/2609.00829v1)

## 1. Understanding the Topic: Where Did the Run Go Wrong?

A spreadsheet agent can return the wrong column because it read the wrong range or because a tool never applied a formula. Computations after the first error can all run normally. A useful update has to identify a decision worth revisiting and test whether the repair preserves behavior on tasks that already worked.

## 2. Related Work: From Prompt Reflection to Harness Updates

[Reflexion](https://arxiv.org/abs/2303.11366) saves feedback as verbal reflection for subsequent attempts. The [Darwin Gödel Machine](https://arxiv.org/abs/2505.22954v3) stores multiple versions of a coding agent and explores historical branches. HarnessEvolve adds a verified successful path for the same task and screens changes in batches. Its edit scope includes skills, prompts, tool descriptions, and some execution code. [Sections 2–3](https://arxiv.org/html/2609.00829v1#S3)

## 3. Research Questions: Do Repairs Survive New Tasks?

1. Does a reference run help identify the earliest action worth inspecting in a failed run?
2. Do cause-based grouping and replay help select stable updates?
3. Does the final harness outperform initial and optimized baselines on separate test tasks, and do its skills transfer to other frameworks?

## 4. Understanding the Method: Reference, Diagnosis, and Selection

![Comparing traces, grouping errors, checking edits, and selecting on validation](../assets/img/blog/harnessevolve/workflow.svg "Figure 1 · Schematic for this reading. Figure 1 of the paper shows the full four-role architecture.")

**Generate references.** Before optimization, the executor receives a training question and its reference answer and tries to construct a tool-grounded solution. A separate evaluator checks calls and intermediate evidence. After at most **5** attempts, a task without a credible reference falls back to failed-trace-only diagnosis. Reference construction uses training answers, while final performance is assessed separately. [Sections 3.2–3.3](https://arxiv.org/html/2609.00829v1#S3.SS2)

**Diagnose and edit.** The optimizer compares trajectories, giving priority to the first consequential action divergence. It groups failures by cause, preserves rare errors, and proposes edits to the harness. For instance, a skill could require an explicit check of the selected spreadsheet range. A divergence gives a place to investigate, and a task can have several valid paths. [Section 3.4](https://arxiv.org/html/2609.00829v1#S3.SS4)

**Gate and select versions.** A quality check looks for embedded training questions and answers and limits added examples. A performance check compares the current batch and recent batches. The reported configuration uses batches of **40**, replays **2** preceding batches, and allows a maximum decline of **2.5 percentage points** on each replayed batch. The reported minimum current-batch gain is **0**, so ties satisfy that condition. Accepted versions enter a snapshot pool. Validation selects the version at each epoch end, and a test set is used for final reporting. [Original architecture and Section 3.5](https://arxiv.org/html/2609.00829v1#S3.F1)

## 5. Experimental Design and Results

The paper compares Base, GEPA, ACE, SkillOpt, and HarnessEvolve using shared splits within each dataset. Public tasks use DeepSeek-V4-Flash with OpenClaw. Internal tasks use LAMAgent and test Qwen3.6-27B and DeepSeek-V4-Flash. The proposed method has a wider edit scope than a skill-text optimizer. The table excerpts test accuracy from Table 2. [Setup and Table 2](https://arxiv.org/html/2609.00829v1#S4)

| Public benchmark | Initial harness | Strongest optimization baseline | HarnessEvolve |
| --- | ---: | ---: | ---: |
| SearchQA | 86.5% | ACE 90.0% | 92.9% |
| OfficeQA | 62.8% | ACE 68.9% | 70.9% |
| SpreadsheetBench | 44.3% | SkillOpt 74.6% | 76.4% |

On internal CloudCoreNetwork-QA with Qwen, the initial harness scores **43.4%**, GEPA **65.3%**, and the full method **86.9%**. The same setting scores **57.8%** without reference trajectories, **68.6%** without clustering, and **80.1%** without the quality gate. These ablations cover one benchmark and backbone. A separate transfer test takes OpenClaw-optimized skills to four frameworks without re-optimization. For example, OpenCode improves from **57.5% to 87.9%** on SpreadsheetBench. The transferred artifacts are skills. [Tables 1, 3, and 4 and the learning curves](https://arxiv.org/html/2609.00829v1#S4.SS2)

## 6. Our Reflections

### Topic Reflection: What Is This Field Studying?

Harness repair turns a failed task into a hypothesis about which rule should change. The training signal is a pair of inspectable execution paths, while subsequent evaluation tests the proposed repair.

### Limitation Reflection: What Remains Unresolved?

Reference quality depends on model verification, and a first divergence may separate two valid solutions. Recent-batch replay covers a short window. Main results chiefly report accuracy point estimates, leaving matched-budget comparisons for reference construction and repeated evaluation open. [Method and experiments](https://arxiv.org/html/2609.00829v1#S4)

### Solution Reflection: What Directions Could Address These Issues?

Keep several tool-verified paths for selected tasks and measure whether attribution agrees across them. Use a regression set stratified by failure type, and compare test gains with equal call budgets and independent repetitions. These controls would separate the effects of references, edit scope, and search effort.
