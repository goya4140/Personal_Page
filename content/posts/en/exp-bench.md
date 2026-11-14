Does a plausible experimental plan, a program that starts successfully, and a reasonable conclusion add up to a completed experiment? EXP-Bench checks these stages separately and then requires them to hold together, exposing the gap between partial competence and complete experimental success.

This article reads **EXP-Bench: Can AI Conduct AI Research Experiments?** by Patrick Tser Jern Kon, Jiachen Liu, and colleagues, using [arXiv v2](https://arxiv.org/abs/2505.24785v2), revised on June 2, 2025. This version is labeled a preprint under review; its scores are a snapshot of the models and frameworks tested then. The [official code and dataset entry point](https://github.com/Just-Curieous/Curie/tree/main/benchmark/exp_bench) provides running instructions, rather than making the paper a current model leaderboard.

## 1. Understanding the field: what counts as completing an experiment?

Suppose we want to know whether a convolutional architecture improves image classification. A researcher must identify comparisons, control data splits and training conditions, implement the architecture, train or evaluate models, record metrics, and determine whether the observed difference answers the question.

Each stage can appear complete without being sound. A plan names models but misses a control variable; a program exits normally without performing the required evaluation; a conclusion points in the right direction but comes from memory or guessing. Checking only the final answer or whether a program starts misses some of these failures.

**Experimental research competence means translating a question into appropriate operations and supporting a conclusion with evidence actually produced by those operations.** It requires scientific judgment alongside data preparation, environment configuration, implementation, and debugging.

Evaluation inherits this difficulty. Requirements are scattered across papers, appendices, configurations, and code, making them hard to turn into standardized tasks. Success also requires several stages to hold together, so separate average scores can overstate complete capability.

## 2. Related work: from executable programs to verifiable research

Three benchmarks clarify different evaluation choices. This comparison follows their original definitions rather than simply adopting the target paper's abbreviated descriptions of prior work.

| Work | Main evaluation target | Relationship and difference |
| --- | --- | --- |
| [ScienceAgentBench](https://arxiv.org/abs/2410.05080v3) | Extract data-driven tasks from real papers, require self-contained Python programs, and assess programs, results, and costs | Emphasizes reliable completion of specific scientific workflow tasks; this paper additionally organizes explicit joint evaluation of design, implementation, execution, and conclusion |
| [MLE-bench](https://arxiv.org/abs/2410.07095v6) | Prepare data, train models, and experiment in Kaggle competitions, using competition performance for comparison | More directly targets predictive or engineering objectives; this paper derives references from research questions and experimental conditions in papers |
| [PaperBench](https://arxiv.org/abs/2504.01848v1) | Provide a research paper, require method implementation and replication experiments, and grade progress through a hierarchical rubric | Also evaluates implementation and execution, potentially across an entire paper; this paper creates experiment-level tasks while hiding the source paper and parts of the code |

PaperBench should therefore not be reduced to checking script execution, and the benchmarks' percentages should not be ranked directly. Their supplied information, task granularity, and success criteria differ. EXP-Bench's distinguishing feature is **extracting many experimental tasks from completed research while retaining both process-level decomposition and strict joint metrics**.

## 3. Research questions: what should this benchmark reveal?

We organize the paper around three reading questions; these are our synthesis rather than verbatim author-defined research questions.

1. **How can papers and code yield experimental tasks with grounded references?** Consolidate scattered objectives, variables, procedures, and conclusions into executable, gradable materials.
2. **How can partial correctness be distinguished from complete success?** Check design, implementation, independent execution, and conclusion together, while restricting shortcuts to original answers.
3. **Where does the experimental chain break?** Compare models and frameworks, then examine stricter scoring, runtime, and common failure patterns.

Here, “end to end” means **the experimental process after a research question and high-level method have been supplied**. Identifying a gap independently, inventing an original research question, and sustaining an open-ended discovery program are not fully covered.

## 4. Method: from research artifacts to joint evaluation

![EXP-Bench inputs and evaluation of design, implementation, execution, and conclusion](../assets/img/blog/exp-bench/overview.png "Figure 1 · The left supplies a question, high-level method, and starter code; the right checks design, code changes, execution, and conclusion. Partial design and implementation credit can coexist with failed execution and an incorrect conclusion. Source: original paper v2, Figure 1, PDF page 1; not redrawn. Click for the full-size image.")

### Step one: extract experiment-level tasks from real papers

The authors select AI papers with public code, using signals such as citations and repository activity to assist filtering. Version 2 contains **51 ICLR / NeurIPS 2024 papers, 461 experimental tasks, and 12,737 individually gradable items**. These items are not additional complete research projects; tasks from one paper can share background and code.

The construction pipeline first applies OCR and multimodal structure extraction to PDFs, retaining tables, figures, and headings. Multiple retrieval passes then turn broad findings into specific questions and recover constraints scattered through appendices and other sections. Outputs include the question, high-level method, and expected outcome.

An implementation extraction agent receives the full codebase and task, locates relevant scripts, and assembles their execution chain. Validated scripts support AST tracing to extract natural-language implementation requirements, supplemented with hyperparameters from configurations and documentation. This connects what the paper reports with how the code performs it.

![Source filtering, task extraction, implementation extraction, and validation](../assets/img/blog/exp-bench/construction.png "Figure 2 · Follow how paper information and code converge into tasks, followed by validation and human checking. Construction agents can inspect full papers and code, unlike evaluated agents with restricted inputs. Source: original paper v2, Figure 4, PDF page 5; not redrawn. Click for the full-size image.")

### Step two: validate references and mask answer materials

For tasks with matched implementations, scripts run in clean containers and outputs are checked, with failures returned for refinement. Tasks without matched implementations receive manual checks that the objective remains faithful to the paper. Lightweight human consistency review finalizes the materials. **It would therefore be inaccurate to describe every task as having passed the same complete execution validation.**

Evaluated agents receive the question, high-level method, masked starter repository, and necessary context; relevant scripts and README files may be removed. Reference designs, implementation requirements, and expected conclusions remain with the evaluator. Repositories are freshly cloned and masked for each agent. [Section 3](https://arxiv.org/html/2505.24785v2#S3).

### Step three: design, implement, execute, and answer

The paper's MogaNet example asks about comparison with existing lightweight models on ImageNet-1K. An agent must complete the experiment from the high-level method, respect model, input, and training conditions, obtain accuracy and efficiency evidence, and derive a comparative conclusion.

![Agent-visible inputs and evaluator-side references in the MogaNet task](../assets/img/blog/exp-bench/task-example.png "Figure 3 · The green area on the left contains the question, high-level method, and starter code; the gray area on the right contains design, implementation, and expected-outcome references. The key is the information boundary: the right side is not part of the agent's visible instructions. Source: original paper v2, Figure 2, PDF page 3; not redrawn. Click for the full-size image.")

Expected submissions include an experimental design, repository code changes, and a conclusion answering the question. These artifacts must be interpreted alongside execution traces: writing the paper's correct conclusion does not establish that the corresponding experiment ran.

### Step four: check stages separately, then require them together

Evaluation combines an **o3-mini automated judge** with a **code execution validator**. A Monitor first checks logs for reading the target paper, using Git to recover other versions, or substituting fabricated, hardcoded, placeholder, or pre-existing repository results for actual experimentation. These benchmark rules address answer leakage and result authenticity.

The judge then awards partial design and implementation credit and checks conclusion semantics. The execution validator runs submitted modifications in a clean, equivalent container, checking executability and expected outputs. This provides evidence distinct from an agent's claim that it ran successfully.

| Metric | Interpretation | Limitation when used alone |
| --- | --- | --- |
| D | Agreement of design variables and conditions with the reference | A sound plan does not establish completion |
| I | Fulfillment of implementation requirements, based on code changes and related evidence | Partially correct implementation may not run |
| C | Semantic correctness of the conclusion against the reference | A guessed conclusion can still be judged correct |
| E | Independent execution validation of submitted code | Executability still requires checking task appropriateness |
| I·E | Joint consideration of implementation correctness and executability | Limits over-crediting based on executability alone |
| All✓ | Full correctness of D, I, and C | Does not yet add independent execution |
| All·E✓ | Adds execution validation to All✓ | Strictest complete-experiment metric, also affected by execution coverage |

The dot follows the paper's joint-metric notation; it does not mean multiplying the reported column averages yields the joint score. Appendix H asks the implementation judge to check required operations individually while accepting functionally equivalent filenames and function names, rather than literal copies of reference code. **This is automated grading plus execution validation, rather than human scientific review of every result.** [Section 4.1](https://arxiv.org/html/2505.24785v2#S4.SS1), [Appendix H](https://arxiv.org/html/2505.24785v2#A8).

## 5. Experimental design and results: from partial credit to complete success

### Main experiment: how many complete tasks succeed?

The main experiment compares seven combinations of **OpenHands (OH) and IterativeAgent (IA)** with o3-mini, Claude 3.7 Sonnet, Claude 3.5 Haiku, Amazon Nova Pro, and DeepSeek R1. Agents run in Ubuntu 24.04 Docker with access to **four NVIDIA A40 GPUs** and a **40-minute agent time limit per task**. The IA configuration aims to reduce early stopping.

The following transcribes v2 Table 1. All values except the final task-count column retain the paper's percentage scale, with higher being better. D and I represent partial correctness; C and strict success metrics have different meanings, so these columns are not interchangeable complete-task success rates.

| Agent | Model | D | I | E | I·E | C | All✓ | All·E✓ | #E |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OH | o3-mini | 18.4 | 20.3 | 15.0 | 2.9 | 21.0 | 1.4 | 0.5 | 420 |
| OH | Claude 3.7 Sonnet | 16.0 | 35.0 | 33.2 | 14.9 | 13.4 | 0.7 | 0.4 | 235 |
| OH | Amazon Nova Pro | 18.2 | 19.5 | 26.8 | 0.0 | 15.7 | 0.0 | 0.0 | 56 |
| OH | Claude 3.5 Haiku | 20.6 | 26.2 | 9.3 | 1.3 | 13.8 | 0.0 | 0.0 | 237 |
| OH | DeepSeek R1 | 6.8 | 10.0 | 0.7 | 0.0 | 2.4 | 0.0 | 0.0 | 140 |
| IA | Claude 3.5 Haiku | 6.4 | 20.6 | 25.2 | 5.4 | 2.2 | 0.0 | 0.0 | 111 |
| IA | Amazon Nova Pro | 0.1 | 10.0 | 18.1 | 0.0 | 0.3 | 0.0 | 0.0 | 215 |

At the complete-task level, **OH + o3-mini reports 0.5% All·E✓, OH + Sonnet reports 0.4%, and the other combinations report 0.0%.** The former reaches only 1.4% All✓. This supports the central observation: partial credit is possible, but correctly connecting all stages and passing execution validation remains rare.

At the component level, Sonnet's I of 35.0 and E of 33.2 exceed o3-mini's, yet its strict joint result is lower. Selecting the strongest system on a single dimension does not automatically yield the most reliable complete experiment. This observation applies to the tested configurations; it does not independently isolate the effects of model, framework, or any particular tool.

**Read “0.5%” alongside #E.** The authors describe main results as averages over 461 tasks, but execution cost limits validation to a subset of traces; Monitor failures are discarded before execution. The configurations have #E values from 56 to 420, so coverage differs. The main text does not fully specify a unified treatment of every unchecked trace in execution-related aggregates. We retain reported values and sample counts rather than inferring exact success counts from rounded percentages or constructing precise confidence intervals. The 0.5% is the best configuration's strict reported value in this table, not a pooled success rate across all models.

These are also not human baseline or best-of-N results. The paper supplies no corresponding human baseline here, preventing a direct conclusion about relative human capability. [Section 4.1 and Table 1, PDF pages 6–7](https://arxiv.org/html/2505.24785v2#S4.SS1).

### Scoring analysis: why does execution push scores toward zero?

![Cost versus time and progressively stricter evaluation criteria](../assets/img/blog/exp-bench/metric-analysis.png "Figure 4 · Left: average runtime and backbone-model token cost. Right: adding conclusion, design, implementation, and execution criteria after the Monitor causes scores to collapse. The right panel displays four OH configurations, and this analysis concerns the execution-checked task subset. Source: original paper v2, Figure 6, PDF page 8; surrounding page content cropped, with both panels, axes, and legends retained. Click for the full-size image.")

Section 4.2 analyzes progressively stricter criteria on execution-checked tasks: the reported average falls from 20.6% for the Monitor criterion to 3.7% after adding design and conclusion, 0.4% after implementation, and 0.2% after execution. **These values reflect that analysis subset and aggregation, unlike the 0.5% for the best individual configuration in Table 1.**

The lesson is that a plausible conclusion may lack a correct design, an implementation may omit necessary components, and executable code may still perform the wrong experiment. Figure 5 also shows lower score variation for joint metrics. This does not establish an unbiased automated judge, however, and a falling joint score alone cannot validate grading accuracy.

The “ablation” here primarily concerns **stricter scoring criteria and cost comparisons**, rather than removing an agent module and retraining or reevaluating it. It cannot establish the causal performance contribution of a particular module. [Section 4.2](https://arxiv.org/html/2505.24785v2#S4.SS2).

### Cost and failure analysis: what does more time accomplish?

The left panel of Figure 6 shows no consistent performance improvement with time or expense. The authors observe early stopping in OH, sometimes without actual experimentation; IA more often consumes its budget without achieving higher complete success. Costs **include only backbone-model input/output tokens, excluding other internal APIs and compute**, so they are not total experiment costs.

Failure analysis extracts 3,238 raw observations from evaluation records and condenses them into 361 failure types. The following selects representative entries from Table 2.

| Stage | Representative error | Reported prevalence (%) | Practical meaning |
| --- | --- | --- | --- |
| Design | Missing or misclassified variables | 16.05 | Failure to distinguish necessary experimental factors from other conditions |
| Implementation | Missing essential components | 39.71 | Omitted retrieval strategies, augmentations, or other required components |
| Execution | Environment or dependency configuration errors | 29.38 | Required environments, frameworks, or libraries unavailable |
| Execution | Script or file errors | 23.84 | Unrecognized model names, missing checkpoints, and similar problems |
| Conclusion | Missing or incomplete content | 26.18 | Required comparisons or quantitative observations absent |
| Conclusion | Incorrect interpretation | 19.66 | Claiming improvement without supporting baseline evidence |

These are reported frequencies in an error taxonomy, rather than independent failure probabilities over 461 tasks. Entries cannot be added into a total failure rate or used for direct cross-stage risk comparisons. The main table does not fully specify raw counts and a common denominator for every category, so it helps locate recurring problems rather than estimate precise risks. [Section 4.3 and Table 2](https://arxiv.org/html/2505.24785v2#S4.SS3).

## 6. Our reflections

### Thinking about the field: what is being studied?

In our view, experimental automation depends on **maintaining correspondence between questions, operations, artifacts, and conclusions**. Sound plans, correct code, successful execution, and credible conclusions each matter, but complete capability depends on their intersection. EXP-Bench offers a task structure for diagnosing that intersection.

It also encourages separating replication of known experiments from exploration of unknown questions. The former has references and supports diagnosis; the latter involves choosing objectives, interpreting negative results, and changing direction. Evaluating these stages separately is more informative than describing autonomous research through one score.

### Thinking about limitations: what remains unresolved?

**First, task representativeness is limited.** Tasks come from existing, relatively visible AI papers with code. Long-term exploration, autonomous question selection, research without mature implementations, and experiments in other sciences receive less coverage. Tasks from the same paper are also correlated.

**Second, references and judges need auditing.** Models extract tasks with lightweight human checks, while validation differs between tasks with and without matched executable implementations. D, I, and C rely on automated judgment. Even when the implementation judge accepts equivalent solutions, reference pathways may influence grading, and semantic agreement does not establish that a conclusion follows from this run's evidence.

**Third, success statistics and resource conditions need greater transparency.** Unequal execution coverage, bounded task budgets, and incomplete cost accounting affect comparisons. Near-zero scores expose difficulties but make precise system comparisons hard without consistent denominators, repeated runs, and uncertainty reporting.

### Thinking about solutions: what directions could address them?

The following are our research proposals, rather than effects already demonstrated by the paper.

**For representativeness:** split training and evaluation by source paper rather than only by task, and add newer research, non-public answers, and tasks without mature scripts. Separately evaluate long-horizon question selection and route changes, reporting known-experiment and open-exploration capabilities independently.

**For reference and judge quality:** label each task's validation strength, have experts audit multiple valid implementations, and report agreement between automated scores and human review. Attach run identifiers, logs, metric files, and generating scripts to conclusions so grading can trace evidence to actual experiments.

**For statistics and resources:** fix a common executable subset and publish metric denominators, exclusion reasons, and success counts. Repeat runs under matched budgets, account for source-paper correlations, and report complete success, stage scores, and total costs including GPUs. This would clarify whether improvements arise from scientific design, software reliability, or additional resources.

Paper and materials: [v2 PDF](https://arxiv.org/pdf/2505.24785v2). Original Figures 1, 2, 4, and 6 are used; Figure 6 only removes surrounding page content, and the others are not redrawn. arXiv lists [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). The illustration provenance record stores sources, pages, dimensions, and checksums.
