If a model answers many difficult scientific questions correctly, can we entrust it with research? Scientific Discovery Evaluation (SDE) evaluates both answers in research scenarios and performance on iterative projects. Its design helps us reconsider what evidence to trust when selecting research models.

## 1. Background: evaluating AI’s research capabilities

Suppose we want a better-performing material. Research involves interpreting existing data, proposing candidates, obtaining computational or experimental feedback, and adjusting the search. Answering a knowledge question supports only one part of that process.

**Research-capability evaluation asks whether models make useful judgments under specific research conditions and use feedback to advance a task.** It therefore includes local abilities and sustained action: the former identifies weaknesses; the latter tests whether those abilities work together.

The central difficulty is relating easily measured scores to the research performance we actually care about. Question accuracy, candidate validity, and final project benefits provide evidence at different levels.

## 2. Related work: from scientific questions to research tasks

Existing evaluations approach this through knowledge, executable tasks, and replication.

| Work | Main evaluation target | Perspective for this paper |
| --- | --- | --- |
| [GPQA](https://arxiv.org/abs/2311.12022) | Difficult scientific multiple-choice questions written by experts | Which scientific knowledge and problem-solving abilities does a model have? |
| [ScienceAgentBench](https://arxiv.org/abs/2410.05080) | Data-driven tasks from real papers, checking programs, execution, and cost | Can a model turn requirements into executable artifacts? |
| [PaperBench](https://arxiv.org/abs/2504.01848) | Reproducing ML papers from scratch using hierarchical assessment | How can multi-stage research be decomposed and scored? |

SDE links projects, scenarios, and questions, while adding candidate generation, computational validation, and feedback to projects. We ask whether this explains why a strong question-answering model may not lead on research projects.

## 3. Research questions: which abilities need separate checks?

We organize the goals into three questions:

1. **Can research-oriented questions reveal differences hidden by general scores?** Broad fields need to be decomposed into specific research activities.
2. **Does more reasoning reliably improve these abilities?** Benefits should be checked by scenario, beyond aggregate scores.
3. **Does good question answering imply good project performance?** Models need to enter iterative search so the two levels can be compared.

These correspond to scenario profiles, reasoning-effort comparisons, and question–project comparisons. This article uses [v2, revised May 8, 2026](https://arxiv.org/abs/2512.15567v2). Model names and results refer to that paper’s experimental settings.

## 4. Method: two evaluation levels built from research projects

SDE is an evaluation design. We follow data construction, question evaluation, and project evaluation.

### Step 1: decompose projects into reusable research scenarios

Domain experts identify scenarios from real research interests, construct questions using public data, computational workflows, and manual writing, then review them. A scenario is a research unit reusable across projects, such as reaction prediction, spectral interpretation, or molecular-property estimation.

![SDE connects scientific fields, projects, research scenarios, and questions](../assets/img/blog/scientific-discovery-evaluation/framework.png "Figure 1 · Evaluation construction. Move from a field to projects, scenarios, and questions; eval marks project-level and question-level assessment. Source: original Figure 1c, v2 PDF p. 3, corresponding panel excerpted. Click to enlarge.")

Retrosynthesis, for example, works backward from a target molecule to starting materials and reaction routes. Multi-step planning draws on single-step retrosynthesis, reaction mechanisms, and forward prediction. Testing these scenarios separately helps locate project failures. The resulting set covers biology, chemistry, materials, and physics, with 43 scenarios and 1,125 questions.

### Step 2: construct question-level capability profiles

Models answer questions within scenarios and are scored using task-specific exact matching, numerical tolerances, or similarity measures. The authors compare overall performance while retaining scenario results, and vary reasoning effort to locate gains.

This addresses the first two questions: where models are reliable and where additional reasoning helps. This level still primarily evaluates answers to questions.

### Step 3: run hypothesis–validation–observation loops on projects

The authors build sde-harness. In eight project types, models propose hypotheses, computational evaluators or simulators check them, and results feed the next round. Projects involve molecules, proteins, crystals, equations, and other search spaces. Evolutionary search provides a shared framework: retain stronger candidates and generate new ones, with task-specific adaptations where needed.

For transition-metal complex (TMC) optimization, the model receives candidate ligands, constraints, objectives, and initial samples, then proposes structures. Validity checks and property calculations generate feedback for the next round. **Evaluation examines how candidates improve through feedback, beyond the correctness of one answer.**

This addresses the third question and bounds the interpretation: the evaluation measures a model combined with specified search frameworks and computational tools, not complete real-laboratory research ability. [Methods: PDF pp. 15–18](https://arxiv.org/pdf/2512.15567v2#page=15).

## 5. Experiments and results: evidence for the three questions

### Question 1: what does scenario decomposition reveal?

The authors aggregate scenario scores by field while retaining individual scenarios. In the biology and chemistry example below, each point is a scenario. A model’s dispersed points show why field averages alone do not describe its abilities adequately.

![Scenario accuracies of ten models in biology and chemistry](../assets/img/blog/scientific-discovery-evaluation/scenario-profiles.png "Figure 2 · Distributions, beyond averages. Points represent scenarios; diamonds and horizontal lines indicate means and medians. Performance can vary widely across scenarios for one model. Source: original Figure 2a, v2 PDF p. 5; biology and chemistry panels excerpted with the model legend retained. Click to enlarge.")

For example, GPT-5 in the paper scores 0.85 on retrosynthesis and 0.23 on NMR spectrum-to-structure questions. This suggests model selection should target specific task stages, although the difference alone does not explain the causes of errors.

### Question 2: does more reasoning consistently help?

The paper compares GPT-5 at different reasoning-effort levels. The following excerpts field results for medium and high:

| Field | Medium | High | Difference (percentage points) |
| --- | ---: | ---: | ---: |
| Biology | 70% | 69% | −1 |
| Chemistry | 53% | 60% | +7 |
| Materials | 74% | 75% | +1 |
| Physics | 58% | 60% | +2 |

*Source: text on v2 PDF p. 7; related curves appear in Figure 3a. This compares reasoning configurations of the same model.*

The appropriate interpretation is that gains depend on field and configuration. Chemistry still improves by seven percentage points here, so it would be wrong to say extra reasoning is useless everywhere. Equally, greater effort cannot be assumed to help every field.

### Question 3: can question scores predict project performance?

Project experiments use iterative validation and compare models with conventional task-specific methods. Each project uses its own normalized metric. Bars support within-project comparisons, rather than a common research-capability score across projects.

![Normalized results for four models and conventional methods across eight project types](../assets/img/blog/scientific-discovery-evaluation/project-results.png "Figure 3 · Project-level evaluation. Eight tasks compare models with their respective reference methods, shown in orange. Metrics are normalized separately, so bar heights should not be compared directly across projects. Source: original Figure 4a, v2 PDF p. 10; project-results region excerpted. Click to enlarge.")

The paper illustrates two contrasting phenomena.

**Weak knowledge judgments can coexist with good project results.** Models are not strong on TMC property questions, yet three reasoning models use computational feedback to find highly polarizable structures within a constrained candidate space. The appendix tests this with five different initial sample sets.

![Polarizability over iterations and multi-objective search in TMC optimization](../assets/img/blog/scientific-discovery-evaluation/tmc-search.png "Figure 4 · TMC search. Left: high-polarizability candidates improve with iteration; the dashed line marks the maximum in the given 1.37-million-candidate space. Right: the Pareto frontier between two properties, comprising candidates for which no alternative is better on one objective and no worse on the other. Source: original Figure 4b, v2 PDF p. 10. Click to enlarge.")

**Strong local answers can still fail in multi-step planning.** Retrosynthesis projects require complete, valid multi-step routes. The paper analyzes invalid molecular representations and reaction-validity failures, reporting that these models did not surpass the corresponding conventional planners.

Our reading is that local accuracy, constraint satisfaction, and feedback-driven search separately influence project performance. These cases support checking them separately; they do not establish that project success is entirely attributable to mastery of the underlying science. [Results: PDF pp. 11–12; TMC setting: p. 49](https://arxiv.org/pdf/2512.15567v2#page=11).

## 6. Our reflections

### Understanding the field: what is being studied?

This field studies the relationship between evaluation metrics and real research tasks. We care about whether a score helps identify which activity a model can undertake and when tools or other models should supplement it. Local questions aid diagnosis; continuous projects test combined performance. The two levels should cross-check each other.

### Remaining limitations: which problems are unresolved?

- **Limited scope:** Four fields and eight project types cannot represent research broadly. Computational gains still need to be connected to real experimental value.
- **Difficult attribution:** Project performance depends jointly on models, prompts, search rules, and budgets. Rankings in the current configuration may not transfer to other workflows.
- **Uncertain scenario–project mapping:** Related questions offer clues, but more direct experiments are needed to identify which local ability causes which project failure.

### Possible solutions: which directions are worth exploring?

We would prioritize three corresponding directions:

- **Extend validation levels:** Establish the same two-level evaluation across more research topics and validate some computational candidates through independent experiments to test whether metrics track actual benefits.
- **Control variables beyond the model:** Cross models, prompts, and search strategies under similar budgets, reporting variability across runs and benefits per unit cost.
- **Intervene on specific failures:** Add structure and reaction validation to multi-step routes and compare project success before and after. A substantial reduction in failure would provide stronger evidence about the bottleneck.

These are our proposed next steps. In practical research, we would first identify critical task stages and examine evidence at both those stages and the complete workflow, rather than adopt a model based on one general score.

*Based on [Evaluating Large Language Models in Scientific Discovery, arXiv v2](https://arxiv.org/abs/2512.15567v2). Figures excerpt corresponding original panels, with surrounding material cropped and no redrawing or data changes; copyright belongs to Zhangde Song et al. Tables excerpt original data. Extended interpretations and validation directions are our analysis.*
