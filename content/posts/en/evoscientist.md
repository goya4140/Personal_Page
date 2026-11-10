Research experience often becomes valuable in the next project: which directions deserve attention, which conditions previously caused failure, and which engineering practices can be reused. EvoScientist attempts to preserve this experience and make it available to subsequent research tasks.

This article reads **EvoScientist: Towards Multi-Agent Evolving AI Scientists for End-to-End Scientific Discovery**, by Yougang Lyu and colleagues, using [arXiv v2](https://arxiv.org/abs/2603.08127v2), updated October 5, 2026.

**Its central design separates experience about research directions from experience about experimental execution.** Experimental outcomes can also update the knowledge used for future ideation. The results support some benefits, while revealing a persistent difficulty in implementing proposed new methods.

## 1. Understanding the Topic: How Can Research Systems Learn from Experience?

Consider a team trying to improve a model under limited data. It must review literature, formulate a hypothesis, design experiments, implement code, and decide what to do after observing the results.

Two kinds of experience emerge. **Research experience** concerns hypotheses, assumptions, promising directions, and the meaning of negative results. **Engineering experience** concerns preprocessing, stable training, debugging, and resource-compatible configurations.

An autonomous research system needs to extract useful knowledge from these experiences, retrieve it for an appropriate task, and recognize whether it remains applicable. Saving logs alone does not accomplish this.

Evaluation should therefore distinguish proposal quality, reliable experimental execution, and improvement on future tasks.

## 2. Understanding Related Work: From Research Workflows to Reusable Experience

Four works provide useful entry points.

| Work | Main contribution | Connection to this paper |
| --- | --- | --- |
| [AI Scientist-v2](https://arxiv.org/abs/2504.08066) | Agentic tree search connecting experiments, analysis, and writing | Provides a foundation for research workflows and experimental search |
| [AI co-scientist](https://arxiv.org/abs/2502.18864) | Hypothesis generation, criticism, comparison, and refinement | Motivates iterative ideation and tournament selection |
| [Reflexion](https://arxiv.org/abs/2303.11366) | Stores linguistic reflections on feedback to guide later attempts | Demonstrates adaptation through textual experience |
| [Agent Workflow Memory](https://arxiv.org/abs/2409.07429) | Induces reusable workflows from previous execution | Treats trajectories as resources for future action |

These works advance workflow automation, idea search, and experience reuse. EvoScientist connects them through two memories supporting **researchers' direction judgments and engineers' experimental execution**.

It also feeds experimental failures back into the memory used to propose future research directions. [Sections 2–3](https://arxiv.org/html/2603.08127v2#S2).

## 3. Understanding the Research Questions: What Does the Paper Test?

The authors explicitly evaluate four questions in Section 4.1, paraphrased here:

1. **Idea quality:** How good are the generated ideas in novelty, feasibility, relevance, and clarity?
2. **Execution reliability:** How reliably can the system generate and execute experimental code?
3. **Complete research outputs:** Can it produce complete papers recognized through peer review?
4. **Evolution's contribution:** How much does learning from historical experience improve idea quality?

These questions use different evidence: model and expert judgments, execution outcomes, and selected submission cases. Their results need to be interpreted separately. [Section 4](https://arxiv.org/html/2603.08127v2#S4).

## 4. Understanding the Method: How Does Experience Reach the Next Project?

![Overview of EvoScientist linking the Researcher, Engineer, and Evolution Manager through two memories](../assets/img/blog/evoscientist/overview.png "Figure 1 · The Researcher develops proposals, the Engineer executes experiments, and the Evolution Manager updates two persistent memories. Source: original v2 Figure 1, PDF page 4; reproduced without modification. Click to enlarge.")

### Step 1: Retrieve Direction Experience and Explore Ideas

The system receives a research goal identifying a model or task problem to address.

The **Researcher Agent, RA**, uses literature alongside an **Ideation Memory** containing promising and unsuccessful directions.

It performs a propose–review–refine tree search. Each node stores an idea and review feedback, which informs subsequent refinements.

The implementation searches up to **21 candidate ideas** and retrieves the **two most relevant ideation-memory items**. Its final proposal is therefore the product of exploration and selection. [Sections 3.3 and 4.5](https://arxiv.org/html/2603.08127v2#S3.SS3).

### Step 2: Select and Expand a Proposal

An **Elo-based tournament** compares candidates using novelty, feasibility, relevance, and clarity.

Candidates are compared pairwise and their ratings updated. The top-ranked idea becomes a full proposal containing background, related work, the method, an experimental plan, and expected results. The top three ideas inform direction-memory updates.

**A strong tournament ranking indicates promise; experimental validation remains necessary.**

### Step 3: Retrieve Engineering Experience and Run Four Experimental Stages

The proposal goes to the **Engineer Agent, EA**.

EA retrieves the most relevant item from an **Experimentation Memory** storing data-processing and training strategies, then proceeds through four stages:

| Stage | Purpose |
| --- | --- |
| Initial implementation | Establish working experimental code |
| Hyperparameter tuning | Improve the initial configuration |
| Proposed method | Implement the research proposal's new method |
| Ablation | Examine component contributions |

Each stage searches, executes, and revises code while retaining logs, status, and metrics. The best-performing implementation carries the process forward.

Maximum attempt budgets are **20, 12, 12, and 18**. EA retrieves **one experimentation-memory item**. These budgets matter when interpreting performance: the system benefits from multiple searches and repair attempts. [Sections 3.4 and 4.5](https://arxiv.org/html/2603.08127v2#S3.SS4).

### Step 4: Distill Three Types of Reusable Experience

The **Evolution Manager Agent, EMA**, summarizes history and updates the two memories through three mechanisms.

| Mechanism | Evidence used | Knowledge retained |
| --- | --- | --- |
| Idea Direction Evolution, IDE | Top-three candidate ideas | Hypotheses, assumptions, requirements, and minimal validation plans |
| Idea Validation Evolution, IVE | Proposal and execution report | Failure judgments, conditions, evidence, and countermeasures |
| Experiment Strategy Evolution, ESE | Exploration trajectories and strong implementations | Preprocessing, architecture, and training configurations |

IVE records failure when no executable implementation is found within budget, or when the completed method performs worse than its baselines.

This connects execution back to ideation, but requires careful interpretation. **An implementation failure can reflect limited resources or engineering capability. A negative comparison can reflect implementation, tuning, or evaluation choices.** Memories need sufficiently specific failure conditions.

The appendix prompts request evidence, trigger conditions, and countermeasures. They also group validated and inconclusive outcomes under `NOT_FAILED`, so that label alone does not establish validation. [Section 3.5 and Appendix D](https://arxiv.org/html/2603.08127v2#S3.SS5).

The described evolution operates through **external memory updates and retrieval-augmented prompts**. The paper does not describe training the foundation-model weights or automatically redesigning the complete agent architecture.

## 5. Experimental Design and Results: Where Do the Benefits Appear?

### Main Evaluation 1: Idea Quality

The evaluation uses **30 research goals**, covering translation, speech recognition, healthcare agents, Text-to-SQL, RAG, model efficiency, and alignment.

Seven systems are compared: Virtual Scientist, AI-Researcher, InternAgent, AI Scientist-v2, Hypogenic, Novix, and K-Dense.

Evaluation includes:

- **Automated judgments:** Gemini-3-flash scores idea pairs, with presentation order swapped to reduce positional bias.
- **Expert judgments:** Three PhD-level AI experts evaluate **120 pairs: 30 goals across four comparison groups** involving stronger baselines.

Feasibility concerns rigorous, testable research design and realistic resources. Clarity emphasizes actionability. These judgments do not directly measure experimental success. [Section 4 and Appendix C](https://arxiv.org/html/2603.08127v2#S4).

The human results below report **EvoScientist's win/tie/lose percentages**:

| Baseline | Novelty | Feasibility | Relevance | Clarity |
| --- | ---: | ---: | ---: | ---: |
| InternAgent | 66.67 / 23.33 / 10.00 | 96.67 / 3.33 / 0 | 90.00 / 0 / 10.00 | 93.33 / 6.67 / 0 |
| AI Scientist-v2 | 73.33 / 10.00 / 16.67 | 50.00 / 16.67 / 33.33 | 43.33 / 50.00 / 6.67 | 53.33 / 20.00 / 26.67 |
| Novix | 93.33 / 0 / 6.67 | 56.67 / 6.66 / 36.67 | 36.67 / 60.00 / 3.33 | 73.33 / 10.00 / 16.67 |
| K-Dense | 96.67 / 3.33 / 0 | 53.33 / 26.67 / 20.00 | 40.00 / 43.33 / 16.67 | 53.34 / 43.33 / 3.33 |

*Source: Table 2, PDF page 6; original rounding retained.*

Across these comparisons, the average human novelty win rate is **82.50%**, and feasibility win rate is **64.17%**. Automated evaluation also reports positive aggregate advantages against all seven baselines. [Section 5.1, Tables 1–2](https://arxiv.org/html/2603.08127v2#S5.SS1).

These findings support **stronger evaluator preference for the generated proposals under the tested goals and criteria**.

The advantages are uneven: against AI Scientist-v2, feasibility wins are 50.00% versus 33.33% losses, and relevance ties reach 50.00%. Commercial comparisons also show many relevance ties. Better proposal judgments do not establish that the proposed methods are generally more effective after execution.

The paper reports consistent tasks and evaluation protocols, but does not fully enumerate baseline model choices, token use, and search costs. The system-level differences therefore cannot all be attributed to memory.

### Main Evaluation 2: Code Execution

Code evaluation takes research proposals as input and measures successful sandbox execution producing valid outputs.

The principal comparison is **the same system before and after ESE**, rather than a complete execution comparison against the seven external systems. [Section 5.2](https://arxiv.org/html/2603.08127v2#S5.SS2).

![Execution success before and after experiment strategy evolution across four stages](../assets/img/blog/evoscientist/execution-success.png "Figure 2 · Gray bars represent the system without ESE; blue bars represent the full system. Initial implementation and ablation improve more than proposed-method implementation. Source: original v2 Figure 2, PDF page 7; surrounding page content cropped, with the chart unchanged. Click to enlarge.")

| Stage | Before | After | Improvement |
| --- | ---: | ---: | ---: |
| Initial implementation | 29.23% | 42.93% | +13.70 pp |
| Hyperparameter tuning | 48.94% | 58.62% | +9.68 pp |
| Proposed method | 20.33% | 21.57% | +1.24 pp |
| Ablation | 39.06% | 55.12% | +16.06 pp |
| Arithmetic mean across stages | 34.39% | 44.56% | +10.17 pp |

**The aggregate improvement leaves a clear bottleneck:** initial implementation and ablation improve substantially, while implementing the proposed method remains difficult.

Our interpretation is that preprocessing and training experience may transfer more readily than the work required to translate a new research idea into code. This is consistent with the results, but the paper does not experimentally isolate those causes.

The **44.56%** figure is an average across stages. It is not an end-to-end research completion rate. Successful execution also requires additional checks for methodological fidelity and protocol correctness.

### Main Evaluation 3: Complete Research Outputs

The authors develop six selected ideas into papers submitted to the **ICAIS 2025 AI Scientist Track**:

| Item | Reported outcome |
| --- | --- |
| Submitted papers | 6 |
| Accepted papers | 6 |
| Awards | 1 Best Paper Award; 1 AI Reviewer's Appraisal Award |
| Track-wide acceptance | 26 / 82, approximately 31.71% |

Manuscript preparation uses the AI Scientist-v2 writing module; the proposed evolution mechanisms focus on ideation and execution. [Sections 4.2 and 5.3, Appendix E](https://arxiv.org/html/2603.08127v2#S5.SS3).

We also checked the best-paper case's [public decision page](https://airaxiv.com/papers/view/2510.0018/), which displays `Accept`.

These cases demonstrate complete, reviewable outputs receiving recognition. However, **six accepted selected submissions do not establish a general end-to-end success rate**. The paper does not fully report the selection and failure denominator preceding those submissions, or provide a matched-budget submission comparison.

The authors' review synthesis also identifies needs for deeper theoretical analysis, clearer metrics, and more complete reproducibility documentation. These comments are part of the evidence about system capabilities.

### Ablations and Supporting Analysis: Contributions of Ideation Evolution

The authors remove evolution mechanisms and compare each variant against the full system. Values below are **the ablated variant's loss rates**, judged by Gemini-3-flash:

| Variant | Novelty loss rate | Feasibility loss rate |
| --- | ---: | ---: |
| Remove IDE | 66.67% | 50.00% |
| Remove IVE | 43.33% | 63.33% |
| Remove all ideation evolution | 80.00% | 83.33% |

*Source: Table 3, PDF page 8.*

The pattern broadly matches the design: promising-direction memory particularly supports novelty, while failure-validation memory particularly supports feasibility. Removing both produces larger declines. [Section 5.4](https://arxiv.org/html/2603.08127v2#S5.SS4).

These ablations support the value of memory in the evaluated setting. They leave open whether improvement persists over long task sequences, depends on task order, or suffers from interference across domains.

## 6. Our Reflections

### Topic Reflection: What Is This Field Studying?

Autonomous research requires decisions about what to do next based on available evidence. Experience connects past actions to future judgments.

The useful distinction here is between **direction knowledge** and **execution knowledge**, with experimental outcomes updating direction knowledge. This raises a broader question: how can local experiences become reliable, transferable scientific knowledge with explicit conditions of applicability?

Evaluation should examine whether experience reduces wasted attempts, improves new tasks, and produces better research decisions.

### Limitation Reflection: What Remains Unresolved?

**First, memories need clearer evidence levels.** Highly ranked ideas may remain untested. Execution failures can reflect resource constraints. Negative comparisons can reflect implementation or protocol choices. Memories should retain these conditions and uncertainties.

**Second, implementing new methods remains difficult.** Stage-three success rises only from 20.33% to 21.57%. Connecting proposal, code, and evaluation requires stronger support.

**Third, long-term evolution needs stricter evaluation.** Useful tests would specify historical versus future tasks, vary task order, control costs, and measure performance as experience accumulates.

**Fourth, complete-output evaluation has limited scope.** The six submissions are valuable cases, but the overall attempt denominator remains unclear. The authors also acknowledge that generalization beyond computational research to physical experimentation remains open. [Section 7](https://arxiv.org/html/2603.08127v2#S7).

### Solution Reflection: What Directions Could Address These Issues?

The following are our proposed research directions, corresponding to the four limitations:

1. **Store evidence status alongside each memory.** Separate untested hypotheses, engineering failures, negative experiments, and replicated findings. Retain datasets, resources, code versions, and trigger conditions, then test whether this reduces overgeneralization.
2. **Audit implementation against the proposal.** Break methods into checkable components, map them to code, key tensors, and metrics, and validate component behavior before full training. Measure both stage-three execution success and implementation fidelity.
3. **Run reproducible continual-learning evaluations.** Build memory from independent historical tasks, then evaluate future tasks using relevant, random, irrelevant, and length-matched context under controlled search budgets. This helps isolate the contribution of experience content.
4. **Report all attempts and their costs.** Include initial tasks, failures, completed artifacts, submissions, and acceptance denominators. Add independent reproduction and blind evaluation, and introduce real experimental feedback when extending to other domains.

*Based on arXiv v2 by Yougang Lyu and colleagues. Figures belong to the original authors and are reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Figure 1 is unchanged; Figure 2 crops only surrounding page content. Tables are extracted from the paper. Interpretations, limitations, and proposed experiments are our analysis.*
