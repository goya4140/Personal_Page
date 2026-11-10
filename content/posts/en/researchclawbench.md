A research agent can read papers, run code, generate figures, and deliver a complete report. But do those artifacts answer the question, follow the right experimental protocol, and provide sufficient evidence? ResearchClawBench evaluates this chain by supplying a research objective, related literature, and data while retaining the target paper on the evaluation side.

This article reads **ResearchClawBench: A Benchmark for End-to-End Autonomous Scientific Research**, by Wanghan Xu and colleagues at Shanghai Artificial Intelligence Laboratory, using [arXiv v5](https://arxiv.org/abs/2606.07591v5), updated July 3, 2026. Results refer to that paper snapshot, separately from the continually updated project leaderboard.

## 1. Understanding the Topic: How Can We Tell Whether AI Completed Research?

Suppose an AI system is asked to explain a delayed rainy season using climate data. It must understand the background, inspect variables and time ranges, design analyses, execute code, and explain how evidence supports its hypotheses.

A fluent report with many figures can still use the wrong timescale, omit necessary comparisons, or present correlation as mechanism. The existence of output files and academic-looking prose does not resolve these issues.

**End-to-end research evaluation asks whether a system can connect data, experiments, evidence, and conclusions around a scientific objective.** Execution and scientific judgment both matter.

Research permits multiple valid routes. A rigid answer key can penalize useful alternatives; unconstrained judgment can mistake plausible presentation for discovery. Evaluation needs both verifiable references and room to surpass them.

## 2. Understanding Related Work: From Scientific Code to Paper Replication

Three benchmarks provide direct context.

| Work | Main evaluation target | Difference from this paper |
| --- | --- | --- |
| [SciCode](https://arxiv.org/abs/2407.13168) | Scientific problems decomposed into coding subproblems involving knowledge, reasoning, and implementation | Focuses on scientific programming within a smaller workflow scope |
| [ScienceAgentBench](https://arxiv.org/abs/2410.05080) | Data-driven tasks from real research, evaluated through generated programs, execution results, and costs | Focuses on particular workflow tasks with program-file outputs |
| [PaperBench](https://arxiv.org/abs/2504.01848v3) | Implementing methods and executing replication experiments from a supplied target paper | Exposes the target paper to the system |

ResearchClawBench emphasizes **re-discovery with a hidden target paper**. Systems receive task descriptions, related literature, and data, then develop and execute their analyses. Evaluators use the target paper as a scoring reference. Coverage includes astronomy, chemistry, Earth science, energy, information, life science, materials, mathematics, neuroscience, and physics.

The scope of re-discovery is specific: tasks supply the scientific objective and sometimes method requirements. They do not fully evaluate autonomous problem selection. [Sections 2–3](https://arxiv.org/html/2606.07591v5#S2).

## 3. Understanding the Research Questions: What Does This Benchmark Ask?

The following questions are our reading synthesis, rather than a verbatim list from the authors.

1. **How can real research become executable tasks?** Objectives, available data, and scoring requirements must align.
2. **How can open-ended artifacts be evaluated?** A target-paper reference should support verification while allowing alternative routes and stronger evidence.
3. **Where do current systems struggle?** Evaluation should distinguish execution failure, goal deviation, insufficient evidence, and missing scientific mechanisms.

The method therefore centers on task construction, execution environments, and scoring. The experiments examine aggregate performance, disciplinary variation, and concrete failure behaviors.

## 4. Understanding the Method: From Published Research to Checkable Tasks

![ResearchClawBench task packages, action space, system interfaces, and report evaluation](../assets/img/blog/researchclawbench/overview.png "Figure 1 · Task materials and expert criteria appear at upper left, research actions in the center, and agents or ResearchHarness at right. The lower pipeline links code, artifacts, and reports. Rubrics remain on the evaluation side. Source: v5 PDF Figure 2, page 6; HTML Figure 1. Original image unchanged; click to enlarge.")

### Step 1: Select Reference Research and Build Task Packages

Domain experts select papers with clear questions, accessible data, and research value. They extract the question, collect literature and data, and construct rubrics around key scientific artifacts. Cross-checking then corrects or removes unsuitable tasks.

Version v5 contains **40 tasks across 10 domains, with 4 tasks per domain**. The two main types are diagnostic analysis and target optimization, emphasizing explanations and mechanisms or quantitative objectives and performance.

Systems receive task descriptions, related literature, and data. **Target papers and associated evaluation materials remain on the evaluation side.** Packages include experimental or simulated results as well as processed features, posterior samples, and figure data. Starting from raw data should therefore be interpreted task by task. [Sections 3.1–3.2 and Appendix B](https://arxiv.org/html/2606.07591v5#S3).

### Step 2: Conduct Research with Tools and Submit Artifacts

Existing research or coding agents use their own frameworks. The authors also provide **ResearchHarness**, a lightweight ReAct loop for models to inspect observations, call tools, execute analyses, and iterate.

It includes web and scholarly search, text/PDF/image inspection, file editing, shell execution, persistent terminals, and context compaction. ResearchHarness scores therefore include the assistance of a tool environment; they are not measurements of isolated single-response model ability.

Expected deliverables include analysis code, intermediate results, figures, and a final report. The paper acknowledges that evaluation currently concentrates on the final report rather than a comprehensive audit of individual research steps. [Section 3.3](https://arxiv.org/html/2606.07591v5#S3.SS3).

### Step 3: Decompose the Reference into Weighted Scientific Requirements

Each rubric item contains a criterion, technical keywords, a weight, and a text or image type. Text items assess scientific content; image items compare target and generated figures for important trends, scales, and evidence.

The paper's Table 2 example, **Astronomy_000**, constrains ultralight-boson properties from black-hole mass and spin posterior samples. Two input sets contain **10,000** and **1,838** samples. Its simplified rubric requires:

| Scientific requirement | Weight |
| --- | ---: |
| Correctly ingest and summarize mass/spin posteriors as observational constraints | 20% |
| Integrate posterior samples to obtain the M33 X-7 exclusion curve at the 95% threshold | 30% |
| Derive upper limits on self-interaction coupling across the relevant mass range | 50% |

Reading the data is only part of the task. Greater weight is assigned to how observations support scientific constraints. This table follows the original example without treating its target-paper listing as an agent-visible input.

### Step 4: Assess Evidence with a Reference-Anchored Score

The authors introduce **Reference-Anchored Discovery Score, RADS**. Items use a hundred-point scale with target-paper-level evidence anchored in the middle:

| Score position | Meaning | Interpretation limit |
| --- | --- | --- |
| Below 50 | Important evidence or analysis remains weaker than the reference | Useful partial results can still exist |
| 50 | Reference-level scientific evidence | Depends on the criteria and evaluator |
| Above 50 | Evidence, quantitative results, or mechanistic analysis is judged stronger than the reference | Indicates discovery potential requiring independent validation |

![RADS reference levels for diagnostic analysis and target optimization](../assets/img/blog/researchclawbench/scoring.png "Figure 2 · The upper panel illustrates mechanistic depth; the lower panel illustrates polymer optimization. A score of 50 is designed to represent reference-paper-level evidence. This is a scoring schematic, not experimental proof of new discoveries. Source: v5 PDF Figure 4, page 9; HTML Figure 3. Original image unchanged; click to enlarge.")

The paper reports that **GPT-5.1** evaluates the report against rubrics after each run. Experts construct the standards and a model applies them; this does not mean every report receives expert blind review. [Sections 3.4 and 4.1](https://arxiv.org/html/2606.07591v5#S3.SS4).

As an implementation supplement, we inspected a [pinned official scorer version](https://github.com/InternScience/ResearchClawBench/blob/c19a320d3d3d40e370e59001cc219794c4261055/evaluation/score.py). It scores items and computes `total = sum(weight * item_score) / sum(weight)`. This snapshot clarifies aggregation; it does not reproduce every historical environment used for the paper.

## 5. Experimental Design and Results: How Far Are Complete Reports from Reliable Research?

### Main Evaluation: Agents and ResearchHarness Models

The paper compares **7 agent families** and **17 models running through ResearchHarness** on the same 40 tasks. Table 5 separately lists two EvoScientist versions, giving **8 agent configurations**. Values below are mean task rubric scores; higher is better.

| Agent configuration | Underlying model | Mean score |
| --- | --- | ---: |
| Claude Code | Claude-Opus-4.6 | 21.5 |
| EvoScientist v0.1.1 | GPT-5.4 | 18.8 |
| Codex CLI | GPT-5.4 | 18.4 |
| OpenClaw | GPT-5.4 | 16.6 |
| ResearchClaw | GPT-5.4 | 16.3 |
| EvoScientist v0.0.4 | GPT-5.4 | 15.5 |
| ARIS Codex | Codex / GPT-5.4 | 13.6 |
| Nanobot | GPT-5.4 | 12.8 |

*Source: v5 Table 5, PDF page 10.*

The leading five ResearchHarness score positions are shown below; see the original table for all models.

| ResearchHarness model | Mean score |
| --- | ---: |
| Claude-Opus-4.7 | 20.7 |
| Claude-Opus-4.6 | 19.9 |
| Qwen3.7-Max | 18.7 |
| GLM-5.1 | 18.2 |
| Qwen3.6-Plus | 18.0 |
| Kimi-K2.6 | 18.0 |

*The fifth score is tied, so six rows are included. Source: the same table.*

The direct finding is that **mean outputs remain substantially below the reference anchor of 50 under these tasks and criteria**. A score of 21.5 is not a 21.5% research completion rate. A mean below the anchor also does not imply that every individual task falls below it.

Overall ranking hides task variation. Claude Code leads on only 12 of 40 tasks. In the model group, different models lead different domains: Claude-Opus-4.6 leads astronomy, Earth science, energy, and mathematics; GLM-5.1 leads chemistry; Qwen3.7-Max leads physics. [Sections 4.1–4.2 and Table 5](https://arxiv.org/html/2606.07591v5#S4).

Framework comparisons must retain model differences. Claude Code uses Claude-Opus-4.6, while most other agents use GPT-5.4. Their gaps combine model and framework effects. Although the paper describes a unified protocol, it does not fully specify per-system hardware, token limits, and execution budgets needed for a strict equal-cost framework ranking.

### Supporting Analysis 1: Per-Task Frontiers and Report Quality

The **frontier mean** selects the highest observed system score for each task after evaluation, then averages those scores. It is a composite upper envelope of observed results. No deployed selector is shown to predict those winners, and it is not a single system's repeated-run average.

The v5 introduction reports an agent frontier mean of **24.6**, while Section 4.2 reports **25.8**. Recomputing Appendix Table 8 gives approximately **24.56** without the added EvoScientist v0.1.1 configuration and **25.84** with all eight configurations, matching the two rounded values. The model frontier mean is reported as **26.5**. These values require explicit configuration scope.

Report presentation and scientific evidence also need separate evaluation. Table 6 adds comprehensiveness, depth, instruction following, and professionalism. Three examples are extracted here:

| Agent | Main rubric score | Depth | Professionalism |
| --- | ---: | ---: | ---: |
| Claude Code | 21.5 | 58.0 | 76.4 |
| Codex CLI | 18.4 | 65.9 | 74.4 |
| ResearchClaw | 16.3 | 62.2 | 74.8 |

*Sources: Tables 5–6. Supplemental dimensions and the main rubric assess different objects with different anchors; subtracting their scores would not quantify a meaningful gap.*

Reports can exhibit professional presentation while lacking critical evidence. Table 6 covers the original seven agents, including EvoScientist v0.0.4 rather than the added version. [Section 4.3](https://arxiv.org/html/2606.07591v5#S4.SS3).

### Supporting Analysis 2: Does Greater Resource Use Produce Better Research?

The authors compare mean cost, runtime, and score using Pareto frontiers: observed configurations for which improving cost and score simultaneously is difficult.

Resource use and scores are positively associated overall, but this is an observational comparison across different systems. It cannot establish that increasing one system's budget improves research, or that additional computation must be ineffective. Model capability, framework, and stopping policy may vary together. [Section 4.4](https://arxiv.org/html/2606.07591v5#S4.SS4).

The paper does not provide systematic component-isolating ablations. These results primarily compare systems and analyze behavior.

### Supporting Analysis 3: Where Do Failures Occur?

The authors analyze **280 runs** from the original seven agents across 40 tasks and organize failures into six categories.

![Six error categories and corresponding task examples in ResearchClawBench](../assets/img/blog/researchclawbench/errors.png "Figure 3 · Experimental-design mismatch, evidence mismatch, and missing scientific core dominate the analysis. The displayed percentages should not be added as mutually exclusive shares; the paper does not provide item-level raw counts. Examples below compare expected and observed artifacts. Source: v5 PDF Figure 6, page 11; HTML Figure 5. Original image unchanged; click to enlarge.")

The leading categories illustrate what the benchmark examines:

- **Experimental-design mismatch:** A task requiring longer-horizon weather forecasting against specified baselines becomes a short-horizon persistence or linear-extrapolation analysis. Code runs, but the protocol changes.
- **Evidence mismatch:** Numbers, plots, or conclusions conflict with critical evidence.
- **Missing scientific core:** Relevant terminology and tools appear, but the required mechanism is not implemented or validated.

The remaining categories are goal misalignment, reliability/reporting failure, and execution failure. The analysis suggests that systems often perform substantial work before drifting away from the scientific requirements. [Section 4.5](https://arxiv.org/html/2606.07591v5#S4.SS5).

**Physics_002** illustrates this behavior. OpenClaw receives the reported score of 27.45 and recovers a direct trend of quantum-circuit fidelity declining with depth. It nevertheless omits multi-estimator consistency, mirror-circuit inference, and a gate-counting error model. The direct trend is only part of the evidence chain.

The case also has a reporting inconsistency: its five displayed weights sum to **105%**, while the current official scorer normalizes by total weight. The figure therefore cannot strictly reproduce 27.45 as a normalized score. The text presents item values as 47/50 and 40/50; under RADS, these are near the reference anchor of 50, which is not the maximum of the hundred-point scale. We retain the reported case score and use it to explain the missing verification steps. [Section 4.6](https://arxiv.org/html/2606.07591v5#S4.SS6).

## 6. Our Reflections

### Topic Reflection: What Is This Field Studying?

Research-agent evaluation makes the claim of completed research checkable. Code, figures, and reports must be traced back to the scientific objective and the claims they support.

The contribution here is to anchor evaluation in key artifacts of reference research while attempting to recognize stronger evidence. Workflow completeness and evidential sufficiency require separate examination.

### Limitation Reflection: What Remains Unresolved?

**First, reference papers shape the evaluation boundary.** A departure can be an error or a legitimate alternative. Model scores above the reference still require independent scientific validation, as the authors acknowledge.

**Second, final reports cannot fully establish process integrity.** Scoring emphasizes reports and images; data provenance, execution, metrics, and conclusions need finer audits. The paper does not report sufficient human–model calibration and cross-judge stability evidence to remove these uncertainties.

**Third, task and run coverage remain limited.** Four paper-derived tasks per domain, primarily computational research with existing materials, cannot represent an entire discipline or wet-lab capability. Repeated-run variation, strict budget matching, and target-paper leakage also require investigation. Omitting a paper from the supplied package does not exclude pretrained familiarity or external retrieval.

**Fourth, versions and statistical scope affect reproducibility.** Old and new EvoScientist configurations, frontier scopes, figure numbering, and case weights are not consistently updated. A growing project requires frozen paper, data, scorer, and system versions. [Section 6](https://arxiv.org/html/2606.07591v5#S6).

### Solution Reflection: What Directions Could Address These Issues?

The following are our proposed directions, corresponding to those limitations.

1. **Independently validate alternative research routes.** Have domain experts blindly assess objective alignment, validity, and novelty. Require repeated experiments or external data for claims that surpass the reference.
2. **Bind scoring to traceable artifacts.** Connect each claim to input data, code versions, commands, logs, metrics, and figures. Independently replay high-weight requirements and compare multiple judges with expert decisions.
3. **Expand tasks and control comparison conditions.** Add tasks and repeated runs with confidence intervals. Compare frameworks under a fixed model and models under a fixed framework; test leakage, contamination, and real experimental feedback.
4. **Release recomputable evaluation snapshots.** Freeze data and code commits, configuration lists, and run outputs. Automatically compute means, per-task frontiers, and normalized weights, then verify that prose, figures, and leaderboards use the same scope.

*Based on ResearchClawBench arXiv v5. The three figures belong to the original authors and are reproduced unchanged for this paper reading. The arXiv page uses a non-exclusive distribution license; no CC BY license is claimed for these paper figures. Figure numbers follow the PDF, with HTML counterparts noted. Tables are extracted from the paper. Appendix recomputations, interpretations, and research proposals are our analysis.*
