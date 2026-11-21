An AI given a research objective may produce a convincing report while omitting crucial comparisons, choosing unsuitable methods, or failing to generate evidence supporting its conclusions. The problem can arise before execution: the required evidence has never been made explicit. AutoSciRub first constructs concrete scientific requirements, then uses them to guide experiments, check artifacts, and target revisions.

We discuss **Learning to Evaluate Before Improving: Automatic Rubric Induction for Automatic Research Agents** by Xuehai Wang and colleagues, using [arXiv v1](https://arxiv.org/abs/2608.31076v1), submitted August 31, 2026 and labeled **Work in progress**. We distinguish the method, the authors' reported experiments, and our interpretation and proposals.

## 1. Topic: translating research goals into evidence requirements

Suppose a task asks for analysis of observational data to explain how a phenomenon varies across regions or conditions. Instructions rarely enumerate every statistic, comparator, unit convention, or claim requiring additional evidence. Even a proficient coding system can end up solving a nearby but different problem.

**This topic asks how to recover scientific goals from underspecified instructions and translate them into executable, checkable requirements.** A rubric is a set of assessment and acceptance criteria. It can assess completion afterward and also specify which evidence should be generated along the way.

Three levels need checking: whether the scientific question is correctly identified, whether the experimental plan is feasible, and whether artifacts support the conclusions. Detail can help execution without establishing correct direction. Meeting a checklist also depends on whether it covers the important scientific questions.

## 2. Related work: bringing evaluation criteria into research workflows

| Work | Main exploration | Connection to this paper |
| --- | --- | --- |
| [PaperBench](https://arxiv.org/abs/2504.01848v3) | Hierarchical rubrics check implementation, execution, and replication results | Shows diagnostic value while highlighting the cost of expert-authored requirements |
| [ResearchClawBench](https://arxiv.org/abs/2606.07591v5) | Instructions, related literature, and raw data are provided; a hidden target paper supports multimodal evaluation | Provides a research setting where the official assessment criteria are unavailable during execution |
| [AstaBench](https://arxiv.org/abs/2510.21652v2) | Combines research tasks, tools, and artifact assessment, distinguishing partial progress from full completion | Supplies another end-to-end task collection for examining transfer |
| [Self-Refine](https://arxiv.org/abs/2303.17651v2) | Models provide feedback on initial outputs and revise them iteratively | Motivates the comparison between explicit criteria and generic self-improvement |

AutoSciRub automatically constructs a rubric before research and uses it for subsequent checking and revision. As described, it is an inference-time task-interpretation and execution-control layer; the main experiments do not obtain these improvements by updating backbone model parameters. Its generic refinement baseline draws on related ideas without constituting a comprehensive comparison against all existing feedback systems.

## 3. Research questions: what does evaluating before improving require?

We synthesize the goals into three questions for this reading.

1. **How can broad instructions yield actionable, verifiable scientific requirements?** Goals must remain traceable while incorporating literature and available data.
2. **Do these requirements improve complete research outputs?** Paired comparisons should span models, agent harnesses, and another task collection.
3. **Where do gains come from, and where does the approach fail?** Separate decomposition, grounding, and targeted revision, and test whether added detail improves coverage of the scientific core.

Crucially, **the induced rubric differs from the benchmark's hidden evaluation rubric.** The first is the system's specification derived from visible materials; the second assesses final outputs. The goal is to bring the induced specification closer to the actual scientific requirements without exposing official answers or checklists to the execution agent.

## 4. Method: from a goal skeleton to targeted revision

![AutoSciRub workflow connecting goal induction, literature grounding, data exploration, criterion synthesis, execution, verification, and revision](../assets/img/blog/autoscirub/overview.png "Figure 1 · On the left, instructions become goals, which are grounded in literature and data to produce a rubric. On the right, that rubric guides execution, checking, and revision. Together they connect scientific objectives to generated evidence. Source: original v1 Figure 2, PDF page 3; rendered from the authors' original vector figure without redrawing.")

### Step 1: induce a goal skeleton from the instruction alone

The system decomposes the instruction into a compact set of atomic goals, each with an identifier, name, and concrete requirement. At this stage it reads only the instruction, without introducing particular methods, metrics, baselines, or expected results. This reduces the risk of prematurely organizing the task around an available technique.

The output describes what should be investigated. It is not yet a complete experiment plan; the means of establishing evidence come later.

### Step 2: examine literature support and data feasibility

For each goal, the literature stage searches concepts, methods, metrics, and protocols, consulting task-provided materials first and retaining five to seven core papers. Findings are organized by goal, covering possible analyses, controls, ablations, robustness checks, and evidence forms.

To reduce direct retrieval of hidden target papers, queries avoid long instruction spans, task identifiers, and specific filenames. Before full-text access, the retrieval layer filters titles against a hidden blocklist maintained by the evaluation harness. These are safeguards rather than proof that every leakage route is excluded. Literature informs design without substituting for experimental evidence generated in the current task.

The data stage lightly inspects files, formats, dimensions, fields, units, labels, conditions, and relationships across sources to establish feasibility. It supports planning; full experiments occur during execution, avoiding requirements that assume unavailable labels or reference values. [See Section 3.2](https://arxiv.org/html/2608.31076v1#S3.SS2).

### Step 3: synthesize concrete criteria from goals, literature, and data

Each criterion links to one or more goals and specifies data, experiments or analyses, metrics and comparisons, expected files, and satisfaction conditions. “Executable” mainly means concrete enough to guide research; it does not establish that every criterion has been compiled into a deterministic programmatic test.

For example, the original format example in Appendix B expands a goal concerning state-level concentration of cloud-seeding projects into counts, shares, Gini coefficients, maps, heatmaps, and ranked tables, with input fields and output paths. This is the paper's rubric example, not a scientific result we independently reproduced.

![Original comparison of concrete experimental requirements and the benchmark's final-report checklist](../assets/img/blog/autoscirub/rubric-example.png "Figure 2 · The left specifies experiments, data, metrics, and artifacts; the right summarizes evidence expected in the final report. It illustrates different roles for an execution specification and a post-hoc checklist without establishing complete coverage of hidden requirements. Source: original v1 Figure 5, PDF page 6; rendered from the authors' original vector figure without redrawing.")

### Step 4: execute research, diagnose gaps, and revise artifacts

The agent uses the induced rubric to produce an initial report, code, results, and figures. Verification identifies missing experiments, results, explanations, or evidence and produces issues and corrective actions. Revisions may change code, rerun experiments, add analyses, update figures, or remove unsupported claims.

The main method describes stopping when requirements are met or the budget is exhausted. Appendix A.3 provides a more specific implementation: in the OpenClaw refinement experiment, **the same agent invokes a verification skill, without a separately instantiated verifier model**. At most three revision calls and four verification calls are allowed.

Stopping depends on the top-level `overall_pass` field. This is a holistic LLM judgment rather than a deterministic conjunction of every Boolean criterion. High-priority requirements may be satisfied or scientifically justified by generated evidence; lower-priority items need not all pass individually. The runner reads that field directly. Internal verification success therefore should not be equated with a perfect hidden benchmark score. [See Appendix A.3](https://arxiv.org/pdf/2608.31076v1#page=17).

## 5. Experiments and results: overall effects before component analysis

### Main experiment 1: do different models and harnesses benefit?

The ResearchClawBench experiment uses **all 40 tasks across 10 domains, with 4 tasks per domain**. Each paired comparison holds the backbone, harness, task inputs, and available environment fixed while adding AutoSciRub. The hidden target paper and official rubric remain unavailable during execution. **GPT-5.1** evaluates final artifacts under the benchmark protocol.

Scores range from 0 to 100, using textual and image criteria tied to scientific artifacts in the hidden paper, then averaging across the 40 tasks. The paper describes approximately 50 as a calibration point for target-paper-level rediscovery within this protocol, rather than a universal passing grade for scientific capability.

| Fixed condition | Configuration | Vanilla | +AutoSciRub | Absolute gain |
| --- | --- | ---: | ---: | ---: |
| Codex harness | GPT-5.4 | 18.66 | 21.04 | +2.38 |
| Codex harness | GLM-5.2 | 20.86 | 22.73 | +1.87 |
| Codex harness | MiniMax-M3 | 19.05 | 21.04 | +1.99 |
| DeepSeek-V4-Flash backbone | Claude Code | 16.60 | 18.74 | +2.14 |
| DeepSeek-V4-Flash backbone | OpenClaw | 17.25 | 20.36 | +3.11 |
| DeepSeek-V4-Flash backbone | OpenScience | 14.49 | 18.09 | +3.60 |

*Source: [Table 1](https://arxiv.org/pdf/2608.31076v1#page=5). Gains are score points, not relative percentage increases. The mean gain across three models is 2.08 points and across three harnesses is 2.95 points.*

Overall means improve for all six configurations, supporting usefulness across the evaluated systems. Not every domain improves: the authors report gains in 49 of 60 configuration-by-domain comparisons, which are not 60 independent tasks. The highest overall score is still 22.73, illustrating the distance between consistent improvement and strong scientific rediscovery.

**Three repetitions refer to judging, not research execution.** Each task–configuration pair runs once, generating one report and artifact set, which is independently scored three times and averaged. This reduces judging variability without measuring stability across independent research runs. Compute is also unmatched: AutoSciRub adds induction, verification, and revision calls, with no shared explicit token, tool-call, runtime, or monetary cap across harnesses. [See Appendix A.1](https://arxiv.org/pdf/2608.31076v1#page=10).

### Main experiment 2: what improves on AstaBench?

From the 40 Easy test tasks, the authors select a fixed random subset of **20 tasks**, using the same subset and execution order across configurations. The task rubrics and three-facet artifact-scoring pipeline are retained, with **MiniMax-M3** serving as evaluator.

![AutoSciRub scores and submission-completion counts for three agent configurations on AstaBench](../assets/img/blog/autoscirub/astabench-results.png "Figure 3 · Bars show mean rubric scores; lines show counts of successfully produced submissions accepted for scoring. These are different measures: 20/20 does not mean every rubric criterion passed. Source: original v1 Figure 3, PDF page 4; rendered from the authors' original vector figure without redrawing.")

| Harness and backbone | Vanilla score | Augmented score | Absolute gain | Scorable submissions: vanilla → augmented |
| --- | ---: | ---: | ---: | --- |
| Claude Code / DeepSeek-V4-Flash | 71.26 | 90.62 | +19.36 | 18/20 → 20/20 |
| Codex / GPT-5.4-mini | 71.74 | 84.35 | +12.61 | 18/20 → 20/20 |
| OpenClaw / DeepSeek-V4-Flash | 67.96 | 86.34 | +18.38 | 19/20 → 19/20 |

*Source: [Figure 3 and Appendix A.1](https://arxiv.org/pdf/2608.31076v1#page=4). The mean gain is 16.78 points across the three configurations.*

**This paper defines successful task completion as ending without an execution-level failure and producing a valid submission processable by the evaluator.** This differs from AstaBench's all-required-criteria completion rate. A count of 20/20 does not establish that twenty studies were fully completed.

The experiment supports higher artifact scores on this fixed subset while preserving or improving submission completion. It is not a score for the full suite or Hard split. Subset, model, and judge settings also prevent direct comparison with original leaderboard values reported elsewhere.

### Ablation: roles of skeletons, grounding, and revision

The cumulative ablation fixes OpenClaw with DeepSeek-V4-Flash and uses all 40 ResearchClawBench tasks.

| Setting | Score | Gain over vanilla | Gain over preceding stage |
| --- | ---: | ---: | ---: |
| Vanilla | 17.25 | — | — |
| Add goal skeleton | 17.61 | +0.36 | +0.36 |
| Add grounded executable rubric | 18.31 | +1.06 | +0.70 |
| Add targeted revision, full method | 20.36 | +3.11 | +2.05 |

*Source: [Table 2](https://arxiv.org/pdf/2608.31076v1#page=6). The second added stage jointly includes literature grounding, data exploration, and criterion synthesis; their contributions are not separately isolated.*

Making goals explicit helps, while greater operational detail and targeted post-execution changes provide larger gains. However, sequential additions depend on existing components and additional computation. Their increments are not independent component effects that necessarily transfer to every setting.

### Rubric quality: greater detail does not ensure scientific-core coverage

MiniMax-M3 separately evaluates skeletons and executable rubrics using the task, visible data, and official checklist. Four dimensions use a 1–5 scale. The checklist is available only to the judge, not the execution agent.

| Quality dimension | Goal skeleton | Executable rubric |
| --- | ---: | ---: |
| Specificity | 1.65 | 4.40 |
| Actionability | 2.00 | 3.83 |
| Evidence verifiability | 1.78 | 4.08 |
| Scientific core coverage | 3.35 | 3.07 |

![Original comparison of goal skeletons and executable rubrics on four quality dimensions](../assets/img/blog/autoscirub/rubric-quality.png "Figure 4 · The orange line has greater specificity, actionability, and evidence verifiability but slightly lower scientific-core coverage. Values are automatic-judge means, not expert human assessments. Source: original v1 Figure 4a, PDF page 6; rendered from the authors' original vector subfigure without redrawing.")

The four-dimension mean rises from 2.20 to 3.84, while core coverage falls from 3.35 to 3.07. Our interpretation is that the approach more effectively operationalizes an identified direction than consistently corrects the initial scientific framing. When the skeleton misses the core goal, additional detail can elaborate an off-target analysis.

The positive association between core coverage and report scores in Figure 4b does not independently establish causality. The supplementary experiments also do not provide comprehensive independent expert verification of the generated rubrics. [See Section 4.4 and Appendix A.2](https://arxiv.org/html/2608.31076v1#S4.SS4).

### Revision comparison: explicit feedback versus generic self-improvement

Both conditions begin with the same initial reports and figures, scoring 18.31 on average, and use the same OpenClaw/DeepSeek-V4-Flash configuration.

| Revision round | Generic self-refinement score | Rubric-guided revision score |
| --- | ---: | ---: |
| 1 | 18.80 | 19.47 |
| 2 | 18.52 | 20.08 |
| 3 | 19.08 | 20.36 |

*Source: [Table 3](https://arxiv.org/pdf/2608.31076v1#page=7). Cumulative gains are 0.77 and 2.05 points. The final scores themselves do not differ by a factor of 2.7.*

The guided aggregate score increases steadily, whereas generic refinement regresses in the second round. However, the appendix explicitly states that the conditions are **neither complete-workspace-identical nor compute-matched**. Guided revision preserves original code and outputs and separates verification from revision. Generic refinement copies only frozen reports and figures into a fresh workspace with task materials, combining review and revision in each call.

This supports explicit feedback's value in the tested workflows without isolating the causal effect of feedback content alone. Existing code state, call organization, and stopping behavior may also affect outcomes.

![Overall scores, active-task counts, and stopping behavior during guided revision](../assets/img/blog/autoscirub/revision-dynamics.png "Figure 5 · Later rounds process only tasks that have not stopped. Stopped tasks retain their latest real reports and existing scores in subsequent aggregate means, whose denominator remains all 40 tasks. Source: original v1 Figure 6a, PDF page 7; rendered from the authors' original vector subfigure without redrawing.")

The guided condition revises 40 tasks initially, then only 17 and 6 tasks. In total, 35 tasks pass internal verification within three revisions. Subsequent aggregate means carry forward stopped tasks' existing scores without generating or rescoring artificial reports. This 35/40 is an internal stopping statistic, not official all-criteria benchmark success. Without comprehensive cost measurement, larger early gains alone also cannot establish the most cost-effective revision budget.

## 6. Our reflections

### Topic reflection: what is this field studying?

The paper makes an important problem explicit: research automation needs to decide which evidence to generate and which conclusions are warranted, alongside executing a plan. Connecting goals, data, methods, and artifacts can make feedback more specific and failures easier to locate.

The deeper issue is whether the specification itself is correct. It should help identify omissions, accept counterevidence, and revise direction, rather than only enforce the first generated checklist. The separation between specificity and scientific-core coverage offers a useful research question.

### Limitation reflection: what remains unresolved?

- **Scientific framing can become fixed too early.** Core coverage does not improve with operational detail, and the appendix format includes expected conclusions. Treating expectations as outcomes that must be established could reinforce confirmation bias. This is a risk we infer from the design, not a measured general violation.
- **Verification lacks sufficient independence.** The same agent checks its own artifacts within the task session, and stopping relies on a holistic judgment. Automatic scores and internal passes still require independent evidence verification.
- **Gains and resource investment are not separated.** Budgets are unmatched, each task–configuration pair executes once, and refinement workspaces differ. Execution variability and cost remain incompletely measured.
- **Transfer and success definitions have boundaries.** AstaBench uses only a fixed twenty-task Easy subset. Scorable submissions are not fully successful studies, and gains under different judges need further validation against scientific value.

### Solution reflection: which directions could address these issues?

These are our proposed experiments, rather than results already established by the authors.

- **For fixed framing:** independently review goal coverage and permit evidence to revise or reject expectations. Separate anticipated findings from required tests, and introduce tasks whose data overturn initial hypotheses to assess confirmation bias.
- **For verification independence:** connect crucial criteria to deterministic numerical, file, and execution checks; add independent models and expert audits. Distinguish inapplicability, insufficient evidence, and failure, and release judgment errors and reasons behind top-level passes.
- **For cost and stability:** compare feedback strategies from identical frozen code, outputs, and reports, match calls, time, and expenses, run multiple seeds, and report gain distributions and effective improvement per unit cost.
- **For transfer:** expand to complete Easy and Hard sets and broader scientific tasks. Separately report execution completion, evidence adequacy, and all-criteria success, retain independent judges, and have domain experts verify that added experiments actually strengthen the argument.

*Version and materials: based on the [AutoSciRub v1 PDF](https://arxiv.org/pdf/2608.31076v1) and the authors' source files; [official code](https://github.com/zjunlp/AutoSciRub). Original Figures 2, 3, 4a, 5, and 6a belong to Xuehai Wang and colleagues and are attributed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) for this noncommercial reading article. They were rendered as web images without redrawing. Tables organize reported results; interpretation, limitations, and proposals are our analysis.*
