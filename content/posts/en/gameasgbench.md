Writing a game project and delivering a game that satisfies its requirements are different things. A page may start, the code may compile, and most checks may pass, while a real drag, a reset, or a longer interaction sequence still fails. GameASG-Bench is designed to expose this gap.

This article reads **GameASG-Bench: Benchmarking Autonomous Software Generation for Game Development** by Xiuhui Zhang, Yi Chen, Shusheng Xu, and colleagues, based on [arXiv v1](https://arxiv.org/abs/2609.21293v1), submitted on September 18, 2026. The paper does not propose a new game-generation model. Its central idea is to make behavioral testability part of generation: besides producing a game, the agent implements an interface through which the evaluator can prepare scenarios, send player-level actions, read stable state, and check invariants. The official code is [areal-project/GameASG-Bench](https://github.com/areal-project/GameASG-Bench).

## 1. Topic: how can we tell whether an agent delivered a usable application?

Autonomous software generation aims to turn human requirements directly into executable applications. An agent reads files, edits code, invokes tools, runs programs, and revises its implementation from errors. For a complete application, locally correct functions are insufficient: input handling, state transitions, rendering, resource changes, failure conditions, and restart behavior must work together.

Games are a compact proxy for this problem. They are often self-contained but include controls, spatial relations, state machines, feedback, and terminal conditions. A game that “looks playable” does not establish that mouse and touch input both advance the flow, that old state does not leak after reset, or that a sequence of actions reaches the right terminal state.

Reliable evaluation therefore needs three kinds of evidence: whether the artifact satisfies source-level interface requirements, whether real browser input changes the visible game, and whether snapshots agree with the screen and runtime behavior. A single playable/not-playable label is not enough to locate which requirement failed.

## 2. Related work: from code generation to verifiable applications

| Work | Main exploration | Connection to this paper |
| --- | --- | --- |
| [WebGameBench](https://arxiv.org/abs/2605.17637) | Evaluates browser-native games through real browser interaction | Shows how games can serve as a behavioral requirement-to-application setting |
| [GameCraft-Bench](https://arxiv.org/abs/2606.17861) | Requires end-to-end generation of playable Godot games using replay and multimodal evidence | Connects complete game delivery with reproducible verification |
| [GameGen-Verifier](https://arxiv.org/abs/2605.07442) | Decomposes requirements into precondition–interaction–postcondition checks with runtime state injection | Provides another route to fine-grained behavioral verification |
| [GameDevBench](https://arxiv.org/abs/2602.11103) | Evaluates agent development and modification of Godot projects | Extends game evaluation from local code tasks to project-level work |

GameASG-Bench takes a more specific position: **the evaluation interface and executable checks are fixed before generation, so the same behavioral tests can run on games with different internal implementations.** Agents do not have to use prescribed classes or object graphs, but the interface semantics, actual game state, and visible behavior must agree.

## 3. Research questions: does a high check pass rate mean the task is complete?

The following four questions are our reading synthesis; the paper organizes its experiments as RQ1–RQ4:

1. When a requirement includes a complete gameplay loop, how reliably can current agent stacks satisfy every required behavior?
2. How do tool access and nominal turn budgets affect completion?
3. Does higher reasoning effort reliably produce more complete tasks, and is the additional token use worthwhile?
4. For the same model, does changing the harness change which tasks succeed?

These questions require a clear distinction between how many checks pass and how many tasks pass every required check. The latter is closer to whether an application can be delivered as a whole.

## 4. Method: declare a testable interface, then verify with browser evidence

![Composition of the 47 GameASG-Bench tasks by genre, dimension, and reference technology](../assets/img/blog/gameasgbench/taxonomy.png "Figure 1 · The three panels show the 47 tasks by genre, spatial dimension, and reference implementation technology. Source: original Figure 1; source files Figures/taxonomy_genre.pdf, taxonomy_dimension.pdf, and taxonomy_technology.pdf, rendered and vertically combined without changing the plotted data. Paper version: arXiv v1.")

### Step one: describe both gameplay and testing for every task

Each task asks the agent to produce a self-contained browser-native game delivered as `index.html`. The task package contains three documents:

| Document | File | Role |
| --- | --- | --- |
| Generation prompt | `target.md` | Workspace, delivery protocol, and concise gameplay objective; passed directly to the agent by the harness |
| Gameplay design requirement | `game-spec.md` | Objective, controls, entities, state transitions, feedback, termination, and restart requirements |
| Evaluation interface specification | `tdd.md` | Scenario setup, action and observation semantics, rejection behavior, and invariants |

Human authors write the scenarios, actions, snapshot fields, and check code before generation. The agent reads the gameplay and TDD documents and implements both the game and the evaluation interface. The evaluator therefore does not need the internal object graph; it only needs stable interface meanings.

### Step two: connect preparation, action, and observation with four methods

Each task exposes four kinds of capability through `window.__gameTest`:

1. `reset` restores the initial state and clears transient effects;
2. `loadScenario` moves the game to a legally reachable intermediate state without directly producing the outcome under test;
3. `input` accepts player-level actions such as moving a unit or selecting a target;
4. `getSnapshot` returns the relevant state in a serializable form.

The key constraint is that interface operations and snapshots must act on the underlying state that drives visible gameplay. Otherwise an agent could write a “fake state” for self-tests: the snapshot would report success while the screen and real input remain unchanged. `loadScenario` can skip a long prerequisite sequence, but it cannot bypass the final action being tested.

### Step three: separate L1/L2 evidence from P0/P1/P2 priorities

L1 checks source-level compliance. A shared runner reads the HTML and local scripts and applies tool checks, regular-expression assertions, and anti-pattern rules. It can detect whether an interface is declared or a required structure appears, but a match inside a comment or string does not establish that gameplay is correct.

L2 serves the submission locally and runs `checks.js` in headless Chromium. Checks follow prepare–act–observe: load a legal scenario, invoke a semantic action or send real mouse/touch input, and compare snapshots, rendering, runtime errors, and invariants. Each check returns PASS, FAIL, or NOT_APPLICABLE and starts in a fresh page.

Requirement priority and evidence layer are orthogonal. P0 covers startup, interface availability, and minimum runtime conditions. P1 covers core mechanics, interactions, and invariants. P2 covers extended capabilities and experience completeness. Strict task success requires valid delivery, completed evaluation, every L1 check, and every applicable L2 P0/P1 check to pass:

\[
s_g=d_g e_g\prod_{c\in\mathcal{L}_g\cup\mathcal{B}_g}p_{g,c},\qquad
SR(\mathcal{G})=\frac{1}{|\mathcal{G}|}\sum_{g\in\mathcal{G}}s_g.
\]

Here (d_g) denotes valid delivery, (e_g) completed evaluation, and (p_{g,c}) whether check (c) passes. The primary metric uses all planned tasks as its denominator, including generation or evaluation failures. Only metrics explicitly reported as conditional strict success use evaluated tasks as the denominator.

### Step four: build a corpus with positive controls

The benchmark contains **47 tasks across 12 primary genres**, including 32 2D and 15 3D tasks. Reference implementations mainly use Canvas 2D or Three.js, but these technology labels do not constrain compliant generated artifacts. The suite contains 336 L1 checks and 885 L2 checks, including 534 L2 P1 core checks.

Each reference implementation is independently reviewed against the gameplay and TDD documents, then run through all L1 and applicable L2 P0/P1 checks. All 47 reference implementations pass core acceptance, providing positive controls for the test suite. Tasks exclude backends, accounts, external databases, private or paid assets, and unbounded multiplayer services, concentrating on integration among input, state, rendering, and gameplay logic.

## 5. Experiments and results: task-level success is far below average check scores

### Main experiment: nine agent stacks end to end

Each task–configuration pair runs once from a clean workspace, with a fixed 1280 × 800 browser viewport. RQ1 compares nine stacks at maximum reasoning effort and full tool access. The primary metric is strict task success over all 47 planned tasks; the other metrics are check pass rates.

| Model | Harness | Strict success | L1 mean | L2 mean | L2 P0 | L2 P1 | L2 P2 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GPT-6-Astra | Codex CLI | **26/47 (55.3%)** | 98.0 | **93.2** | **99.0** | **92.7** | **92.4** |
| Claude-Opus-5 | Claude Code | 24/47 (51.1%) | **99.6** | 90.4 | 91.2 | 89.9 | 91.1 |
| GPT-5.6-Sol | Codex CLI | 21/47 (44.7%) | 98.9 | 91.3 | 100.0 | 89.7 | 91.9 |
| DeepSeek-V4-Flash | Claude Code | 18/47 (38.3%) | 99.4 | 89.3 | 98.0 | 86.7 | 90.2 |
| DeepSeek-V4-Pro | Claude Code | 15/47 (31.9%) | 99.6 | 85.2 | 85.3 | 83.9 | 88.9 |
| Kimi-K3 | Claude Code | 15/47 (31.9%) | 97.7 | 88.5 | 98.0 | 86.3 | 89.7 |
| GLM-5.2 | Claude Code | 11/47 (23.4%) | 98.8 | 84.6 | 91.2 | 83.3 | 83.0 |
| Hunyuan-3 | Claude Code | 10/47 (21.3%) | 98.3 | 81.7 | 96.1 | 78.2 | 82.3 |
| MiniMax-M3 | Claude Code | 7/47 (14.9%) | 98.3 | 70.6 | 91.2 | 64.5 | 75.4 |

*Source: original Table 3, PDF page 7. L1/L2 are check pass rates; strict success requires every required check for the task to pass.*

The key result is not the highest mean L2 score of 93.2%, but the highest strict task success rate of only **26/47 = 55.3%**. GPT-6-Astra has a 98.0% mean L1 rate, yet only 40 artifacts pass every L1 check; one failed required check blocks strict success. GPT-5.6-Sol has a higher mean L2 rate than Claude-Opus-5 (91.3 versus 90.4) but fewer strict successes (21 versus 24). This is exactly how average check scores can hide task-level defects.

Resources also have no simple “larger is better” relationship. Astra averages 55.5k output tokens and achieves 26 strict successes; each DeepSeek variant averages about 203.6k output tokens, while Flash and Pro achieve 18 and 15 successes. The paper reports average per-task API costs of USD 4.4445 for Astra, USD 11.8500 for Claude-Opus-5, and USD 0.2461 for DeepSeek-V4-Flash. These are the authors’ API-usage estimates, not the full cost of reproducing the benchmark.

### Analysis one: tool access and nominal turn budget

Holding DeepSeek-V4-Flash, Claude Code, maximum reasoning, and a 120-turn baseline fixed, the authors first vary tool access. Full access yields **18/47** strict successes; no tools, file read/write only, and files plus syntax checking yield 7, 6, and 9. Full access raises L2 P1 to 86.7%, but adding syntax checks changes strict successes from 6 to 9 while P1 falls from 66.2% to 63.4%. Success counts and pooled check rates do not have to move together.

With full tools fixed, nominal budgets of 30, 60, and 120 turns allow 10/47, 32/47, and 47/47 tasks to complete evaluation, with 7, 13, and 18 strict successes. Over all 47 planned tasks, the success rate rises from 14.9% to 27.7% and 38.3%. Conditional rates among evaluated tasks are 70.0%, 40.6%, and 38.3%. Increasing the budget therefore first lets more tasks complete generation, verification, and delivery; the increase over the full planned denominator cannot all be interpreted as better code quality.

### Analysis two: reasoning effort has an efficiency turning point

With the model, harness, tools, and 120 turns fixed, low, high, and maximum reasoning produce 7/47, 19/47, and 18/47 strict successes. High effort exceeds maximum effort by one success while using 138,232 average reasoning tokens versus 189,210, a **26.9%** reduction. Maximum effort has the highest P0, P1, and P2 pass rates, but task-level success is not monotonic.

The cautious conclusion is that more reasoning can improve local check scores without reliably crossing the final “all required checks pass” boundary. Each configuration ran each task once, so these results do not establish that high effort beats maximum effort across more generation seeds.

### Analysis three: equal aggregate success can mean different task sets

DeepSeek-V4-Flash at maximum effort and full tools is run through Claude Code and Codex CLI. Both harnesses achieve **18/47 (38.3%)**, but only **10 tasks** succeed under both; 8 succeed only under Claude Code, 8 only under Codex CLI, and 21 under neither.

Their resource profiles also differ. Codex CLI produces 69.5 KB artifacts on average versus 85.2 KB for Claude Code, an 18.4% reduction, and records 112.8k output tokens versus 203.6k, a 44.6% reduction. A harness is therefore more than a thin command wrapper: system instructions, context management, tool schemas, execution protocols, and endpoints can change the repair path. Equal aggregate counts do not establish equivalent environments.

### Analysis four: real input and scenario preparation catch self-test gaps

The paper gives two diagnostic cases. A GPT-6-Astra Diner Dasher passes L1 and L2 P0/P2, but real mouse and touch drags do not advance service progress; the failure appears only in player-level input checks. A DeepSeek-V4-Flash Turbo Smash Beast passes self-tests that explicitly advance time, but the evaluation loads a scenario and then uses real driving input. Scenario mode suppresses natural-time progression, so acceleration and coasting fail.

These cases motivate the core design: an interface self-test can show that one call path works, while real input after legal scenario preparation checks whether screen and state change together under player actions. The appendix also records execution-triggered repairs involving touch coordinates, a hidden completion screen, an unclosed syntax construct, an update loop, a negative Canvas radius, and state leakage across reset.

## 6. Our reflections

### Topic reflection: what is this field studying?

This direction studies the transition from “generate code” to “deliver complete behavior.” GameASG-Bench divides responsibility among three parties: human authors define controllable actions and observable semantics before generation, the agent implements the interface and game, and the evaluator executes fixed checks and records evidence. The object of evaluation becomes the correspondence among requirements, runtime state, player input, and visible outcomes rather than source code or screenshots alone.

It also separates correctness into two axes. Check pass rates show how well local requirements are met; strict success shows whether a task can be delivered as a whole. Both are needed to see the last-mile failures common in application-level generation.

### Limitations reflection: what remains unresolved?

First, L1 regular expressions and interface declarations can match comments or strings; the paper explicitly says they are not evidence of gameplay correctness. L2 is stronger, but it still executes author-written action sequences and may miss unlisted interaction combinations.

Second, handling `NOT_APPLICABLE` creates a protocol risk. The paper notes that the current runner does not forbid a required P1 check from returning this outcome. If a key check is excluded, the denominator and interpretation of applicable-check rates and strict success can change.

Third, 47 browser games are a bounded proxy. They focus on self-contained, finite 2D/3D games and do not cover backends, accounts, multiplayer services, long-running applications, or complex commercial software. Each task–configuration pair runs once, so generation variance is not estimated.

Fourth, RQ2–RQ4 focus mainly on DeepSeek-V4-Flash and two harnesses. Tool access, turn budget, reasoning effort, and execution protocol may interact. Resource reporting is limited to available token/API measurements and cannot directly be translated into full engineering labor.

### Solution reflection: which directions could address these issues?

For the first limitation, treat source checks primarily as diagnostic evidence and add evaluator-independent browser state, render-difference, input-listener, and terminal-state checks. Systematically combine action orders and invalid actions.

For the second, forbid required P1 checks from returning NOT_APPLICABLE, or count that outcome as failure, and publish an applicability audit for every check. Critical tasks could also include hidden restart, boundary-state, and cross-page regression tests.

For the third, extend the same interface protocol to backend services, persistent applications, and multiplayer sessions. Run multiple independent generations and report confidence intervals. Browser games are useful for fast regression, but should not represent all autonomous software generation by themselves.

For the fourth, repeat matched tasks under the same model and harness, report paired differences, and include failed repair attempts, browser execution, evaluation, and infrastructure in the cost. Harness comparisons should expose versioned system instructions, tool schemas, and terminal protocols to approach a causal comparison.

*Reading basis: Sections 1–4 and Appendices A–B of arXiv v1; [original PDF](https://arxiv.org/pdf/2609.21293v1) and [official repository](https://github.com/areal-project/GameASG-Bench). Figure 1 comes from the original paper’s three taxonomy PDFs and was rendered and combined without changing the plotted data; the paper uses arXiv’s non-exclusive distribution license, and the caption preserves the authorship and version information. We did not rerun the full benchmark. Experimental numbers are reported by the authors; denominator interpretation, limitations, and future directions are our analysis.*
