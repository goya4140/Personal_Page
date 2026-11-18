An agent has produced the correct file, then deletes it during a final cleanup. Can an instruction to check carefully before submitting fix this reliably? AHE opens the improvement process to tool implementations, middleware, memory, and other harness components. Another agent reads execution evidence, edits these components, and runs the tasks again to test the changes.

This article reads Jiahang Lin, Shichun Liu, and colleagues' **Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses**, using [arXiv v4](https://arxiv.org/abs/2604.25850v4), updated on May 18, 2026. All results below refer to that version.

## 1. Topic: turning failure experience into harness improvements

In a coding agent, the model chooses actions while the surrounding framework exposes tools, manages execution state, organizes context, and retains experience. With the same model, timeouts, truncated output, repeated checks, or destructive cleanup can change the final result. These model-external components collectively form the harness.

A developer improving a harness reads traces, diagnoses failures, edits implementations, and reruns tasks. Automating this process requires making the editable surface, the relevant evidence, and the success criteria accessible to the optimizer. A rule that fixes one task may also consume execution budget on another.

## 2. Related work: where experience can accumulate

| Work | Main approach | Connection to AHE |
| --- | --- | --- |
| [ACE](https://arxiv.org/abs/2510.04618) | Organizes execution experience into evolving context and playbooks | Studies reusable experience, while AHE also permits tool implementation and middleware edits |
| [Training-Free GRPO](https://arxiv.org/abs/2510.08191) | Compares semantic advantages across trajectories and uses experience as a token prior | Offers improvement with fixed model weights and serves as a same-seed comparison |
| [Terminal-Bench](https://arxiv.org/abs/2601.11868) | Evaluates extended tasks in isolated terminal environments with executable tests | Supplies success and failure feedback for harness changes |

AHE uses [NexAU and the official implementation](https://github.com/china-qijizhifeng/agentic-harness-engineering) to expose editable components, trajectory summaries, and change predictions as inspectable files. The next agent invocation can read and check the preceding iteration's decisions.

## 3. Research questions: what feedback does harness evolution need?

The paper evaluates overall performance, transfer, and internal behavior. We organize its methodological motivation into three questions.

1. **How should the editing surface be represented?** Prompts, tool code, and middleware differ in form. The optimizer needs clear file boundaries and a way to revert changes.
2. **How can long traces reveal actionable failures?** A final score rarely identifies the problem, while reading every log can exhaust the available context.
3. **How can an edit's benefits and costs be checked?** Predict the tasks it should fix, inspect regressions on previously passing tasks, and test whether the experience transfers.

## 4. Method: execute, diagnose, edit, and check against the next run

![AHE observability layers and iteration](../assets/img/blog/ahe/method.png "Figure 1 · File-level harness components appear on the left. Execution traces become evidence that agents can inspect at increasing detail. The Evolve Agent edits components and records its decisions. Corresponds to v4 Figure 2, PDF page 4. Unmodified official repository image.")

### Step 1. Expose seven component types as files

The NexAU workspace exposes the system prompt, tool descriptions, tool implementations, middleware, skills, sub-agent configurations, and long-term memory. The NexAU₀ seed has a shell tool and begins without skills, middleware, or long-term memory. Each logical edit enters Git, retaining its diff and rollback location.

The Code Agent executes tasks, the Agent Debugger analyzes traces, and the Evolve Agent edits the workspace. A one-off exploration in the first iteration also builds initial knowledge from framework code and public references. The editing boundary protects the model and evaluation configuration. The optimizer can change the harness while the evaluator and model budget stay outside its write permissions. [Sections 3.1–3.3](https://arxiv.org/html/2604.25850v4#S3)

### Step 2. Read the overview, then inspect the failure evidence

Each task generates several traces. Traces for the same task share a navigable directory, and individual messages are accessible as files. The Agent Debugger compares successes and failures, writes task-level analyses, and aggregates a benchmark-level overview. The Evolve Agent can follow that overview into a task report, then inspect cleaned or raw traces.

This hierarchy preserves a way to check summaries. A missing output file is an outcome. Comparing traces may reveal that the file was correct before a cleanup removed it. Such a diagnosis remains a model's proposal until tested through execution.

### Step 3. Record a testable prediction for each edit

The change manifest records the failure evidence, proposed cause, edited location, predicted fixes, and tasks at risk of regression. The next iteration runs the new harness, compares task-level pass-rate changes, and feeds the results back to the manifest. The loop can revert rejected edits before proposing further changes.

Task changes provide feedback, while simultaneous edits and few attempts per task limit attribution. The manifest makes predictions inspectable. Establishing the causal contribution of an individual file requires additional controls. [Algorithm 1 and Section 3.3](https://arxiv.org/html/2604.25850v4#S3.SS3)

### Step 4. Turn lessons into mechanisms that execute

The paper's `path-tracing` case illustrates this process. The agent produced a correct image, checked it, and then removed the deliverable during cleanup. Iteration 5 added a publish-state mechanism that records output paths involved in a successful check. The shell tool intercepted later deletion of protected outputs, and the task moved from **0/2** to **2/2**.

Later cases exposed the mechanism's boundary. An override token let the agent delete an already deployed web page. Iteration 8 added hard blocks for critical published state and risk reminders before the next model call. These observed examples show experience becoming executable mechanisms, while revealing gaps that persist after an initial fix. [Appendix C](https://arxiv.org/html/2604.25850v4#A3)

## 5. Experiments and results: improvement, transfer, and cost

### Main evaluation: improvement on the optimization tasks

The authors ran one ten-iteration campaign over all **89 Terminal-Bench 2 tasks**, comprising **4 easy, 55 medium, and 30 hard tasks**, in approximately 32 hours. Tasks run in isolated environments, with external tests determining binary success and a **3,600-second** timeout. The reference configuration uses two rollouts per task. Pass@1 averages the independent attempts, so **2/2** means both succeeded. This average differs from the probability of finding at least one success among several attempts.

The table reports the best AHE configuration selected during the campaign. Main coding-agent evaluations use GPT-5.4 high. The main text also describes all three roles as high, whereas Appendix Table 4 lists the Evolve Agent at xhigh. Reproduction requires resolving this setting discrepancy. The paper does not report the mean and variance of multiple full campaigns or an independent held-out split within these 89 tasks. [Section 4.1, Table 1, and Appendix A](https://arxiv.org/pdf/2604.25850v4#page=6)

| Configuration | Overall pass@1 (↑) | Easy | Medium | Hard |
| --- | ---: | ---: | ---: | ---: |
| OpenCode | 47.2% | 75.0% | 52.7% | 33.3% |
| Terminus-2 | 62.9% | 75.0% | 74.5% | 40.0% |
| Codex | 71.9% | 75.0% | 80.0% | 56.7% |
| NexAU₀ seed | 69.7% | 87.5% | 78.2% | 51.7% |
| ACE | 68.9% | 91.7% | 78.2% | 48.9% |
| TF-GRPO | 72.3% | 100.0% | 79.4% | 55.6% |
| AHE | 77.0% | 100.0% | 88.2% | 53.3% |

*Source: v4 Table 1. The overall denominator is 89 tasks. Each difficulty column uses its corresponding task subset.*

![AHE per-iteration and best-so-far scores](../assets/img/blog/ahe/training.png "Figure 2 · The dashed curve shows each iteration's score, and the solid curve shows the best score so far. Approximately 77.0% is reached at iteration 8, followed by regressions. Original v4 Figure 1, PDF page 2, rendered from the vector asset.")

AHE improves on the seed by **7.3 percentage points** and on Codex by **5.1 points**. Its advantage is strongest on Medium. On Hard, **53.3%** remains below Codex's **56.7%**. These results demonstrate improvement within the tested optimization campaign. The transfer experiments address performance beyond that task surface.

### Does the frozen harness work on other tasks and models?

The authors froze the evolved harness and evaluated it on SWE-bench-verified without further evolution on that benchmark.

| Configuration | Success rate (↑) | Mean tokens / trial (thousands, ↓) |
| --- | ---: | ---: |
| ACE | 74.6% | 679 |
| TF-GRPO | 74.2% | 582 |
| NexAU₀ | 75.2% | 526 |
| AHE | 75.6% | 461 |

*Source: [v4 Table 2](https://arxiv.org/pdf/2604.25850v4#page=7). The overall row states 500 tasks.*

Against the seed, success improves by **0.4 percentage points** and mean tokens fall by approximately **12.4%**. Tokens include input and output across model calls within a trial. Infrastructure-aborted attempts are excluded from token means but count as failures in success rates. These figures measure task execution rather than the total cost of evolution. The seven repository counts in Table 2 sum to **460**, compared with the overall **500**. Version 4 does not explain the remaining samples, so this article preserves the reported aggregate without recomputing a weighted mean.

For model transfer, the frozen AHE and the seed are compared using each model on the same Terminal-Bench tasks. DeepSeek-V4-Flash moves from **51.7% to 61.8%**, Qwen-3.6-Plus from **56.2% to 62.5%**, and Gemini-3.1-Flash-Lite-Preview from **36.5% to 41.6%**. The harness helps three alternative model families, while the tasks remain those seen during optimization. This evaluation therefore tests model transfer on familiar tasks. The authors also identify coupling between time limits, turn budgets, and reasoning effort. [Section 4.3](https://arxiv.org/html/2604.25850v4#S4.SS3)

### Components: where do gains arise, and how do they interact?

| Evolved component inserted into the seed | Overall pass@1 | Hard |
| --- | ---: | ---: |
| None, NexAU₀ | 69.7% | 51.7% |
| Long-term memory only | 75.3% | 63.3% |
| Tools only | 73.0% | 46.7% |
| Middleware only | 71.9% | 50.0% |
| System prompt only | 67.4% | 46.7% |
| Full AHE | 77.0% | 53.3% |

*Source: [v4 Table 3](https://arxiv.org/pdf/2604.25850v4#page=8). Each row inserts the named component while keeping other components at their seed settings.*

Memory, tools, and middleware each improve the overall result. Swapping the prompt alone causes a regression. Full AHE is best overall but trails the memory-only variant on Hard. The authors trace this to multiple components encouraging overlapping closure checks, consuming the execution budget on long tasks. The comparison provides evidence about this component combination. Additional controls would be needed to quantify the independent contribution of each observability layer.

### Predictions: anticipating fixes is easier than anticipating regressions

Across nine comparable rounds, mean fix precision is **33.7%** and recall **51.4%**, above the reported random baselines of **6.5%** and **10.6%**. Regression prediction reaches only **11.8%** precision and **11.1%** recall, against random baselines of **5.6%** and **5.4%**. The manifest supports targeted fixes while leaving many regressions unanticipated. [Figure 4](https://arxiv.org/html/2604.25850v4#S4.F4)

## 6. Our reflections

### Topic: what is this area studying?

We are interested in how an agent turns one failure into an improvement that executes on a later run. AHE stores experience in persistent tool implementations, middleware, and memory, and uses subsequent execution feedback to decide what to keep. For research agents, an analogous direction is turning evidential requirements into runtime steps and delivery checks. Applying this approach to research workflows would require dedicated experiments.

### Limitations: what remains unresolved?

1. **Optimization performance and independent generalization remain separated.** The headline result selects the best version on all optimization tasks in one campaign. The new-benchmark success gain is small, and denominators and role-level reasoning settings need clarification.
2. **Task flips do not isolate individual edits.** Multiple concurrent changes, few repeats, and component interactions affect the observations. Regression prediction is particularly weak.
3. **Benefits depend on runtime budgets.** Additional checks can help short tasks while consuming opportunities on long ones. Per-task token savings do not account for offline evolution and debugging costs.

### Possible approaches: how could these questions be tested?

1. **Fix development and held-out splits.** Evolve on development tasks, lock the harness, and test on unseen tasks. Repeat full campaigns and disclose sample counts, attempts, and role configurations.
2. **Use paired tests of edits and interactions.** Repeat individual edits and key component combinations from identical initial states on the same tasks. Report fix and regression distributions and assess the stability of attribution.
3. **Include budgets in acceptance criteria.** Compare success, latency, tokens, and evolution costs together. Measure which extra checks justify their cost, and adapt their triggers to task length or remaining budget.

*Based on the [v4 PDF](https://arxiv.org/pdf/2604.25850v4) and the [official repository](https://github.com/china-qijizhifeng/agentic-harness-engineering/tree/182ea06e578df7b1d503eca537503c1e4c5a8a58). The method image is the repository original. The learning curve is rendered from a repository vector file identical to the v4 source. Images follow the repository's [MIT license](https://github.com/china-qijizhifeng/agentic-harness-engineering/blob/182ea06e578df7b1d503eca537503c1e4c5a8a58/LICENSE), Copyright © 2026 Jiahang Lin, with original authorship by Jiahang Lin et al. The source manifest records the manuscript distribution license and repository asset license separately.*
