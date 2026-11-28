AI can solve increasingly difficult science questions, but which research activities does that qualify it to undertake? FrontierScience evaluates Olympiad-style problem solving and open-ended research subtasks on separate tracks. Following expert authoring, review, grading, and model comparisons shows what evidence the benchmark provides and what remains outside its scope.

This article uses [arXiv v1, dated January 29, 2026](https://arxiv.org/abs/2601.21165v1). Model names and scores refer to the paper’s experimental settings at that time.

## 1. Background: how should scientific capabilities be evaluated?

Studying a material may involve several levels of work: calculating a physical quantity from given conditions, explaining an experimental observation, identifying a worthwhile question, and designing experiments whose feedback changes the research direction.

These activities need separate evaluation. Knowledge questions provide local evidence; assessing research support also requires checking multi-step reasoning, constraint satisfaction, and sufficient justification.

**The central question is which activity in the research process an evaluation score actually measures.** Making questions difficult is one task. Establishing whether their scores help predict practical research performance is another relationship that needs validation.

## 2. Related work: what has been measured before?

| Work | Main evaluation target | Remaining question |
| --- | --- | --- |
| [GPQA](https://arxiv.org/abs/2311.12022) | Difficult scientific multiple-choice questions written by experts | How well does selecting the correct answer reflect independent derivation? |
| [OlympiadBench](https://arxiv.org/abs/2402.14008) | Competition-level mathematics and physics, including open answers | Published questions may introduce contamination; competitions also leave open-ended research judgments untested |
| [PaperBench](https://arxiv.org/abs/2504.01848) | Understanding papers, implementing code, and executing replication experiments | Replication combines reasoning, engineering, and execution, requiring further diagnosis of each ability |

FrontierScience occupies an intermediate level: it retains science questions with relatively definite answers and adds research subtasks requiring multi-step explanation, argument, and judgment. The aim is a more difficult, original, and diagnostically useful evaluation of scientific reasoning.

## 3. Research questions: what does the paper aim to establish?

We organize the goals into three reading questions that guide the methods and experiments below. This is our synthesis, rather than a verbatim list from the authors.

1. **How can difficult, original, and verifiable science questions be constructed?** Difficulty, complete conditions, and answer correctness must all be checked.
2. **How should open-ended research answers be scored?** Evaluation needs to identify specific omissions in reasoning and explanation, beyond final-answer correctness.
3. **Where do current models differ?** Compare overall performance on both task types, then examine the benefits of greater reasoning effort.

## 4. Method: from expert authoring to automated grading

### Step 1: separate capabilities into two evaluation tracks

The public gold set contains 160 questions across Olympiad and Research. The larger initial question pool is not fully released; the authors retain some questions to monitor potential contamination of the public set.

| Track | Public questions | Task format | Grading basis |
| --- | ---: | --- | --- |
| Olympiad | 100 | Competition-style scientific reasoning, usually with a definite short answer | Equivalence of numbers, expressions, or names |
| Research | 60 | Open-ended subtasks that may arise during PhD research | A task-specific 10-point rubric |

The public Research set contains 20 questions each in physics, chemistry, and biology. Authors include doctoral candidates, postdoctoral researchers, and professors. Problems must supply the background, variables, and assumptions required for reasoning. This already bounds the evaluation: [models mainly solve given problems rather than choose research directions themselves](#reading-note-task-scope).

### Step 2: check question quality through independent review

![FrontierScience task construction: authoring, review, resolving disagreements, and revision](../assets/img/blog/frontierscience/task-pipeline.png "Figure 1 · Task construction. Independent experts check factuality, verifiability, objectivity, and difficulty, discuss disagreements, and revise questions. Source: original Figure 3, PDF p. 4. The third box is still labeled REVIEW in the diagram; the text and caption call this stage Resolution. Only surrounding page material was cropped; not redrawn. Click to enlarge.")

Review checks sufficient conditions, correct answers, and originality alongside difficulty. Research receives at least two independent reviews followed by an overall review. Unresolved disagreement can lead to a question being discarded.

The lesson is that **difficult questions also need quality control**. Missing information and ambiguity can cause model failure without demonstrating a lack of reasoning ability.

### Step 3: decompose open answers into checkable criteria

[Each Research question has a rubric totaling 10 points](#reading-note-rubric-construction), with specific requirements and possible partial credit. The chemistry example separately examines limitations of synthesis methods, electronic structure, spectroscopy, and reactivity. Mentioning concepts can therefore receive a different assessment from correctly connecting them.

Both tracks use GPT-5 high as the model grader. Olympiad checks equivalence to a reference answer; Research sums rubric credit, with **at least 7/10 points counted as success**. Automated grading scales evaluation, while making the reliability of both criteria and graders important. [See Section 2.3 and the grading prompts in Appendix B](https://arxiv.org/html/2601.21165v1#S2.SS3).

## 5. Experiments and results: overall performance before reasoning effort

### Main experiment: overall performance on the two tracks

The authors compare several frontier models. Olympiad scores average 20 independent trials; Research scores average 30. Research measures the share of responses earning at least 7 points, not mean rubric points. These results also do not select the best answer from repeated attempts.

Evaluation does not use browsing. GPT-5.2 uses xhigh reasoning effort, while other reasoning models use high, so computation is not fully matched across models.

![FrontierScience main results across models on Olympiad and Research](../assets/img/blog/frontierscience/main-results.png "Figure 2 · Main evaluation. Left: Olympiad accuracy. Right: Research success rate, with at least 7/10 points required. Results average 20 and 30 independent trials, respectively. Source: original Figure 6, PDF p. 7. Original values and error bars are retained; only surrounding material was cropped. Click to enlarge.")

The following excerpts four model results from Figure 6, retaining one decimal place.

| Model | Olympiad accuracy | Research success rate |
| --- | ---: | ---: |
| GPT-5.2 | **77.1%** | **25.2%** |
| Gemini 3 Pro | 76.1% | 12.4% |
| Claude Opus 4.5 | 71.4% | 17.5% |
| GPT-5 | 69.7% | **25.2%** |

The ranking changes are especially informative. Gemini 3 Pro approaches GPT-5.2 on Olympiad, but not on Research; GPT-5 ties GPT-5.2 on Research. This supports evaluating the two capabilities separately, beyond using one aggregate science score to judge suitability for research.

However, the tracks use different tasks and grading procedures. Their score difference cannot directly quantify a loss of ability. These experiments demonstrate model differences and remaining headroom, but **do not establish that the scores accurately predict real research outputs**.

### Additional analysis: how much does more reasoning help?

![Olympiad and Research results for GPT-5.2 and o3 at different reasoning-effort levels](../assets/img/blog/frontierscience/reasoning-effort.png "Figure 3 · Reasoning effort. Compare low, medium, high, and GPT-5.2’s xhigh settings within each model. GPT-5.2 improves on both tracks; o3’s Research curve is not entirely monotonic. Source: original Figure 8, PDF p. 8. Only surrounding material was cropped; not redrawn. Click to enlarge.")

The figure shows the following changes for GPT-5.2 from low to xhigh:

| Track | Low | Xhigh | Change (percentage points) |
| --- | ---: | ---: | ---: |
| Olympiad | 67.5% | 77.1% | +9.6 |
| Research | 18.2% | 25.2% | +7.0 |

More reasoning helps under these settings, but Research retains substantial headroom. The o3 results also suggest checking benefits by model and task; the small dip alone does not establish that more effort is inherently harmful.

The paper mainly compares models and reasoning effort. It does not use component ablations to separately quantify how expert review or a particular rubric design improves evaluation quality. The benchmark’s validity therefore needs further evidence.

## 6. Our reflections

### Understanding the field: what is being studied?

We see two relationships to establish: decomposing abstract scientific capabilities into observable tasks, and confirming whether task scores correspond to real research performance. FrontierScience offers a useful design for the first; the second still needs comparisons with projects and experimental outcomes.

### Remaining limitations: which problems are unresolved?

- **Limited evaluation scope.** Solving a supplied problem differs from discovering a valuable one. Textual answers also omit experimental operations, multimodal observations, and sustained research decisions.
- **Grading standards need independent validation.** Appendix B instructs the grader to follow the rubric strictly. A rubric that overlooks valid alternatives may penalize reasonable answers. The paper also lacks a human-performance baseline on this dataset.
- **Construction and resources affect interpretation.** Questions that internal models solve easily may be modified or discarded. Together with unmatched reasoning effort, this means scores are not everyday research-success probabilities, and rankings must retain their experimental conditions.

### Possible solutions: which directions are worth exploring?

These proposed directions correspond to the limitations above.

- **Connect question scores to complete projects.** Test whether higher-scoring models also execute experiments, reproduce findings, or improve candidates more effectively, establishing predictive value for practical work.
- **Evaluate rubrics independently.** Use blinded expert assessments, alternative correct solutions, and plausible incorrect solutions to measure false judgments and missed errors, alongside appropriately specialized human baselines.
- **Control question selection and reasoning budgets.** Compare models at similar cost, author questions independently of evaluated models, and report variation across subjects, scoring thresholds, and repeated runs.

These are proposals for future work. We would particularly like to know whether an evaluation helps identify which part of research a model can undertake, beyond producing difficult questions.

*Based on [FrontierScience arXiv v1](https://arxiv.org/abs/2601.21165v1). Figures belong to Miles Wang et al. and are reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Only surrounding page material was cropped; figures and data were not redrawn or altered. Tables excerpt the original figures. Interpretations and future research directions are our analysis.*
