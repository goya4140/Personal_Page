A research review can contain many citations yet miss the actual question. Another report may read fluently while confusing correlation with causation. Evaluating such outputs involves facts, arguments, and practical value. How can we tell whether an agent change actually helps?

This post reads Cameron R. Wolfe's technical blog **[Evaluating Agents on Highly Subjective Tasks](https://cameronrwolfe.substack.com/p/subjective-evals)**, published on October 21, 2026. Its roadmap connects human evaluation to define quality, calibrated automatic evaluation for rapid iteration, and production monitoring to check real use and return new problems to evaluation. It offers practical guidance without a unified controlled experiment validating the entire roadmap. We briefly outline the argument, then develop an independent research-report example using primary research.

## 1. Topic: what are we measuring in open-ended work?

Consider an agent asked to compare medical prediction methods and recommend an experiment. We care whether sources support the claims, whether comparisons are fair, and whether the recommendation is executable. These questions can yield different verdicts.

“Subjective” needs unpacking. **Some quality is verifiable, some depends on the task, and some reflects reviewer preferences.** A reported sample size can be checked. Required literature coverage depends on the question. Appropriate concision also depends on the reader's expertise. Compressing everything into an overall score of eight conceals the part that needs improvement.

Our focus is measurement design: define the desired improvement, identify who can judge it and from which evidence, then determine the precision needed for the next decision.

## 2. Related work: judges, statistics, and workflow

| Primary material | Evidence it contributes | Our reading perspective |
| --- | --- | --- |
| [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685v4) | Studies agreement with human preferences and position, verbosity, and self-enhancement biases | Reliability in the current domain requires separate validation |
| [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) | Discusses intervals, question clusters, repeated generation, paired comparisons, and power analysis | Interpret score differences alongside uncertainty |
| [Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents) | Examines evaluation maintenance through tasks, trajectories, artifacts, and graders | Investigate grading errors, environment problems, and agent failures separately |

These address the suitability of the measuring instrument, measurement precision, and workflow fidelity. Wolfe places these concerns in continuous development. The review sheet and validation plan below are our application design.

## 3. Questions: our three-part reading

1. **Can quality definitions point to inspectable evidence?** Separate factual correctness, argument quality, and presentation preferences.
2. **Can automatic scores support selection?** Check both judge errors and whether differences exceed sampling and execution noise.
3. **Can offline conclusions help actual research?** After winning on fixed tasks, does an output become easier to verify, use, or revise?

These are our organizing questions rather than questions quoted from the author.

## 4. Method: applying the roadmap to research reports

The diagram and this section are an **illustrative implementation plan** showing which records we would retain. They are neither an original source figure nor a software architecture released by Wolfe.

![An illustrative research-report evaluation workflow: evidence criteria, independent checks, version comparisons, and researcher feedback](../assets/img/blog/subjective-evals/workflow-en.svg "Figure 1. Our proposed research-report evaluation workflow. Each stage retains inspectable records; the dashed path returns problems found during use to a future evaluation version. This is an application example, not a completed experiment.")

### Step 1: write checks before discussing an aggregate score

For a task asking for a comparison of three medical prediction methods and an external-validation experiment, we could use this sheet.

| Dimension | Evidence to inspect | Illustrative decision rule |
| --- | --- | --- |
| Factual support | Source passages, tables, and corresponding report claims | Core numbers have sources that actually support the claims |
| Valid comparisons | Populations, data splits, metrics, and external-validation conditions | Numbers from different test conditions are not treated as direct evidence of superiority |
| Executable experiment | Data needs, controls, endpoints, and constraints | The proposal includes workable controls and a prespecified endpoint |
| Uncertainty | Missing, conflicting, or insufficient evidence | Unconfirmed conclusions are explicitly marked |

Two roles matter: **the rubric specifies the checks; the judge performs them.** Humans or models can apply the same rules, with programs assisting some checks. Locating a DOI establishes that a source is findable, not that it supports a claim.

To expose ambiguity, we propose having two reviewers independently inspect the same reports, then compare their evidence annotations. Disagreement may reflect an overlooked passage or different interpretations of sufficient external validation. Record the reason and preserve reasonable differences in preference rather than removing important criteria merely to increase agreement.

### Step 2: separate judge development from independent acceptance checks

We propose retaining records containing the task, report, evidence locations, human decisions, and rationales. Use one portion to revise judge prompts and another for independent acceptance checks. Repeatedly inspecting acceptance results and changing rules turns that portion into development data; fresh checks are then needed.

