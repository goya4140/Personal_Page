After an agent launches a search, test, or tool call, it often waits for the result. The main reasoning loop pauses even though its plan may contain unchecked assumptions, forgotten constraints, or unprepared contingencies. Second Thought uses that interval to run additional reasoning with the same model, delivering completed short suggestions to the next turn.

This article reads Zhensu Sun, Chengran Yang, and colleagues' **Second Thought: Reasoning in Parallel as LLM Agents Act and Observe**, using [arXiv v1](https://arxiv.org/abs/2608.13667v1), submitted on August 13, 2026. It is a training-free inference framework. Its effects need to be understood through separate measurements of task success, main-thread decoding, elapsed time, and total cost.

## 1. Topic: what can agents do while waiting?

A typical ReAct loop reasons, generates an action or its tool arguments, receives feedback, and proceeds to the next turn. Additional reasoning can help check a plan but may slow every interaction. Overlapping some checks with tool execution creates an opportunity to reduce later deliberation or retries after failure.

This arrangement has a constraint. Before the tool returns, auxiliary reasoning can use only the existing history and the plan just formed. A suggestion such as switching to symbol lookup if a search fails needs to be checked against the actual result on the next turn. Time is another constraint. The tool can return at any moment, so auxiliary generation must be interruptible.

## 2. Related work: when should extra reasoning happen?

