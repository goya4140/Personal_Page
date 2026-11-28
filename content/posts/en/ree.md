“Can a research agent do research?” cannot be answered by checking whether it writes code or produces a report. A closer entrance exam is to give it an active problem in a field, a working but imperfect starting method, and a fixed budget, then ask whether experiments can push the solution beyond an established expert method.

This post reads [REE: A Scientific Research Entrance Exam for AI Agents](https://arxiv.org/abs/2611.34646v1) by Zeqi Zhou, Minghao Liu, Jiarui Liu, and colleagues (arXiv v1, 25 Nov 2026). REE (Research Entrance Exam) introduces 100 open-ended, cross-disciplinary research problems and evaluates research agents with a common protocol combining a starter solution, an expert reference, held-out tests, and progress over time.

## 1. Topic: research agents must demonstrate improvement

Real research is rarely a one-shot question with a unique answer. A researcher starts from an existing method, studies the data and metric, proposes changes, runs experiments, diagnoses failures, and decides whether to continue before the budget runs out. The final improvement must also survive data that was not seen during development.

An evaluation of research agents therefore needs to observe at least four things: whether the agent improves a runnable solution, whether it beats established work, whether the improvement generalizes to held-out data, and how much time and computation it uses. A single answer, paper-summary score, or known-answer accuracy cannot cover this research loop.

## 2. Related work: from one-shot outputs to long-horizon scientific improvement

| Benchmark | Main coverage | Difference from REE |
| --- | --- | --- |
| RE-Bench, MLE-bench | ML R&D or Kaggle-style engineering | Fewer tasks or a competition focus, with limited scientific breadth |
| PaperBench, AIRS-Bench | Paper reproduction, research workflows, or ML science | More paper-level or ML-centered; less cross-disciplinary iterative improvement |
| Agent4Sci, NatureBench | Scientific problems across several domains | Broad coverage, but different combinations of expert references, held-out evaluation, and time traces |
| AlphaEvolve | Program evolution on automatically scorable problems | Demonstrates executable improvement; REE extends the iterative protocol into a cross-science entrance exam |

REE does not force every science task into one algorithm. It preserves each field's objective and metric while placing a starter solution, an expert solution, held-out tests, and a fixed horizon into one evaluation framework.

## 3. Research questions: what does this entrance exam measure?

Our reading organizes the questions as follows:

1. Can current research agents consistently improve a working starter solution across 100 open problems?
2. Where do their results sit relative to independently evaluated expert solutions, and does the advantage hold across scientific areas?
3. Do agents improve through long random search, or by identifying useful data patterns and adapting established field methods?
4. How can one score retain problem difficulty, human reference, held-out generalization, and progress over time?

## 4. Method: turn each scientific problem into a 12-hour iterative experiment

![Four-step REE task protocol](../assets/img/blog/ree/teaser.png "Figure 1 · The agent receives a problem, starter solution, and development data; it iterates for up to 12 hours and saves versions; one grader evaluates the starter, agent, and expert solutions on held-out instances; scores map to a shared 0–100 scale. Source: original Figure 1, PDF page 3; rendered from the source figure.")

### Step 1: select open problems that scientific communities still study

Every task must satisfy three conditions: its answer is a program scored by a continuous quantitative metric rather than a binary label; it can be evaluated automatically on instances unseen by the agent; and an established human solution can run within the task budget. The task keeps the field's own objective and metric instead of replacing them with a generic loss.

For example, protein-sequence tree building is scored by tree-branching differences rather than average distance error. EEG seizure-detection test recordings come from sources absent from development data. Quantum error-correction data can violate the supplied Pauli-noise approximation. These choices force agents to face domain-specific generalization.

### Step 2: give the agent a runnable but imperfect start

Each task provides a problem statement, a complete working starter solution, and development data. The starter is usually a short, simple method; the agent may modify, replace, or discard it. Development data provides experimental feedback, while a separate held-out test set remains invisible and never returns a score during the run.

Each run lasts at most 12 hours in an offline, fixed-compute environment. The agent decides when to stop, saves intermediate versions, and uses a checker on development data to measure each change. Afterwards, a separate container evaluates the final program on held-out instances. Timeouts, invalid outputs, and failed instances receive the task-defined failure value.

### Step 3: construct a comparable expert reference

Expert solutions come from five sources: 24 entries in organized competitions or rankings, 36 methods published in papers or author code, 20 reference methods released with a benchmark or toolkit, 9 released tools with evidence of standing, and 11 standard methods from the field. The authors rerun each expert solution on the same hidden instances, time limit, and execution conditions.

This matters because a published score may use different data, hardware, or time. REE does not copy it directly; it submits both the expert and agent solutions to the current grader. “Beating the expert” therefore means beating an established reference under REE conditions, not defeating every researcher in the field.

### Step 4: map heterogeneous metrics to one scale

For task (i), the held-out result (B_i) is mapped to 0–100: 0 is the starter solution and 100 is the task metric's upper bound. The expert score is (E_i). REE reports

\[
\bar B=\frac1N\sum_i B_i,\qquad
\bar M=\frac1N\sum_i(B_i-E_i),
\]

\[
W=\frac{100}{N}\sum_i\mathbf 1[B_i>E_i],\qquad
W_5=\frac{100}{N}\sum_i\mathbf 1[B_i-E_i>5].
\]

(̄B) is the agent's absolute mean position, (̄M) is the mean margin over experts, (W) is the share of tasks won, and (W_5) requires a margin above five points so tiny differences are not treated as meaningful wins. Means and margins use task-level 95% bootstrap intervals; agent comparisons are paired by task.

### Step 5: record the research process as well as the endpoint

Runs save checkpoints at 1, 2, 4, and 8 hours plus the final solution. The authors also record version counts, tool calls, stopping time, and token usage. An LLM judge reads the leading agents' final methods and traces their central ideas through papers, write-ups, and public code. Time curves only include runs with all five checkpoints, avoiding inconsistent horizons.

![REE composition across scientific areas and modalities](../assets/img/blog/ree/composition.png "Figure 2 · The 100 tasks span mathematics and computing, physical sciences and engineering, life and health, earth and environment, and language, society and culture: 23 domains, 91 sub-fields, and modalities including text, tables, signals, audio, molecules, and graphs. Source: original Figure 2, PDF page 4; rendered from the source figure.")

The 100 tasks are distributed across mathematics and computing (20), physical sciences and engineering (25), life and health (19), earth and environmental sciences (12), and language, society and culture (24). They cover 23 domains, 91 sub-fields, 10 modalities, and 9 metric families. Science is not reduced to machine learning: acoustics, materials, clinical medicine, climate, linguistics, and science of science keep their own evaluation conventions.

## 5. Experiments and results: overall comparison before understanding how improvement happens

### Main experiment: four frontier agents on 100 cross-science problems

The authors evaluate four model–harness configurations: Claude Opus 5.5 in Claude Code, GPT-6.1 Sol in Codex, and GLM-5.3 and Grok 4.7 in Claude Code. All use maximum reasoning effort and context. Each agent–task pair has one run, lasting up to 12 hours.

| Agent (harness) | Mean score (̄B) | 95% CI | Mean margin (̄M) | Win over expert (W) | Margin >5 (W_5) |
| --- | ---: | --- | ---: | ---: | ---: |
| Claude Opus 5.5 (Claude Code) | **39.6** | [36.0, 43.2] | **+15.2** | **86%** | **72%** |
| GPT-6.1 Sol (Codex) | 38.2 | [34.2, 42.3] | +13.8 | 81% | 69% |
| GLM-5.3 (Claude Code) | 28.6 | [25.0, 32.3] | +4.2 | 67% | 56% |
| Grok 4.7 (Claude Code) | 25.3 | [21.9, 28.6] | +0.9 | 61% | 44% |
| Expert reference | 24.4 | [20.7, 28.4] | — | — | — |

The main conclusion has two layers. First, the leading agents score above the rerun expert references, with positive margins in all five areas; Claude Opus 5.5 and GPT-6.1 Sol beat the expert on 86% and 81% of tasks. Second, scores remain far from the task upper bounds: no run reaches its upper bound, and the highest final score on any task is 81.7. “Beating the expert” therefore means reliable improvement over a comparable reference under the stated budget—not “solving research.”

![Agent-versus-expert scores task by task](../assets/img/blog/ree/parity.png "Figure 3 · Each point is one task and the dashed line is the expert score; points above it mean the agent's final score is higher on the same held-out test. Source: original Figure 5, PDF page 9; rendered from the source figure.")

The two leading results also do not imply that more tokens automatically win. GPT-6.1 Sol uses median output and total tokens of about 768k and 106.2M, versus 148k and 21.6M for Claude Opus 5.5—roughly five times as many—yet score/output-token Spearman correlations are only 0.20–0.31. Model, harness, tool scheduling, and stopping policy are bundled, so the table is not a pure model leaderboard.

### Progress over time: early gains, but late research still matters

Claude Opus 5.5 and GPT-6.1 Sol have mean margins of -3.0 and -0.5 after one hour, +5.4 and +3.4 after two, and +8.6 and +8.3 after four. At four hours, both reach 87% of their final mean score. Yet among runs still working at hour eight, 60% of Opus runs and 76% of GPT runs continue improving before termination; 12% and 21% improve by more than five points.

![A complete run on a structural-break time-series task](../assets/img/blog/ree/insiderun.png "Figure 4 · GPT-6.1 Sol discovers a lattice of increments and adds 142 features at 5.4 hours; the checkpoint score rises from 35.8 at four hours to 54.6 at eight, and finishes at 56.0. Development AUC and REE held-out scores are separate. Source: original Figure 6, PDF page 10; rendered from the source figure.")

The case shows why “already above the expert early” does not mean later compute has no value. On a structural-break task, GPT-6.1 Sol first replaced a variance-difference rule with a model blend, then noticed repeated values and decimal resolution, reconstructed a multiplicative path, and added 142 lattice features. It saved 32 versions, stopped at 11.9 hours, and reached a final test score of 56.0. It also held out part of the development data for a final check and used it only after selecting a candidate.

### Method analysis: leading solutions mostly adapt and combine

An LLM-assisted tracing of the two leading agents' best methods finds that 51% are tailored adaptations of established field methods and 45% combine existing methods. The agents are not usually inventing a new paradigm from nothing; they are recombining domain knowledge, data regularities, and experimental feedback.

For porous-framework CO₂ uptake, both agents add force-field energies inside pores. For gene trees, they use sequence alignment and tree search instead of alignment-free statistics. For gene-regulatory-network inference, GPT-6.1 Sol combines temporal evidence, a cyclic-graph prior, and an edge scorer trained on simulated networks, reaching 71.7, the highest score on that task. There are counterexamples: agent methods on confluence proofs score below the expert portfolio, so compositional ability does not transfer reliably to every domain.

## 6. Our reflections

### Topic reflection: what is this field studying?

REE shifts the central question from “can an agent write a paper?” to “can it move a runnable solution forward on a problem recognized by a real scientific community?” Its value is the simultaneous preservation of field metrics, expert references, held-out generalization, and progress over time. This helps separate an agent that writes convincing explanations from one that can actually run experiments and change a method.

### Limitation reflection: what remains unresolved?

First, REE only includes problems with automatic evaluation and a runnable expert reference; natural-science questions requiring instruments, physical experiments, or long observation remain outside its scope. Second, the five kinds of expert reference differ in strength; comparable reruns do not make every reference a field optimum. Third, each agent–task pair is run once, while maximum reasoning, maximum context, a 12-hour budget, and harness differences are bundled together. Fourth, the normalized 0–100 score uses a metric upper bound, not “all scientific goals completed”; the LLM judge's method tracing is explanatory evidence, not a human peer-review verdict.

### Solution reflection: where could evaluation go next?

An expanded exam could pair automatically scorable tasks with real-experiment tasks, measuring design, instrument coordination, anomaly handling, and long-term validation in a second layer. Expert references should include multiple strength levels, inter-expert variation, rerun variance, and development cost. Agent comparisons need multiple seeds, same-harness cross-model controls, and explicit ledgers for tokens, GPUs, tools, and human repair. Finally, besides score and win rate, benchmarks should record hypothesis changes, failure reasons, evidence chains, and independent rechecks so that “beating the expert” becomes an interpretable and transferable scientific contribution.

**One-sentence takeaway:** REE is a genuine research entrance exam: instead of giving an agent a unique answer, it gives a runnable but imperfect method, the field's own metric, hidden tests, and a 12-hour budget, then asks whether iteration can move the method beyond a comparable expert reference.

**References:** [arXiv paper](https://arxiv.org/abs/2611.34646v1), [HTML full text](https://arxiv.org/html/2611.34646v1), [REE dataset](https://huggingface.co/datasets/Tokenwave-AI/REE).
