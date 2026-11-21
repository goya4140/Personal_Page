An agent evaluation can involve reading files, editing code, running tests, and revising repeatedly. Even when the final score is just success or failure, the intervening calls can be costly. EarlyEval predicts that final outcome from behavior already observed, stops the run when a threshold is reached, and uses the predicted score to estimate agent performance.

This article reads Yuling Shi, Zhensu Sun, and colleagues' **EarlyEval: Cheaper Agent Evaluation via Early Outcome Prediction**, based on [arXiv v1](https://arxiv.org/abs/2609.02783v1), submitted on September 2, 2026. A run credited with early predicted success has not yet produced the evidence that full execution would provide.

## 1. Topic: reducing evaluation costs for long-running agents

Agent developers repeatedly compare prompts, tools, harnesses, and models. Rerunning every task to completion after each edit makes evaluation costs accumulate across iterations. Long traces also incur growing context costs because later calls can carry more history.

Full execution reveals the final files, environment state, and actual test results. Lower-cost estimation asks which runs already provide enough signal to predict their outcomes reliably. It must also measure how removing later steps changes success rates and rankings. This area studies the cost and credibility of evaluation estimates.

## 2. Related work: reducing tasks and reducing per-task execution

| Work | Existing approach | Connection to EarlyEval |
| --- | --- | --- |
| [tinyBenchmarks](https://arxiv.org/abs/2402.14992) | Estimates performance on large benchmarks from representative samples | Reduces cost through task selection, while EarlyEval studies shorter execution of retained tasks |
| [SWE-bench](https://arxiv.org/abs/2310.06770) | Evaluates patches with repository issues and executable tests | Provides full-run outcomes, with reference patches available in the Verified subset |
| [Terminal-Bench](https://arxiv.org/abs/2601.11868) | Evaluates multi-step tasks in terminal environments | Tests whether behavioral signals support early stopping without reference-solution features |

EarlyEval trains on completed trajectories from other agents on the same benchmark. It targets settings with historical evaluation records and repeated comparisons of new configurations. The first evaluation of a new benchmark still needs completed runs and true labels.

## 3. Research questions: which conclusions survive reduced execution?

The paper organizes its evaluation around four questions.

1. **Can it predict outcomes for an unseen agent configuration while saving steps and tokens?**
2. **How much does stopping change each agent's success rate, and are rankings preserved?**
3. **Does the method remain effective without reference solutions or particular features?**
4. **How does a lightweight tree model compare with other classifiers and LLM judges in cost and fidelity?**

An unseen agent here is a configuration combining a harness and base model. Evaluation mainly tests new configurations on the same benchmark, whose tasks can still appear in other agents' historical trajectories.

## 4. Method: learn from historical prefixes and predict at each step

![Full execution compared with EarlyEval](../assets/img/blog/earlyeval/motivation.png "Figure 1 · Conventional evaluation scores a completed run. EarlyEval predicts from a partial trace and removes subsequent execution, including behaviors that have not been observed. Original Figure 1, PDF page 1, rendered from the vector figure.")

### Step 1. Expand completed runs into prefixes with final labels

Historical trajectories contain actions, observations, and final success or failure labels. The authors discard runs shorter than ten steps and expand a run of length T into prefixes from step 0 through T. Every prefix learns the final outcome of that run.

An early prefix containing repeated errors can therefore have a success label if the run eventually succeeds. Each prefix receives weight 1/(T+1), giving long and short trajectories equal total training weight. [Sections III-C–D](https://arxiv.org/html/2609.02783v1#S3.SS3)

![Offline training and stepwise inference in EarlyEval](../assets/img/blog/earlyeval/overview.png "Figure 2 · The upper stage extracts behavioral, textual, and optional reference features from historical prefixes. The lower stage scores success and failure at each step and continues while the thresholds are unmet. Original Figure 2, PDF page 5, rendered from the vector figure.")

### Step 2. Extract features available at the current step

Behavioral features include tool calls, edits, tests, event timing, repeated actions, read-only streaks, error types, and changes in test results. Separate textual blocks encode the task, accumulated and latest actions, and accumulated and latest feedback. TF-IDF and SVD compress them into low-dimensional vectors.

On SWE-bench Verified, reference-patch attributes and overlaps with reference files, symbols, and test names are also available to the evaluator. TerminalBench and Toolathlon disable this feature family. The information available therefore depends on the benchmark. A reference-assisted configuration requires a separate assessment before use as a general completion monitor for open tasks. [Table II](https://arxiv.org/pdf/2609.02783v1#page=4)

### Step 3. Train success and failure LightGBM classifiers

Two classifiers target eventual success and failure, respectively. Training and validation are organized by task, keeping all prefixes from one trajectory on the same side. Each fold reserves approximately 15% of training trajectories for early stopping and Platt calibration. Hyperparameters are fixed across benchmarks, and experiments use random seed 42.

Platt scaling maps tree scores onto a probability scale. Empirical reliability must still be measured on the runs actually stopped. A threshold of 0.95 does not automatically establish an observed accuracy of exactly 95%. The paper reports sub-millisecond tree inference on one CPU core. This describes classifier scoring. Full feature processing and deployment costs need their own measurements. [Sections III-D–E and IV-D](https://arxiv.org/html/2609.02783v1#S3.SS4)

### Step 4. Record a prediction when a threshold is crossed

After every step, the framework scores success and failure. If either reaches its threshold, execution stops and the predicted label becomes the task score. Otherwise the run continues, retaining its true outcome if it reaches completion. Higher thresholds generally intervene less, while lower thresholds allow earlier stopping with more mistakes.

An early success score predicts that a full run would succeed. The omitted steps have yet to produce their evidence. The authors position the method as low-cost feedback for development and recommend full execution for final canonical scores. [Section VIII](https://arxiv.org/html/2609.02783v1#S8)

## 5. Experiments and results: savings and score distortion

### Main setup: hold out agent configurations and compare with completed outcomes

The authors collect **21,678 historical trajectories** across three benchmarks.

| Benchmark | Tasks | Agent configurations | Collected trajectories | Reference features |
| --- | ---: | ---: | ---: | --- |
| SWE-bench Verified | 500 | 16 | 7,805 | Available |
| TerminalBench | 89 | 37 | 6,757 | Disabled |
| Toolathlon | 108 | 22 | 7,116 | Disabled |

*Source: [Section IV-A](https://arxiv.org/html/2609.02783v1#S4.SS1). These are collection counts. The method separately states that runs shorter than ten steps are discarded. Configurations combine harnesses and models, with different trajectory and repetition counts across benchmarks.*

Leave-one-agent-out evaluation holds one configuration out for testing and trains on the others. TerminalBench additionally removes training trajectories sharing either the held-out model or the held-out harness, in separate settings. SWE-bench Verified and Toolathlon each use one fixed harness, so they mainly test changes in model configuration.

Metric denominators matter. Coverage is the fraction of all trajectories stopped early. Accuracy is the fraction of stopped trajectories predicted correctly. A success or failure head's precision considers only trajectories that this head stops and labels. Mean absolute success-rate deviation first computes each agent's percentage-point difference from full evaluation, then averages the absolute differences.

### Main results: trading execution savings against score error

The table selects the authors' recommended thresholds from Table III, using both heads. For readability, negative resource changes are shown as positive reductions.

| Benchmark and holdout | Threshold | Step reduction | Input-token reduction | Output-token reduction | Mean absolute success-rate deviation |
| --- | ---: | ---: | ---: | ---: | ---: |
| SWE-bench Verified | 0.95 | 26.0% | 32.7% | 28.7% | 1.1 percentage points |
| TerminalBench, no same model | 0.90 | 25.4% | 42.7% | 27.9% | 2.1 percentage points |
| TerminalBench, no same harness | 0.85 | 17.7% | 29.2% | 17.4% | 2.0 percentage points |
| Toolathlon | 0.90 | 23.0% | 44.1% | 29.4% | 0.9 percentage points |

*Source: [Table III, PDF page 8](https://arxiv.org/pdf/2609.02783v1#page=8). Different benchmarks use different thresholds, so these savings and errors do not describe one universal setting.*

![Complete resource and scoring results across thresholds](../assets/img/blog/earlyeval/threshold-results.png "Figure 3 · The original table includes success-only, failure-only, and dual-head policies. Negative step and token changes indicate reductions. Success-rate deviations are interpreted in percentage points. Original Table III, PDF page 8, cropped with all rows and headers retained.")

At the recommended SWE-bench Verified point, **34.8%** of trajectories stop early, with **95.0%** accuracy on those stopped runs. The heads' individual precision is **93.9%** for success and **96.7%** for failure. Approximately a quarter of steps are removed, with some individual outcomes still misclassified. A small average score deviation cannot guarantee small error for every agent.

Threshold choice matters. Lowering it from **0.95 to 0.75** on this benchmark increases step reduction from **26.0% to 63.4%**, while mean absolute deviation rises from **1.1 to 4.1 percentage points**. The paper selects operating points around a two-point average-error tolerance. Deployment needs independent validation to set an acceptable error budget.

The evaluation starts from collected full trajectories and measures the steps and tokens omitted by stopping at a prefix. These percentages do not directly establish equal dollar savings. Cached input pricing, output rates, tool runtime, predictor training, and monitoring affect the bill. The paper primarily reports compute proxies and leaves matched end-to-end online billing measurements open.

### Ranking fidelity: strong global correlation with some position changes

The ranking analysis in Table IV changes the policy. SWE-bench uses both heads, while the other benchmarks rely on the more trustworthy failure head.

| Setting | Ranking policy | Spearman ρ (↑) | Agents with unchanged rank | Step reduction |
| --- | --- | ---: | ---: | ---: |
| SWE-bench Verified, 0.95 | Dual | 0.991 | 81% | 26.0% |
| TerminalBench, no same model, 0.90 | Failure only | 0.959 | 59% | 24.6% |
| TerminalBench, no same harness, 0.85 | Failure only | 0.994 | 70% | 12.7% |
| Toolathlon, 0.90 | Failure only | 0.994 | 70% | 23.0% |

*Source: [Table IV and Section V-B](https://arxiv.org/pdf/2609.02783v1#page=8). Some savings use failure-only policies and should be interpreted separately from the preceding dual-head table.*

A correlation near 1 indicates a similar overall ordering. Exact positions are preserved for 59%–81% of agents, leaving others with changed ranks. In the no-same-model TerminalBench setting, OpenHands + Claude-Opus-4.5 shifts by **−4.6 percentage points** in success rate. This illustrates why average errors still require per-agent checks. [Table IV](https://arxiv.org/pdf/2609.02783v1#page=8)

### Feature and model ablations: behavioral signals contribute most

Variants are retrained on SWE-bench Verified under the same holdout protocol.

| Feature set | Coverage | Accuracy on stopped runs | Step reduction | Mean absolute success-rate deviation |
| --- | ---: | ---: | ---: | ---: |
| Full | 34.8% | 95.0% | 26.0% | 1.1 percentage points |
| Without behavioral features | 23.4% | 94.7% | 16.4% | 0.8 percentage points |
| Without textual features | 35.9% | 94.5% | 26.5% | 1.2 percentage points |
| Without reference features | 32.1% | 93.9% | 24.7% | 1.2 percentage points |

*Source: [Table V](https://arxiv.org/pdf/2609.02783v1#page=9).*

Removing behavior mainly reduces coverage and savings. Removing reference features retains most of the benefit, supporting the use of behavioral evidence. This ablation concerns the SWE-bench distribution. Success prediction remains weaker on unseen harnesses and must be read alongside the holdout results.

Architecture comparisons retain both heads and calibrate at the same **0.95** threshold. LightGBM achieves **34.8% coverage, 95.0% accuracy, and 26.0% step reduction**. MLP achieves **26.9%, 87.9%, and 20.0%**. A fine-tuned Qwen-0.5B judge reaches **18.7%, 90.7%, and 17.9%**. Qwen has a lower absolute score deviation, **0.8 points** against LightGBM's **1.1**, while intervening less and saving fewer steps. This supports the tree model's combined performance under the tested features and thresholds. It does not independently isolate the benefit of two heads over one classifier. [Table VI](https://arxiv.org/pdf/2609.02783v1#page=9)

## 6. Our reflections

### Topic: what is this area studying?

We are interested in how much actual execution is needed for a credible comparison during development. EarlyEval turns historical traces into an evaluator and explicitly connects estimation error with execution cost. For research agents, a similar approach might estimate failure risk in repeated experimental workflows. Open research often lacks a stable binary endpoint, requiring new labels and a definition of misclassification costs.

### Limitations: what remains unresolved?

1. **Generalization depends on historical distributions.** A held-out agent's tasks can still appear in other configurations' training traces. Joint transfer to new tasks, harnesses, and benchmarks remains insufficiently measured.
2. **Individual mistakes can redirect development.** Opposite errors can cancel in aggregate scores. Low mean deviation and high rank correlation cannot ensure that an edit's benefit is measured correctly.
3. **Prefix-based savings and net operational costs differ.** Collecting initial trajectories, extracting features, training, and online integration require resources. Repeated optimization might also adapt to the predictor.

### Possible approaches: how could these questions be tested?

1. **Hold out tasks, harnesses, and time together.** Calibrate on an independent development set, then test new tasks and later agent versions while tracking changes in accuracy and coverage.
2. **Report paired-comparison errors.** Compare configurations before and after edits on identical tasks, separate false successes from false failures, and preserve more full executions when scores are close.
3. **Measure actual net savings.** Deploy online monitoring and include end-to-end latency, cached-token billing, tool costs, and amortized training. Periodically sample full runs to detect systematic prediction bias.

*Based on the [v1 PDF](https://arxiv.org/pdf/2609.02783v1) and [official project](https://github.com/inphotoo/earlyeval). Original Figures 1–2 are rendered from vector assets. The threshold table is cropped from PDF Table III with its data and headers retained. No figure is redrawn. Attribution to Yuling Shi et al. under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*