| Work | Main idea | Connection to this paper |
| --- | --- | --- |
| [ReAct](https://arxiv.org/abs/2210.03629) | Alternates reasoning, actions, and observations | Supplies the execution loop modified here |
| [s1](https://arxiv.org/abs/2501.19393) | Uses budget forcing to extend or limit deliberation | Adapted here as a sequential extra-reasoning budget control |
| [Sleep-time Compute](https://arxiv.org/abs/2504.13171) | Precomputes over context before a user query arrives | Also studies reasoning timing, while this paper uses action–observation windows within agent turns |

Second Thought forks after the main thread finishes its current reasoning. Four branches offer suggestions. When the environment returns, completed suggestions are collected, and the next turn uses them alongside the actual feedback.

## 3. Research questions: can parallel deliberation improve interaction efficiency?

We organize the paper around three questions.

1. **How much useful reasoning can be generated during the wait?** Branches need the current state and must leave complete outputs at an unpredictable deadline.
2. **Does this help the full task?** Compare success, turns, and main-thread tokens with the original agent and a sequential control with similar extra reasoning budget.
3. **Do fewer decoded tokens translate into lower elapsed time?** Examine contention, context-read costs, branch contributions, and the waiting patterns of different tasks.

## 4. Method: fork after reasoning and harvest when the tool returns

![Main-thread and auxiliary-branch timeline](../assets/img/blog/second-thought/workflow.png "Figure 1 · The main thread generates an action and awaits feedback while four auxiliary branches reason within that window. Completed suggestions are merged when the observation arrives and used on the next turn. Original Figure 2, PDF page 3, rendered from the vector asset.")

### Step 1. Copy the context when the current Thought finishes

Once the main thread finishes its reasoning, the framework immediately launches four branches. They receive the same history and newly completed reasoning, followed by branch-specific instructions. Forking precedes completion of action generation, so the window covers both action serialization and tool execution.

Branches use the same base model and disable native thinking mode to stream suggestions directly. Their common context prefix permits cache reuse. Each branch still reads context and generates output, which the cost analysis includes. [Method](https://arxiv.org/html/2608.13667v1#Sx3)

### Step 2. Supplement the current plan in four directions

| Branch | What it considers | Example purpose |
| --- | --- | --- |
| Check | Fragile assumptions in the current plan | Flag that the project's test framework has not been confirmed |
| Recall | Historical requirements that still apply | Resurface a backward-compatibility constraint |
| Rehearse | Next steps conditional on possible results | Prepare a fallback if the search returns no matches |
| Alternative | Other strategies if the current one fails | Identify when to switch approaches |

These are complementary perspectives on one task trajectory. The branches issue no new environment actions, and the main thread carries out the current action. Their value is in reducing repeated derivation, forgotten constraints, or delayed strategy changes on later turns.

### Step 3. Emit interruptible atomic thoughts

Each suggestion is enclosed in `<thought>…</thought>`, contains a single local point, uses at most 25 words, and avoids dependence on other suggestions. A branch interrupted mid-generation still leaves its earlier closed units independently readable.

When the observation arrives, the framework cancels ongoing branches and truncates each buffer at its last closed tag. It keeps at most five units per direction and skips branches with no completed unit. This preserves parseable output structure. Whether a suggestion is correct still depends on the actual feedback.

### Step 4. Append the suggestions to the tool observation

Collected units are appended to the tool message. The next turn reads the preceding reasoning, action, actual observation, and auxiliary suggestions in order. The main loop does not wait for every branch to finish.

In the paper's illustrative bug-fixing example, Recall resurfaces a compatibility constraint while Rehearse prepares a fallback search. This explains how auxiliary advice could reduce rework. Full-task experiments test the overall effect.

## 5. Experiments and results: full-task performance first

### Main evaluation: nine model–benchmark combinations

The paper tests three model families, DeepSeek-V4-Flash, Qwen3.6-Plus, and MiniMax-M3, with native reasoning enabled on the main thread. Tasks cover three environments.

- **SWE-Bench Pro** uses 150 randomly sampled repository-repair tasks with mini-SWE-agent, a 100-turn limit, and held-out tests.
- **Terminal-Bench 2.1** uses 89 terminal tasks evaluated by task-specific scripts.
- **τ³-bench banking** is described as 97 tasks with a simulated user, tool-based retrieval of policy documents, and responses grounded in those policies.

The table reproduces the base versus four-branch comparisons from Table 1. Higher success is better. Lower main-thread output and fewer turns generally favor efficiency. Main-thread tokens exclude the auxiliary branches' full overhead.

| Benchmark / model | Pass@1, base → method | Mean main-thread output tokens, base → method | Mean turns, base → method |
| --- | ---: | ---: | ---: |
| SWE-Pro / DeepSeek | 48.7% → 52.0% | 23,841 → 20,255 | 56.2 → 52.8 |
| SWE-Pro / Qwen | 52.0% → 51.3% | 36,519 → 20,798 | 57.1 → 50.6 |
| SWE-Pro / MiniMax | 55.3% → 55.3% | 15,400 → 14,579 | 79.6 → 71.9 |
| Terminal / DeepSeek | 50.6% → 52.8% | 48,202 → 32,892 | 40.2 → 35.8 |
| Terminal / Qwen | 39.3% → 51.7% | 25,158 → 31,396 | 25.5 → 24.0 |
| Terminal / MiniMax | 49.4% → 59.6% | 36,686 → 36,705 | 44.6 → 43.1 |
| τ³ / DeepSeek | 24.0% → 24.0% | 16,260 → 15,203 | 27.5 → 26.3 |
| τ³ / Qwen | 16.7% → 19.8% | 16,755 → 13,764 | 26.1 → 25.9 |
| τ³ / MiniMax | 17.7% → 20.8% | 10,004 → 10,367 | 24.0 → 20.0 |

*Source: [Table 1, PDF page 5](https://arxiv.org/pdf/2608.13667v1#page=5). Success uses a BH-corrected McNemar test, and the other metrics use paired Wilcoxon tests. The full values appear here, with significance discussed below.*

Mean turns fall in all nine pairs, significantly in five. Main-thread tokens fall in six, significantly in four. Success differences are not significant in seven pairs. The other two improve significantly, by **12.4 percentage points** for Qwen and **10.2 points** for MiniMax on Terminal. Nonsignificance does not establish strict equivalence.

The largest main-thread token reduction is approximately **43%**, for Qwen on SWE-Pro. Qwen on Terminal instead increases main-thread output by approximately **24.8%** while improving success. Auxiliary advice can substitute for later deliberation or open useful additional lines of reasoning.

### Can a similar extra budget spent sequentially achieve the same outcome?

The authors adapt s1 budget forcing so that the main thread continues reasoning when it would otherwise end its Thought, reaching a budget corresponding to the auxiliary branches. In the four model–benchmark combinations where this control runs, Second Thought attains higher success and uses fewer main-thread tokens.

For Qwen on SWE-Pro, s1 produces **48.7% / 65,634 tokens**, compared with **51.3% / 20,798 tokens** for Second Thought. On Terminal, s1 gives **46.1% / 40,642 tokens**, compared with **51.7% / 31,396 tokens**. MiniMax does not support the required prefix continuation, and the control is incompatible with τ³ function calls. Those settings therefore lack s1 results. The comparison supports this parallel organization, while leaving the contributions of scheduling and the four prompt types partly coupled.

### Elapsed time: a 10.9% reduction in paired replay

The main experiments call APIs at different times, with drifting serving speed and server load. The authors separately replay **50 SWE-Pro tasks with DeepSeek-V4-Flash**. For each task, configurations run back-to-back, concurrency is fixed at four, and the protocol is repeated three times with medians reported.

Median per-task time falls from **256.9 to 229.0 seconds, a 10.9% reduction**. Main-thread decoding time falls from **168.7 to 146.1 seconds**, and tool execution time from **71.6 to 67.3 seconds**. Main-thread throughput also falls from **141.3 to 138.6 tokens/s**, approximately 1.9%, showing contention. This provides elapsed-time evidence on one model and subset. The 43% token reduction alone cannot establish a general 43% speedup. [In-depth analysis, PDF page 6](https://arxiv.org/pdf/2608.13667v1#page=6)

### Branches and windows: more output need not be more useful

![Single-branch and leave-one-out ablations](../assets/img/blog/second-thought/ablation.png "Figure 2 · On SWE-Pro with DeepSeek, the horizontal axis is main-thread output and the vertical axis is success. Upper-left is better. All four branches provide a useful trade-off; Recall alone uses fewer tokens but loses accuracy. Original Figure 3, PDF page 6, rendered without redrawing.")

Recall alone reaches **46.0% / 19.7k tokens**, compared with **52.0% / 20.3k** for the full method. Removing Recall gives **48.0%**. Removing Rehearse preserves **52.0%** but raises output to **22.4k**. These comparisons use one model and task set and suggest different roles for constraint recall and next-step rehearsal.

Table 2 further tests context and the stopping deadline. Removing the just-completed reasoning produces more units but lowers success from **52.0% to 49.3%**. Waiting for branches to finish after the tool returns raises success to **56.7%** and sequential decoding to **48.4k tokens**. This exposes an effectiveness–waiting-budget trade-off without establishing a universal optimal window.

### Total cost: auxiliary branches still incur charges

| SWE-Pro model | Base USD / task | Four branches USD / task | Reported increase |
| --- | ---: | ---: | ---: |
| DeepSeek-V4-Flash | 0.015 | 0.025 | +66.4% |
| Qwen3.6-Plus | 0.514 | 1.297 | +152.2% |
| MiniMax-M3 | 0.159 | 0.448 | +181.5% |

*Source: [Table 3, PDF page 7](https://arxiv.org/pdf/2608.13667v1#page=7), using the providers' July 1, 2026 prices selected by the authors. Dollar amounts are rounded, and percentage increases follow the original table.*

Additional context reads and provider-specific cache discounts dominate the cost difference. Keeping only Alternative reduces the reported added cost to **16.3%–35.5%**. The branch ablation also shows that fewer branches change the success–output trade-off. Deployment therefore needs to assess total charges, concurrency limits, and serving load alongside savings in sequential decoding and turns.

## 6. Our reflections

### Topic: what is this area studying?

The paper makes reasoning timing part of agent design. A model can resurface constraints and prepare contingencies while waiting, then combine them with actual results on the next turn. Research agents may have similar windows during retrieval or experiments. Their advice needs to preserve the conditions that remain subject to confirmation.

### Limitations: what remains unresolved?

1. **Elapsed-time gains depend on serving conditions.** Direct timing covers one model on a 50-task subset. Parallel decoding already reduces throughput, and short tool calls leave less room for useful work.
2. **Additional advice brings cost and potentially incorrect premises.** Branches reason before the real result arrives. Closed tags guarantee structure, while fixed branch types can add redundant advice and context reads.
3. **Controls have limited coverage.** s1 runs in four settings, and branch and window studies concentrate on one model and benchmark. Nonsignificant success differences also require more repeats to characterize their range.

### Possible approaches: how could these questions be tested?

1. **Measure across serving loads and tool latencies.** Report success, latency quantiles, and total charges together, including high concurrency. Measure time directly rather than substituting token counts.
2. **Select branches by window length and information value.** Estimate the wait, decide whether and how many branches to launch, keep conditional advice distinct from verified facts, and measure errors caused by adopting incorrect forecasts.
3. **Extend paired budget controls.** Hold prompt content fixed when comparing sequential and parallel execution, add independent repeats and more tasks, and test whether advice produced during scientific experiments reduces rework.

*Based on the [v1 PDF](https://arxiv.org/pdf/2608.13667v1) and its source files. Original Figures 2 and 3 are attributed to Zhensu Sun, Chengran Yang, Yunbo Lyu, Jieke Shi, and David Lo and rendered without redrawing. The manuscript uses the arXiv non-exclusive distribution license; original figure rights remain with the authors. The asset manifest records sources and hashes. The paper's [code link](https://anonymous.4open.science/r/2nd-thought) required authentication during this reading, so methods and numbers were checked against the paper and its source files.*