Inspect unsupported reports that pass and valid reports that fail. Per-criterion results can expose a judge that agrees overall yet misses critical factual errors. Given documented position and verbosity biases, our paired comparisons would also conceal system identity and swap presentation order to check verdict changes. [See Section 3 of the MT-Bench paper](https://arxiv.org/html/2306.05685v4#S3).

### Step 3: retain question-level pairing when comparing versions

Have both agent versions answer the same questions and retain each question's score difference. Shared questions help control difficulty variation. Analyze these paired differences rather than only the two aggregate scores. [See Section 4 of the statistical paper](https://arxiv.org/html/2411.00640v1#S4).

Questions derived from one paper may be correlated, requiring uncertainty calculations that consider source-paper clusters. Repeated generation helps estimate variation within a question but adds no new research topics. Expanding topic coverage and rerunning existing questions are different uses of evaluation budget.

### Step 4: record what researchers use and why they revise it

Our application proposal retains adoption, revision, and abandonment records, with researchers' specific explanations. “A critical baseline was added” is easier to turn into a test case than an unexplained positive rating.

Interpret these signals carefully. Longer reading time may reflect usefulness or more difficult verification. Retaining a citation alone does not establish correctness. A real-use comparison should specify assignment, primary endpoint, observation window, and cost accounting before results are observed.

## 5. Evidence and validation boundaries

### Overall evidence: the roadmap still needs validation in its target setting

The source blog gives no unified sample, baseline, cost measurement, and statistical test quantifying the roadmap's net benefit. It therefore does not establish a particular accuracy gain or labor saving. Its contribution is an organizing approach; benefits require validation in the target workflow.

Primary judge research supports approximating some human judgments while documenting biases. Statistical research supports uncertainty analysis for differences. Neither establishes that a particular scientific judge is already reliable. Acceptance should concern the current combination of task, rules, and judge.

### Teaching calculation: why a change from 60% to 70% needs care

The following is **our synthetic example**, not a result from the blog, cited papers, or actual agents. Assume 100 independently sampled research questions, one run per version, and binary judgments under fixed review rules.

| Paired outcome on the same question | Questions |
| --- | ---: |
| Both versions pass | 48 |
| Only the old version passes | 12 |
| Only the new version passes | 22 |
| Neither passes | 18 |
| Total | 100 |

The old version passes 60 / 100 and the new version 70 / 100: **10 percentage points** higher. Define each difference as new minus old, taking values −1, 0, or 1. Its mean is 0.10, sample variance 1 / 3, and standard error about 0.0577. A normal-approximation 95% confidence interval for the difference is approximately **[−1.3, 21.3] percentage points**, including zero.

Under this setup, evidence is insufficiently precise to confirm improvement using that two-sided interval. It does not establish equivalence either. Independence and sampling assumptions matter; shared sources or systematic judge errors require additional treatment.

If each version generates 3 reports per question and a model judge grades each report 3 times, that produces **600 generations and 1,800 judgments**, still covering **100 questions**. Preserve the question–generation–judgment hierarchy rather than treating the judgments as independent research tasks. Report average run performance here; selecting the best report per question changes the evaluation target.

### How we propose testing this design

First compare holistic grading, a criterion-level rubric, and a rubric accepted against independent human data. Grade the same reports, measuring missed critical errors, rejected valid reports, disagreement with blinded experts, and time and cost per report. This tests the grading design.

Then hold grading fixed and compare agent versions, reporting paired differences, intervals, topic-level results, and total costs. This tests agent improvement. Testing the complete workflow additionally requires comparing researchers' real task quality and effort. These experiments answer different questions and cannot substitute for one another. We have not conducted them.

## 6. Our reflections

### Topic: what this field is studying

We care about a traceable chain of judgments: what counts as good, where the evidence is, who judged it, and which decision the judgment supports. For scientific agents, polished reports, higher reviewer scores, and more reliable conclusions require distinct measurements.

### Limitations: what remains unresolved

First, expert consensus can miss important perspectives, particularly concerning novelty and research value. Second, repeated optimization against a fixed judge may reward appealing presentation. Third, source reading, experimental checks, and expert time may cost more than report generation. These are our application concerns, pending validation.

### Directions: how these problems could be investigated

For the first concern, preserve disagreement rationales and reviewers from different fields, checking whether minority views expose evidence gaps. For the second, retain development-independent topics, judges, and human audits to test transfer. For the third, investigate risk-based verification: screen sources and numbers, then route critical claims or disputed reports to experts. Compare error discovery and downstream decision quality under equal budgets. These are testable proposals.

*Scope: the blog's public text, accessed 2026-11-22, supplemented by the linked primary research and official engineering guide. This is an independent reading, not a full translation. Diagrams, tables, and numerical cases are our own teaching materials. We claim neither a system reproduction nor completed user experiments.*
