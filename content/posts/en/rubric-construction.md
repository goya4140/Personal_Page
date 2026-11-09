> This article synthesizes primary papers and author project pages on constructing and validating scoring rules. Reported findings remain scoped to each study’s settings. Cross-work comparisons and research proposals are our synthesis, not established conclusions.

Evaluating open-ended coding agents extends beyond whether a patch passes tests. Real issues combine functionality, compatibility, performance, safety, maintainability, and process constraints. Compilation, tests, and static analysis can adjudicate some requirements; others require interpreting intent, checking evidence, and accommodating multiple correct implementations. Rubric construction therefore builds **a verifier combining requirements, environmental evidence, and decision rules**, beyond a longer scoring prompt. Good rubrics decompose vague success into traceable, observable, falsifiable criteria. Poor ones may scale judge preferences, superficial reference structures, or generator biases.

Educational measurement offers a warning: analytic, task-specific rubrics and rater training often improve reliability, but a rubric’s existence does not establish validity. [Jonsson and Svingby, 2007](https://doi.org/10.1016/j.edurev.2007.05.002) [Brookhart and Chen, 2015](https://doi.org/10.1080/00131911.2014.929565) This distinction matters even more for LLM evaluation. FLASK, G-Eval, and Prometheus show benefits from fine-grained, conditioned judges for diagnosis or human agreement, while MT-Bench identifies position, verbosity, and self-enhancement biases. [FLASK](https://arxiv.org/abs/2307.10928) [G-Eval](https://arxiv.org/abs/2303.16634) [Prometheus](https://arxiv.org/abs/2310.08491) [MT-Bench](https://arxiv.org/abs/2306.05685) We therefore examine the verification chain from construction to training, beyond individual judge accuracy.

## Definition: a rubric is an executable approximation of requirements

Let task requirements be (Q) and available environmental evidence (E), including issues, repositories, tests, logs, reference patches, and tool outputs. A rubric can be written as:

\[
\mathcal{R} = \{(c_i, p_i, v_i, w_i, g_i)\}_{i=1}^{m},
\]

Here, \(c_i\) is a criterion, \(p_i\) its requirement provenance, \(v_i\) acceptable evidence or a verifier, \(w_i\) its weight, and \(g_i\) its hierarchy or gate. Two implications follow. Every criterion should trace to requirements, tests, domain standards, or risk constraints, rather than generic preferences such as clarity or elegant code detached from the task. Each criterion also needs evidence that could support or refute it: tests, behavioral properties, tool-produced artifacts, or calibrated human/LLM judgments.

Coding agents particularly need separate hard gates and soft/process criteria. Hard gates cover compilation, prohibition of grader tampering, critical safety invariants, and executable tests. Soft criteria cover localization, evidence collection, minimal edits, recovery, and efficiency. A weighted sum can improperly reward fluent but functionally wrong trajectories. Conversely, final tests alone give sparse signals for long searches. SWE-TRACE trains process reward models (PRMs) using process rubrics; a rubric-supervised critic learns from sparse real outcomes. Neither removes the need for independent final execution. [SWE-TRACE](https://arxiv.org/abs/2604.14820) [A Rubric-Supervised Critic](https://arxiv.org/abs/2603.03800)

> **Construction chain:** requirements and environmental evidence → requirement graph → atomic criteria → executable gates and process evidence → independent validation → training or search → adversarial audit and revision.

## A spectrum from fixed dimensions to task-adaptive construction

Methods can be organized by rubric origin, structure, and use rather than publication year. **Fixed capability dimensions** include FLASK’s instruction-conditioned skill sets, G-Eval’s evaluation forms and chain-of-thought, and Prometheus’s open evaluator conditioned on explicit rubrics/references. They demonstrate more diagnostic scoring than a single overall score. Prometheus reports Pearson correlation 0.897 across 45 customized rubrics, evidence of judge alignment under particular data/rubric conditions rather than proof of rubric correctness. [FLASK](https://arxiv.org/abs/2307.10928) [G-Eval](https://arxiv.org/abs/2303.16634) [Prometheus](https://arxiv.org/abs/2310.08491)

**Question-specific rubrics** include SedarEval’s scoring/deduction points for 1,000 knowledge, math, coding, and logic questions; AlignBench’s Chinese scenarios, manually checked references/evidence, and rule-calibrated multidimensional judges; and Rubric Is All You Need’s comparisons on 150 DSA and 80 OOP submissions. They bring task details, deductions, and evidence into evaluation beyond generic helpfulness. [SedarEval](https://aclanthology.org/2024.findings-emnlp.984/) [AlignBench](https://aclanthology.org/2024.acl-long.624/) [Rubric Is All You Need](https://arxiv.org/abs/2503.23989) Specificity also introduces authoring, reference anchoring, and maintenance costs. Criteria extracted from a gold patch’s surface structure may reject behaviorally equivalent alternatives.

**Hierarchical tasks and process trajectories** extend the structure further. PaperBench decomposes 20 paper-replication tasks into 8,316 individually scorable nodes, developed with original authors, to assess partial progress. [PaperBench](https://arxiv.org/abs/2504.01848) SWE-TRACE’s Rubric-Agent provides intermediate feedback for PRM training. Another critic defines 24 observable behaviors from real human–agent traces and improves SWE-bench reranking and early stopping. [SWE-TRACE](https://arxiv.org/abs/2604.14820) [A Rubric-Supervised Critic](https://arxiv.org/abs/2603.03800) Their value is turning observable intermediate evidence into learning signals, beyond replacing tests with language judges. Local behavior scores still have no automatic causal relationship with success.

**Automatic generation, selection, and reconstruction** includes OpenRubrics, which extracts hard rules and implicit principles from preferred/rejected differences and filters by preference-label consistency; Auto-Rubric, which builds a compressed hierarchical core from few preference pairs through verification-driven refinement; and RRD, which recursively decomposes, filters, and controls correlation weights to address missing coverage, mixed dimensions, and redundancy. [OpenRubrics](https://arxiv.org/abs/2510.07743) [Auto-Rubric](https://arxiv.org/abs/2510.17314) [RRD](https://arxiv.org/abs/2602.05125) RubricHub combines principle-guided synthesis, multi-model aggregation, and difficulty evolution into a coarse-to-fine pipeline with 110k examples. RubricRAG retrieves similar-task rubrics for domain knowledge. [RubricHub](https://aclanthology.org/2026.acl-long.1445/) [RubricRAG](https://arxiv.org/abs/2603.20882) This shifts manual bottlenecks into generation, filtering, and versioning, while introducing generator monoculture, preference biases, and retrieval leakage.

Finally, rubrics become **training signals**. Rubrics as Rewards uses instance-specific rubrics for on-policy RL on HealthBench and GPQA-Diamond, reporting improvements of up to 31% and 7% over direct Likert-judge rewards. OpenRS combines pairwise adaptive meta-rubrics with verifiable pointwise rubrics for pairwise RL; AdaRubric generates agent-specific dimensions from task descriptions to produce DPO preferences. [Rubrics as Rewards](https://arxiv.org/abs/2507.17746) [OpenRS](https://arxiv.org/abs/2602.14069) [AdaRubric](https://arxiv.org/abs/2603.21362) Denser training makes rubrics active optimization targets. Static test agreement therefore cannot establish RL safety: policies may exploit criteria, judge biases, or fabricate superficial tool evidence.

## Comparing verifier structures rather than single scores

Table 4.5-1 summarizes methods consistently. Evidence identifies what criteria ultimately depend on; boundaries indicate where findings should not be extrapolated, rather than dismissing papers.

| Method | Rubric origin/structure | Task/environment | Evidence and feedback stage | Main contribution/result | Boundary |
|---|---|---|---|---|---|
| FLASK | Instruction-conditioned skills | Open LLM instructions | Fine-grained human/model scores; final | Capability diagnosis beyond overall scores | Taxonomy/judge distribution sensitivity |
| Prometheus | User rubric, optional reference; flat scoring | Long/open responses | Rubric-conditioned 13B judge; final | Reported r=0.897 on 45 rubrics | Synthetic teacher, reference dependence, no RL audit |
| SedarEval | Per-question scoring/deductions | Knowledge/math/code/logic | Evaluator LM; final | 1,000 question-specific rubrics | Manual cost; incomplete characterization of multiple valid answers |
| AlignBench | Checked evidence, multidimensional rules | Chinese open QA | Rule-calibrated LLM judge; final | Evidence-aware Chinese alignment evaluation | No repository/agent environment; drifting web evidence |
| PaperBench | Author-developed artifact hierarchy | Paper-replication agents | LLM judge; tasks/subtasks | Partial progress across 20 tasks and 8,316 nodes | Hierarchical error accumulation; implementation-similarity bias |
| Rubric Is All You Need | Question-specific code rubric | Student DSA/OOP code | Multi-agent grading; final | Logical assessment and leniency metrics | Small educational dataset, not production repositories |
| SWE-TRACE | Intermediate heuristic rubric | SWE agents | PRM; RL/test-time pruning | Process feedback and token/latency optimization | PRM hacking, short-trace preferences; independent tests needed |
| Critic Rubrics | 24 observable trace behaviors | Real human–coding-agent traces | Critic; rerank/early stop/training | Learning critics from sparse outcomes | Proxy behaviors with unknown causal validity |
| OpenRubrics / Auto-Rubric / RRD | Contrastive rules; compressed hierarchy; recursive deduplication | Reward models/open tasks | Generated rubrics → RM/RFT | Scalable construction and criterion filtering | Shared preference/generator origins; insufficient coverage |
| RubricHub | Coarse-to-fine synthesis, aggregation, difficulty evolution | Multidomain post-training | RuFT → RuRL | 110k examples and training pipeline | Synthetic monoculture; benchmark optimization |
| RubricBench | Expert atomic gold rubrics | Difficult pairwise comparisons | Rubric meta-evaluation | Direct human/model rubric-gap measurement | Scale/domain limits; gold needs auditing |
| RaR / OpenRS / AdaRubric | Instance/meta/task-adaptive rubrics | Medical/scientific tasks or agent traces | RL / pairwise RL / DPO | Rubrics as learning signals | Policy shift and hacking not fully resolved |
| LLMEval-Logic / ClinConsensus | Expert atomic items plus solvers/thresholds | Chinese logic/medicine | Z3 or dual judges; final | Formal/domain-expert grounding of critical coverage | Formal semantics, privacy, domain-transfer risks |

Cross-paper reporting should distinguish **requirement coverage**, **judge compliance with the rubric**, **agreement with human/execution outcomes**, and **real capability gains after optimizing the score**. A single Pearson correlation or pairwise accuracy conflates different failures. LLM-Rubric shows calibration can reduce errors on specific human scales; RubricBench and paper-reproduction meta-evaluation show fluent model-written rubrics can still differ substantially from expert atomic criteria. [LLM-Rubric](https://aclanthology.org/2024.acl-long.745/) [RubricBench](https://aclanthology.org/2026.acl-long.1439/) [Can LLMs Write Reliable Rubrics?](https://arxiv.org/abs/2607.12835)

> **Two conceptual axes:** generic to task-adaptive criteria, and final scoring to process diagnosis/training loops. This is a classification, not a leaderboard.

## A construction and validation protocol for coding agents

Use specification-first, trajectory-second construction. Build a provenance-linked requirement graph from issues, interface contracts, repository constraints, tests, and historical behavior. Separate hard gates, key functionality, boundary/regression cases, quality constraints, and optional process evidence. Keep criteria atomic so a failure maps to a clear requirement. Assign the strongest available verifier: tests or static invariants before LLM judgments; use conditioned judges only where quality/process items cannot be checked directly. Validate with reference patches, different correct patches, single-violation mutations, near misses, and adversarial traces.

| Check | Should accept | Should reject | Failure implies |
|---|---|---|---|
| Reference acceptance | Reference patch / verified trace | — | Incorrect criterion or verifier implementation |
| Alternative acceptance | Behaviorally equivalent, structurally different patches | — | Overfitting to reference surface form |
| Single-criterion mutation | Patches preserving the criterion | Near misses violating only that criterion | Nonatomic criteria, mismatched evidence, or inappropriate weights |
| Harness integrity | Original/random rerun environments | Grader tampering or mocks hiding failures | Verifier bypass |
| Judge robustness | Equivalent paraphrased, reordered, or length-perturbed traces | — | Wording/format bias |
| Policy-shift audit | Real success before/after training | High-reward, low-success traces | Reward hacking or out-of-distribution judges |

The protocol combines PaperBench’s artifact hierarchy, SWE-TRACE’s dense feedback, RubricBench’s atomic comparisons, and LLMEval-Logic’s formal anchors without treating any one as a complete solution. [PaperBench](https://arxiv.org/abs/2504.01848) [SWE-TRACE](https://arxiv.org/abs/2604.14820) [RubricBench](https://aclanthology.org/2026.acl-long.1439/) [LLMEval-Logic](https://arxiv.org/abs/2605.19597)

## Limitations: what current evidence does not establish

First, most findings are correlations or downstream gains under particular benchmarks, judges, prompts, and model versions; they do not establish sufficient validity against task truth. Second, generators, filters, and judges often share model families or preference sources, allowing shared bias to appear internally stable. Third, reference conditioning can confuse reference similarity with specification satisfaction, especially for code with multiple valid solutions. Fourth, RL/reranking gains do not automatically establish safe rewards: persistent optimization changes the trajectories a judge encounters. Fifth, medical, personal-health, and real-repository uses also raise privacy, accountability, update governance, expert disagreement, and auditability issues. ClinConsensus and RubricsTree illustrate the value of expert anchors and hierarchies, while showing that automation does not erase these costs. [ClinConsensus](https://arxiv.org/abs/2603.02097) [RubricsTree](https://arxiv.org/abs/2606.18203)

## Open questions and research agenda

**Rubric adequacy benchmarks.** The immediate gap is counterfactual testing of rubrics themselves: construct alternative passes, single-failure near misses, and adversarial bypasses per criterion, measuring coverage and discrimination through criterion-level true/false positives. RubricBench provides an expert-atomic starting point that still needs links to executable behavior and mutation testing. [RubricBench](https://aclanthology.org/2026.acl-long.1439/)

**Specification-first verification with multiple correct solutions.** Derive criteria from external behavior, contracts, and invariants rather than gold-patch syntax/files. A heterogeneous ensemble of property-based tests, metamorphic relations, static analysis, and semantic judges is promising; report alternative-solution acceptance explicitly.

**Rubric–policy co-evolution.** Once used in RL, DPO, or search, ask whether rubrics still represent objectives against actively optimizing policies. Go beyond best-of-N to frozen anchor rubrics, independent post-training tests, red-teaming, replay relabeling, and reward-hacking success rates. RaR, OpenRS, SWE-TRACE, and AdaRubric demonstrate potential while making audits prerequisites. [RaR](https://arxiv.org/abs/2507.17746) [OpenRS](https://arxiv.org/abs/2602.14069) [SWE-TRACE](https://arxiv.org/abs/2604.14820) [AdaRubric](https://arxiv.org/abs/2603.21362)

**Causal validity of process signals.** A behavior common in successful traces need not cause success. Compare sibling actions from identical states, or use counterfactual replay/step ablation to measure success changes after removing a process item, moving PRMs beyond language-style critics toward causal verifiers.

**Independent domain, language, and harness holdouts.** Generalization cannot be measured only through English paraphrases. Retain domain, language, tool/harness, judge, and generator holdouts. Chinese logic and clinical contexts deserve independent domain treatment rather than translated English benchmarks. [LLMEval-Logic](https://arxiv.org/abs/2605.19597) [ClinConsensus](https://arxiv.org/abs/2603.02097)

**Human collaboration and version governance.** Prioritize human effort for high-disagreement, low-confidence, high-risk, or high-reward-gradient frontier cases instead of authoring every item from scratch. Version criterion provenance, generating models/prompts, editors, validation examples, known exploits, and withdrawal histories. These support both reproducibility and high-stakes governance.

## Closing perspective

Rubric construction should focus on evaluation rules remaining valid against requirements, evidence, and optimized policies. Fixed-dimension judges provide diagnostic starting points; question-specific and hierarchical rubrics bring task structure; automatic generation and rewards scale feedback while amplifying omissions, shared bias, and hacking. For coding agents, anchor final correctness in executable hard gates, provide dense feedback through atomic process rubrics, and continuously test the gap using alternative correct solutions, mutations, adversarial traces, and human review.
