Understanding a method, writing its code, and obtaining experimental results are three different capabilities. PaperBench asks whether AI can connect them to replicate a machine learning paper. Two aspects deserve particular attention: how it measures progress on complex research tasks, and where its experiments show research agents getting stuck.

This reading follows [arXiv v3, dated April 7, 2025](https://arxiv.org/abs/2504.01848v3). Model names and scores below refer to the experimental settings reported at that time.

## 1. Topic: how can we assess AI's ability to execute research?

Suppose we give an AI a machine learning paper and ask it to replicate the work independently. It must identify the main contributions, resolve implementation details, prepare data, train models, troubleshoot errors, and decide whether its results support the paper's conclusions.

These activities depend on one another. Training may run even when data processing is wrong. Executable code may use settings that depart from the paper. A generated results table does not establish that its numbers came from real experiments.

Research-agent evaluation therefore needs to answer two questions:

- **What did the agent complete?** We need to inspect code, execution records, and experimental artifacts.
- **Can it keep making progress?** When problems arise, can it use feedback to revise its approach and finish the task?

Replication offers a relatively well-defined setting: target results already exist, so we can examine whether an AI can independently reach them.

## 2. Related work: what did earlier evaluations cover?

Three earlier studies help locate this paper.

| Work | Main task | Difference from independent replication starting with a paper |
| --- | --- | --- |
| [CORE-Bench](https://arxiv.org/abs/2409.11363v1) | Reproduce research results using supplied code and data | Focuses on using and executing existing research code |
| [MLE-bench](https://arxiv.org/abs/2410.07095) | Complete Kaggle machine learning competitions | Focuses on data preparation, modeling, and experimental optimization |
| [RE-Bench](https://arxiv.org/abs/2411.15114v1) | Solve open-ended machine learning research engineering tasks | Focuses on solving particular research engineering problems |

PaperBench starts from the paper, requires a codebase built from scratch, and checks the main empirical contributions. This introduces another difficulty: **a paper contains several connected objectives, so a single prediction accuracy cannot summarize how much has been completed.** [Related work in the paper](https://arxiv.org/html/2504.01848v3#S6)

## 3. Research questions: what must this paper resolve?

We organize the paper around three questions. These are our reading synthesis, rather than research questions quoted from the authors.

1. **How should we define progress toward replication?** An all-or-nothing judgment is too coarse; intermediate progress needs to be recognized.
2. **How can implementation, execution, and reproduced results be distinguished?** Plausible code establishes only part of the work; execution evidence is also needed.
3. **How can submissions be graded reliably at scale, and capability bottlenecks identified?** Expert review is expensive, while automated grading requires its own validation.

This is an **evaluation-method paper**. Its main contribution is a set of tasks, grading criteria, and a verification workflow. The evaluated agent implementations primarily provide initial baselines.

## 4. Method: following the evaluation workflow

![PaperBench workflow from code submission through independent execution to grading](../assets/img/blog/paperbench/overview.png "Figure 1. Evaluation workflow: submit a codebase, execute it in a fresh environment, then assess it against a rubric. The illustrated 34.7% is a workflow example, not a main experimental result. Source: original Figure 1, PDF page 2; only surrounding page material was cropped. Click to enlarge.")

### Step 1: provide a paper and require a complete replication codebase

The task input includes the paper and an addendum of clarifications. Agents can browse the web, install dependencies, and run experiments. They cannot view or use the paper authors' original repository or other replication resources included in the blacklist.

The final submission must contain `reproduce.sh`, the common entry point for executing the replication experiments.

One important decision is that **the agent cannot see the detailed grading rubric and must infer which contributions to replicate from the paper.** The addendum clarifies missing or ambiguous details.

### Step 2: decompose replication into checkable requirements

The benchmark authors work with the original paper authors to decompose the main contributions into a rubric tree.

![Rubric tree showing task decomposition and aggregation of leaf scores](../assets/img/blog/paperbench/rubric.png "Figure 2. Hierarchical rubric. Leaves receive binary pass/fail scores; each parent's score is the weighted average of its children, propagated upward. The example yields 55%. Source: original Figure 2, PDF page 3; only surrounding page material was cropped. Click to enlarge.")

For example, a contribution can be decomposed into implementing a model, completing specified training, running the corresponding evaluation, and obtaining results that support the conclusion.

Across 20 papers, there are **8,316 leaf requirements**. Weights reflect contributions' relative importance, rather than implementation difficulty. The Replication Score therefore measures **the weighted extent to which requirements are satisfied**; the headline metric then averages scores across papers.

**A replication score of 21.0% does not mean that 21% of the papers were fully replicated.**

### Step 3: execute the submission again in a fresh environment

After submission, the evaluation system copies the code into a fresh environment, runs `reproduce.sh`, and collects logs and output files. This checks whether the submission can independently generate results and reduces reliance on the agent's claims and files left over from development.

Requirements are divided into three types:

| Type | Question checked |
| --- | --- |
| Code Development | Has the corresponding functionality been implemented? |
| Execution | Has the required experiment actually been executed? |
| Result Match | Do execution artifacts support the corresponding result in the paper? |

This distinction awards partial credit while preserving the difference between implementation and empirical evidence. Submissions without `reproduce.sh` receive zero on all Execution and Result Match requirements.

Independent execution strengthens credibility, but scripts, logs, and outputs still need consistency checks. Rerunning a submission alone does not establish that every result is valid.

### Step 4: assess requirements with an automated judge

For each leaf requirement, SimpleJudge retrieves relevant submission files and decides whether the requirement is satisfied. The authors also build **JudgeEval**, using expert labels to assess automated grading quality.

We see this as an important layer of the method: **research-capability assessment depends on a judge, and that judge needs independent evaluation too.** [Method and grading details](https://arxiv.org/html/2504.01848v3#S2)

## 5. Experimental design and results

### Main evaluation: performance on complete replication tasks

The dataset contains 20 ICML 2024 Spotlight or Oral papers across 12 topics. The main experiment uses BasicAgent with command execution, Python, a browser, and other tools, plus a single A10 GPU. Each model receives three runs per paper and a maximum agent runtime of 12 hours. The independent reproduction phase has a separate 12-hour limit.

The main metric is the average weighted Replication Score across papers; higher is better.

| Model + BasicAgent | Average Replication Score |
| --- | ---: |
| Claude 3.5 Sonnet (New) | **21.0 ± 0.8%** |
| o1-high | 13.2 ± 0.3% |
| DeepSeek-R1 | 6.0 ± 0.3% |
| GPT-4o | 4.1 ± 0.1% |
| Gemini 2.0 Flash | 3.2 ± 0.2% |
| o3-mini-high | 2.6 ± 0.2% |

*Source: original Table 4. The ± values are standard errors of the mean, not confidence intervals or the range of difficulty across papers. Results apply to the particular model versions and execution settings in the paper.*

The tested systems complete some replication work, but remain far from full replication. Inspecting selected trajectories, the authors find that most models tend to finish early: sometimes claiming completion, and sometimes stopping after encountering difficulties.

Our interpretation is that **generating a plan and continuously executing it in response to experimental feedback remain different capabilities.** [Main experiment](https://arxiv.org/html/2504.01848v3#S5)

### Results by requirement type: where does progress stop?

The paper's Table 9 separates performance by requirement type. Selected results are:

| System | Code Development | Execution | Result Match |
| --- | ---: | ---: | ---: |
| Claude 3.5 Sonnet + BasicAgent | 35.4% | 1.8% | 0.7% |
| o1 + IterativeAgent | 43.3% | 4.5% | 0.0% |

*Source: means from original Table 9. Its last column is labeled Results Analysis; the accompanying discussion refers to Result Match requirements. Claude results use three runs; the standard error for the o1 + IterativeAgent row uses two runs, differing from the scope of the main results.*

These results expose a bottleneck more clearly than the overall score: **much of the progress remains at the implementation stage and has yet to become completed experiments and reproduced results.**

The category scores have separate scopes and cannot simply be added together. Low Result Match scores do not imply that all the code is without value. [Appendix Table 9](https://arxiv.org/pdf/2504.01848v3#page=19)

### Agent design: does sustained iteration help?

The authors introduce IterativeAgent, removing the tool that lets agents submit early and prompting the model to take the next step on each turn.

| Model | BasicAgent | IterativeAgent |
| --- | ---: | ---: |
| o3-mini-high | 2.6% | 8.5% |
| o1-high | 13.2% | 24.4% |
| Claude 3.5 Sonnet | 21.0% | 16.1% |

*Source: means from original Tables 4–5.*

o1 and o3-mini improve, while Claude declines and the ranking changes. This suggests that **the evaluation measures the capability produced jointly by the model and its agent design.**

There is also a discrepancy between sources: the paper specifies 12 hours for its main experiment, while the [official repository README](https://raw.githubusercontent.com/openai/preparedness/main/project/paperbench/README.md) labels o1's 24.4% result as 24 hours. The change in that row therefore cannot be read directly as a pure prompting gain under strictly equal budgets. IterativeAgent also changes both the stopping mechanism and the prompts, so this comparison does not isolate their individual contributions.

### Human comparison: does more time enable continued progress?

![Replication progress over work time for humans and o1 on four papers](../assets/img/blog/paperbench/human-comparison.png "Figure 3. Human and o1 progress. Orange denotes humans and blue denotes o1; line styles distinguish four papers. Human curves use best-of-3; model error bars show standard errors over three runs. The horizontal axis places selected checkpoints at unequal time intervals. Source: original Figure 3, PDF page 8; only surrounding page material was cropped. Click to enlarge.")

o1's scores rise quickly at the beginning, after which most curves flatten. Human progress begins more slowly but continues substantially later on.

On the three-paper subset with complete later human records, human best-of-3 reaches **41.4%** after 48 hours, compared with o1's average **26.6%** after 36 hours. The fourth paper's human record ends at 24 hours, so it is excluded from this three-paper aggregate.

The conditions matter: the subset is small, human results use best-of-3, humans may use AI assistants, and the time budgets differ. Some human attempts use an A100, while independent reproduction uses an A10 for every submission. The stronger supported conclusion is that **in this setting, AI's advantage in early output has not translated into similarly strong continued improvement.** [Human baseline experiment](https://arxiv.org/html/2504.01848v3#S5.S4)

### Automated grading: how reliable are the scores?

With o3-mini-high, SimpleJudge achieves a **macro-averaged F1 of 0.83** across papers on JudgeEval. JudgeEval uses partial replication artifacts from five papers, with expert leaf labels as the reference. F1 measures agreement with expert labels; it is not a replication success rate.

Overall scores therefore provide a capability signal. Important conclusions still warrant inspection of execution artifacts and human review. The paper explicitly notes grading errors and nondeterministic results. [JudgeEval](https://arxiv.org/html/2504.01848v3#S4)

The paper also offers PaperBench Code-Dev, which checks only code development; o1 scores 43.4%. Because it skips independent reproduction and the other requirement types, that result cannot be compared directly with 21.0% or 24.4% on the full evaluation.

## 6. Our reflections

### Topic reflection: what is this field studying?

Research-agent evaluation needs to move toward checking whether evidence can be regenerated: does the system understand the objective, implement methods, organize experiments, and continue in response to results?

We regard replication as a useful window into these capabilities. It fixes the research objective and makes execution gaps easier to identify. However, **topic selection, hypothesis generation, and assessment of research value still need evaluation between successful replication and original research.**

### Limitations: what problems remain?

**First, an overall score can hide the practical bottleneck.** The same score might reflect substantial code implementation or a few genuinely completed experiments, which have different practical research value.

**Second, continued work does not establish continued learning.** More time and restrictions on early stopping can increase activity, but we still need to establish whether the system changes its approach in response to errors.

**Third, evaluation is expensive and its coverage remains limited.** The 8,316 requirements come from 20 papers; they are not that many independent research settings. Rubrics also require expert effort and are affected by paper specifications, judging decisions, and possible training contamination.

### Possible solutions: which directions could address these problems?

The following are directions we think are worth testing, corresponding to the limitations above.

1. **Report both progress and empirical completion.** Keep separate code, execution, and result scores, and also count fully completed core experiments so that one aggregate score does not carry too much interpretation.
2. **Design sustained iteration around failure feedback.** Preserve records linking failure causes, corrections, and rerun results. Under equal budgets, compare whether systems reduce repeated errors and advance unfinished experiments.
3. **Expand independent tasks and strengthen evidence checks.** Introduce newer, unpublished paper tasks; use programmatic checks for execution facts; focus expert review on key conclusions and disputed judgments; and evaluate original research separately.

The most direct lesson for our own research agents is this: **each step should leave enough evidence to justify the next decision.** PaperBench's category results show that, for the tested systems, this chain is especially fragile between implementation and empirical verification.

*Based on PaperBench arXiv v3. Figures: Giulio Starace et al., original Figures 1–3, reused under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); only surrounding page material was cropped. Tables select core results from the paper. Interpretations and proposed follow-up experiments are our analysis.*
