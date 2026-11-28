One research agent writes a cited review, another runs experiments, and a third claims to complete an entire study. How can we compare them? If their tools, literature sources, and spending differ, what does a higher score establish? AstaBench incorporates these conditions into evaluation while bringing literature understanding, code execution, data analysis, and end-to-end research into one suite.

We discuss **AstaBench: Rigorous Benchmarking of AI Agents with a Scientific Research Suite** by Jonathan Bragg and colleagues, using [arXiv v2](https://arxiv.org/abs/2510.21652v2), updated April 21, 2026 and published at **ICLR 2026**. Results describe the historical configurations evaluated in the paper, rather than a live ranking of current products.

## 1. Topic: evaluating whether AI can assist research

Investigating a new prediction method usually involves finding papers, understanding existing evidence, preparing data, implementing methods, running experiments, and deciding whether results support a hypothesis. These activities have different inputs and acceptance criteria. Retrieval may require a set of relevant papers, whereas data analysis requires a checkable relationship grounded in actual data.

**Research-agent evaluation asks how to turn these capabilities into explicit, repeatable tasks relevant to use.** Difficulty alone is insufficient: comparisons must also be fair. A system may benefit from a better corpus or improve by making more model calls. These advantages need to be distinguished from planning and reasoning capabilities.

A second challenge is the gap between local skills and complete research. Answering a literature question, running a function, and meeting some experimental requirements each have value, but cannot directly be converted into the probability of completing a study. Evaluation needs both diagnostic component scores and checks of complete task success.

## 2. Related work: from scientific subtasks to comparable evaluation suites

| Work | Previous exploration | Question carried forward |
| --- | --- | --- |
| [ScienceAgentBench](https://arxiv.org/abs/2410.05080v3) | Extract data-driven tasks from real papers and assess programs, execution results, and costs | How can coding be evaluated alongside literature, analysis, and research workflows? |
| [DiscoveryBench](https://arxiv.org/abs/2407.01725) | Given data, metadata, and a goal, assess alignment between discovered and reference hypotheses | How does data analysis fit into a broader map of research capabilities? |
| [PaperBench](https://arxiv.org/abs/2504.01848v3) | Use hierarchical rubrics to check implementation, execution, and replication results | How can different research tasks share interfaces and comparison conditions? |
| [HAL](https://github.com/princeton-pli/hal-harness) | Run multiple agents and benchmarks through a common harness with trace and cost tracking | How can scientific evaluation additionally control literature access and tooling? |

These efforts emphasize scientific authenticity, data inference, replication requirements, and evaluation infrastructure. AstaBench combines existing tasks, adapts some datasets, adds new tasks, and supplies an environment, baseline agents, and cost reporting. Its contribution is an evaluation system; broader coverage does not establish greater depth on every individual capability than specialized benchmarks.

## 3. Research questions: when do scores support reliable conclusions?

We organize the goals into three questions as a synthesis for this reading.

1. **Which activities give a reasonably complete picture of research assistance?** Evaluation should span literature retrieval, evidence understanding, coding, data analysis, and research execution.
2. **How can agent capability be separated from favorable comparison conditions?** Fix accessible resources, label tooling and openness, and report both scores and costs.
3. **Does a high partial score mean research was completed?** Cross-check reports, code, and artifacts, and separate average step scores from all-requirements completion.

These questions correspond to the task suite, standard environment and reporting, and detailed scoring with completeness checks. “Holistic” principally means coverage of multiple kinds of work; it does not mean that every problem traverses the entire research process.

## 4. Method: turning research requests into repeatable evaluation

![AstaBench connects agents, standard tools, tasks, and judges to quality and compute-cost comparisons](../assets/img/blog/astabench/overview.png "Figure 1 · Read left to right: agents use tools to solve tasks, rubrics and judges evaluate outputs, and quality is considered alongside cost. Standard tools control information-access conditions. Source: original v2 Figure 1, PDF page 3; rendered from the authors' original vector figure without redrawing.")

### Step 1: define inputs, deliverables, and scoring

The suite contains eleven benchmarks in four categories. The following summarizes [Table 2 and Appendix E](https://arxiv.org/pdf/2510.21652v2#page=6).

| Category and benchmark | Test / validation | Input and deliverable | Main evaluation |
| --- | ---: | --- | --- |
| Literature · PaperFindingBench | 267 / 66 | Search request → ranked papers | Query-dependent F1 or the harmonic mean of estimated recall and nDCG |
| Literature · LitQA2-FullText-Search | 75 / 10 | Biomedical question → relevant papers | recall@30 |
| Literature · ScholarQA-CS2 | 100 / 100 | Complex question → cited long-form answer | Mean of coverage, relevance, citation recall, and citation precision |
| Literature · LitQA2-FullText | 75 / 10 | Question → selected answer | Accuracy |
| Literature · ArxivDIGESTables-Clean | 100 / 70 | Papers and table intent → review table | Fraction of reference-table statements supported by the generated table |
| Code · SUPER-Expert | 45 / 50 | Repository and experiment requirements → execution results | Exact match against annotated results |
| Code · CORE-Bench-Hard− | 37 / 35 | Code/data capsule and analysis request → results report | Programmatic results evaluation |
| Code · DS-1000 | 900 / 100 | Question and incomplete code → completed code | Test-passing accuracy |
| Analysis · DiscoveryBench | 239 / 25 | Data, metadata, and goal → hypothesis | Product of context, variable, and relationship matching scores |
| Research · E2E-Bench | 40 / 10 | Research question and detailed requirements → report, code, trace, and artifacts | Task-specific cross-artifact rubric checks |
| Research · E2E-Bench-Hard | 40 / 10 | Harder research task → corresponding research artifacts | The same kind of rubric scoring |

Summing the rows gives **2,404 task instances: 1,918 test and 486 validation instances**; this is our calculation. “2400+” does not refer entirely to test problems, and the two LitQA tasks share source questions. Some benchmarks are adapted: CORE-Bench excludes GPU-requiring tasks, so scores should not be directly mixed with the complete original version.

Scoring sources also differ. LitQA, SUPER, CORE-Bench, and DS-1000 use programmatic evaluation, while several other tasks use LLM judges. Programmatic result matching and human judgment of scientific value provide different kinds of evidence.

### Step 2: constrain literature access and execution environments

**Asta Environment** supplies two main tool families. Literature tools search papers and snippets and retrieve metadata and citations, with access restricted by paper date. ScholarQA-CS2, for example, uses papers before May 1, 2025, while PaperFindingBench uses papers before June 1, 2025. Review-table tasks additionally restrict snippet access to specified papers.

Code tools provide a stateful Jupyter environment, preserving variables and files across calls and supporting Python and shell operations in a sandbox. By default, a cell running for more than five minutes returns a timeout message to the agent. Standard interfaces decouple tools from agent architectures.

This mainly controls **test-time information and tool access**. A date cutoff does not establish that a model never encountered benchmark materials during training. [Section 4 describes the environment](https://arxiv.org/pdf/2510.21652v2#page=7).

### Step 3: report tooling, openness, and cost

The paper does not force every system into identical tooling. Instead, it labels **Standard** systems using the prescribed tools, **Custom interface** systems using different interfaces to equivalent restricted environments, and **Fully custom** systems using tools beyond those conditions. Openness separately distinguishes open code and weights, open code with closed weights, API-only access, and UI-only access.

Rows in the same table therefore require checking their labels before comparison. With custom tools, an advantage may jointly reflect models, tools, routing, and workflows, rather than one architecture alone.

The `agent-eval` toolkit maps logged model usage to a frozen price snapshot, including applicable caching discounts. Updating the price snapshot permits consistent recalculation of historical costs. This reduces drift from API price changes, but measures normalized model-call cost rather than complete research cost including development, labor, and experimental hardware. [See Section 4.2 and Appendix B](https://arxiv.org/pdf/2510.21652v2#page=7).

### Step 4: cross-check artifacts and aggregate distinct measures

E2E-Bench already supplies a research question and fairly detailed instructions. Tasks involve investigating machine learning or NLP hypotheses and require a report, code, an execution trace, and data or result artifacts. This strongly tests execution while only weakly testing independent problem selection and planning.

Task-specific rubrics are machine-generated and manually checked and revised. For each criterion, an LLM judge examines the **report, code, and artifacts**, assigning met, failed, or no evidence. A criterion passes only when those facets are consistent and at least one supports fulfillment.

![End-to-end grading interface comparing evidence in reports, code, and artifacts for each rubric criterion](../assets/img/blog/astabench/artifact-scoring.jpg "Figure 2 · Each row is a rubric item: green indicates met, red failed, and yellow no evidence. Cross-artifact checks determine the final verdict. The dense original can be opened at full size. Source: original v2 Figure 10, PDF page 53; original image from the authors' source files, unchanged.")

The evaluation then separately reports average criterion scores and the fraction of tasks meeting every required criterion. Suite scores use macro-averaging, assigning half weight to each LitQA derivative within the literature category to avoid double-counting their shared source. The overall table summarizes four capability categories, rather than pooling all test questions into one accuracy.

Baselines include general ReAct and Smolagents Coder agents and specialized systems. **Asta v0** routes task types to different specialized solvers; it is not one fixed model handling everything independently. Some end-to-end systems generate artifacts offline and expose cached outputs for standardized grading. This is artifact re-evaluation, rather than every system being rerun in one controlled sandbox. [See Appendices E.9, F.7, and F.9](https://arxiv.org/pdf/2510.21652v2#page=41).

## 5. Experiments and results: coverage, cost, and completeness

### Main experiment: who can attempt the full suite, and at what call cost?

The authors evaluate **57 agent configurations across 22 architectural classes**. This does not mean every system completed all eleven benchmarks. General agents can attempt the full suite, whereas many commercial and specialized systems are evaluated only on applicable subsets.

The following selects overall results: higher scores and lower costs are preferable. Values are organized from [Table 4 and full Table 11](https://arxiv.org/pdf/2510.21652v2#page=21), retaining greater precision from the latter.

| System and model | Tooling | Overall score, 0–100 | Normalized macro-average cost, USD / problem |
| --- | --- | ---: | ---: |
| Asta v0, mixed models | Fully custom | 52.96 ± 2.36 | 3.3950 |
| ReAct, GPT-5 | Standard | 44.03 ± 3.01 | 0.3090 |
| ReAct, o3 | Standard | 39.45 ± 2.64 | 0.1635 |
| Smolagents Coder, GPT-5 | Custom interface | 37.54 ± 2.47 | 0.1265 |
| ReAct, GPT-5 mini | Standard | 31.65 ± 2.65 | 0.0366 |
| Smolagents Coder, Llama-4-Scout | Custom interface | 11.05 ± 1.39 | 0.1081 |

The ± values are **95% confidence intervals**, rather than standard deviations over independent reruns. Appendix D estimates them from variance across evaluation samples, propagating standard errors under an independence assumption; correlated tasks could make uncertainty underestimated. Macro-average cost is also not a deployment average weighted by actual user-request frequencies.

![AstaBench quality-cost plots and efficiency frontiers overall and across four task categories](../assets/img/blog/astabench/main-results.png "Figure 3 · Upper-left points offer higher scores at lower model-call cost. The horizontal dollar-cost axis is logarithmic; dotted lines connect the efficiency frontier in each comparison. Tooling differences still require consulting the table labels. Source: original v2 Figure 2, PDF page 8; rendered from the authors' original vector figure without redrawing.")

**Asta v0 scores approximately 8.93 points above ReAct/GPT-5, but has approximately 11 times its macro-average call cost and different tooling.** This supports the practical value of specialized tools and orchestration without isolating a causal advantage from any individual component or architecture.

Under the same Standard tooling label, ReAct/GPT-5 mini costs less but also scores lower, illustrating a quality-cost trade-off. Asta v0 does not lead every category: its code-and-execution score is 47.60 versus 55.02 for ReAct/GPT-5, and its data-analysis score is 33.17 versus 33.67 for ReAct/o3. An overall lead does not imply stronger capabilities in every area.

### Category results: literature, coding, and analysis have different bottlenecks

Even literature tasks differ substantially. In Table 5, Paper Finder achieves 90.7% recall@30 on the biomedical search subset but approximately 39.7 on the more complex PaperFindingBench. Different questions and metrics prevent interpreting this as a decline in one identical capability. The best review-table score in Table 7 is approximately 42.9, measuring reference-statement recall rather than the probability that every table cell is correct.

For coding, ReAct/GPT-5 scores 78.0 on DS-1000 but 41.1 on SUPER-Expert: generating code does not establish the ability to recover and execute research repositories. DiscoveryBench peaks at approximately 33.7; hypothesis matching against reference answers does not itself establish new scientific knowledge. [See Tables 5–9](https://arxiv.org/pdf/2510.21652v2#page=18).

These comparisons identify bottlenecks; they are not ablations with identical difficulty and metrics. The paper also observes that replacing the underlying model has different effects across workflows. The suggestion that newer models suit particular workflows is an explanatory hypothesis rather than a validated mechanism.

### Completeness: why approximately 70 points does not mean most studies succeed

End-to-end results particularly require reading both measures together.

| System | E2E mean criterion score, 0–100 | Hard mean criterion score, 0–100 | E2E all-criteria completion, 0–1 | Hard all-criteria completion, 0–1 |
| --- | ---: | ---: | ---: | ---: |
| Asta Panda | 70.47 | 68.21 | 0.00 | 0.03 |
| Asta CodeScientist | 65.35 | 64.50 | 0.05 | 0.03 |
| Faker | 39.17 | 25.37 | 0.00 | 0.00 |

*Sources: [Table 10](https://arxiv.org/pdf/2510.21652v2#page=20) and [Table 20](https://arxiv.org/pdf/2510.21652v2#page=41). Each end-to-end benchmark has 40 test problems. Completion rates retain the original table's rounding and cover only its three listed systems. The value 0.03 should not be reverse-engineered into an exact unrounded proportion.*

An average criterion score measures how many requirements were met; complete success requires all necessary requirements to hold in the same task. The authors illustrate compounding with an idealized example: ten independent steps, each succeeding with probability 0.7, yield approximately 2.8% complete success. This multiplication assumes independence and equal probabilities and cannot replace measurement. The more direct evidence is Table 20, where the highest reported complete-success fraction is only 0.05.

![Quality-cost comparisons for end-to-end research tasks](../assets/img/blog/astabench/end-to-end-results.png "Figure 4 · Panels show E2E-Bench and Hard. The vertical axis still measures mean step or criterion scores, rather than all-criteria completion. Error bars indicate 95% confidence intervals. Source: original v2 Figure 8, PDF page 31; rendered from the authors' original vector figure without redrawing.")

Faker deliberately avoids doing the research and tries to fabricate reports and artifacts, yet receives nonzero mean criterion scores. Our interpretation is that partial scores cannot replace evidence of actual execution. Cross-artifact grading reduces contradictions, but its strength depends on whether the judge understands crucial implementation details and whether artifacts establish execution.

### Judge validation: agreement with human assessment

The paper does not treat LLM judges as unquestionable ground truth. For ScholarQA-CS2, system-level ranking agreement with experts has **Kendall's τ of 0.467**, rising to 0.800 after excluding Elicit. The latter changes the comparison set and cannot replace the overall result. Instance-level agreement is **68.1%** where human judgments identify a clear winner.

The authors also test bias from building rubrics using evaluated systems' answers. Withholding a system from the ingredient pool causes an average coverage-score drop of approximately **2.5 points** for three systems. Reference ingredients can therefore favor their contributing systems. Citation metrics also do not themselves verify that papers exist or that quoted passages actually appear in the sources; these require independent checks. [See Appendix E.3](https://arxiv.org/pdf/2510.21652v2#page=35).

For end-to-end judging, a human judged **92% of a development-set sample of 50 rubric items correct**. This is a small criterion-level check, rather than proof of 92% verification accuracy over complete studies. The paper reports overly generous judgments and missed methodological nuances. [See Appendix F.9](https://arxiv.org/pdf/2510.21652v2#page=52).

## 6. Our reflections

### Topic reflection: what is this field studying?

For us, research-agent evaluation should establish an interpretable chain: given particular resources and budgets, what work did a system perform, what evidence did it deliver, and what conclusions does that evidence support? AstaBench makes tooling, openness, and cost part of the assessment while preserving diagnostics across research activities.

It also highlights levels of measurement: citation and answer quality, passing code tests, completing research steps, completing an entire task, and ultimately scientific value. Identifying the level makes it possible to discuss which capability an improvement actually advances.

### Limitation reflection: what remains unresolved?

- **Controlled evaluation differs from actual use.** Standard tooling supports comparison, but Fully custom systems and offline artifacts do not share all runtime conditions. Model-call expenses also omit parts of research cost.
- **Automatic judges do not replace complete evidence audits.** Human agreement is limited, rubrics have source bias, and citation authenticity and actual execution remain incompletely checked. Faker's nonzero scores further show the limits of averages.
- **Coverage and open research remain limited.** Tasks lean toward computer science and include resource-filtered datasets. Detailed end-to-end instructions provide limited evidence about independent problem selection, long-term collaboration, or wet-lab work.
- **Overall scores can hide critical failures.** Macro-averaging combines metrics, sample sizes, and task weights. Many local requirements can be satisfied while the complete study remains unfinished.

### Solution reflection: which directions could address these issues?

The following are our proposals, rather than experiments already completed by the paper.

- **For control and cost:** maintain separate controlled-capability and real-product evaluations, freeze model versions and environments, release offline generation traces, and record call expenses alongside hardware time, development, and human intervention.
- **For judge reliability:** build held-out rubrics with independent experts and unevaluated systems; externally verify source passages, execution logs, and crucial artifacts. Add more adversarial cases claiming work that was never executed and report task-specific judgment errors.
- **For coverage:** expand disciplines, long-term projects, and human collaboration. Separately evaluate prescribed-step execution and independent problem discovery and experimental design, using refreshed held-out data to examine contamination risks.
- **For aggregation and completeness:** report budget-specific component scores, necessary-condition fulfillment, and whole-task success, identifying failure locations. Compare new methods under matching tools and budgets and independently replay research artifacts.

*Version and materials: based on the [AstaBench v2 full paper](https://arxiv.org/pdf/2510.21652v2) and the authors' source files. Original Figures 1, 2, 8, and 10 belong to Jonathan Bragg and colleagues and are attributed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Vector figures were rendered as web images without redrawing. Tables organize the reported results; count sums, interpretation, and proposed directions are our analysis.*
