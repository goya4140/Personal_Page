Writing code that generates a chair and building a world where someone can enter, open a door, collect an item, and retain state impose very different demands. Frontier3DBench brings these tasks into one evaluation to examine how coding-agent capabilities extend from objects to scenes and interactive worlds.

This article reads **Frontier3DBench: Benchmarking Coding Agents for 3D Creation across Objects, Scenes, and Interactive Open Worlds** by Xinjie Lin, Qingle Liu, Wenyi Li, and colleagues, based on [arXiv v1](https://arxiv.org/abs/2611.09017v1), submitted on November 6, 2026. This benchmark paper contributes tasks, artifact checks, and capability analysis; it does not introduce a new 3D generation model. The [project page](https://lab.einsia.ai/frontier3dbench/) and [official code](https://github.com/Einsia/Frontier3D) provide further learning resources.

## 1. Topic: how can we tell whether an agent has built a usable 3D world?

Traditional 3D authoring involves modeling, materials, lighting, and scene composition. Interaction adds logic, collision handling, and state management. Coding agents can translate natural language or reference images into Blender scripts and Unreal Engine projects, then execute, inspect, and revise their work.

The goal is an **openable, editable, executable 3D project**. A chair needs appropriate geometry and relationships between parts. A room needs coherent scale, layout, and lighting. An explorable workshop also needs accessible routes, operable mechanisms, and consistent item and mechanism states across regions.

Evaluation therefore needs to connect three sources of evidence: renders for appearance, native projects for geometry and structure, and runtime tests for interaction and state. A single attractive image cannot establish whether a door opens or whether the player can actually pass through it afterward.

## 2. Related work: from procedural modeling to executable worlds

| Work | Main exploration | Connection to this paper |
| --- | --- | --- |
| [3DCodeBench](https://arxiv.org/abs/2606.01057) | Evaluates agents that perform procedural 3D modeling through code | Establishes a code-to-3D-artifact evaluation perspective focused on geometric and visual construction |
| [BlenderWorld](https://arxiv.org/abs/2610.23986v1) | Evaluates Blender artifacts from real references and open-ended authoring requests using multiple renders and task-specific rubrics | Covers objects and environments while exposing difficulties with fine spatial and structural reproduction |
| [ExeWorldBench](https://arxiv.org/abs/2610.15166v2) | Progresses from individual mechanisms to composed systems and intent-driven executable worlds, examining mechanical and causal dependencies | Shows why working components still need composition and behavioral-chain checks |

Frontier3DBench organizes tasks by the **unit being constructed**: objects, scenes, and interactive worlds. It then assigns visual, structural, and behavioral checks to each level. This enables comparisons within one experimental suite, while task families retain different scoring formulas; their scores are not identical physical measurements.

## 3. Research questions: what should a unified evaluation reveal?

The following questions are our reading synthesis, rather than research questions quoted verbatim from the authors.

1. **Do capabilities transfer across construction levels?** Does a configuration that builds individual objects well also organize scenes and implement interactive worlds well?
2. **How large is the gap between plausible generation and specified reconstruction?** Text-driven creation has more freedom than reconstruction constrained by particular references.
3. **Can local functions compose into complete activities?** After a switch or drawer works individually, do motion clearance, action prerequisites, and persistent states remain correct?

Agreement with human judgment and the API cost of achieving these scores are additional questions about the benchmark's practical usefulness.

## 4. Method: from task specifications to independent execution and scoring

![Task specifications pass through a coding agent to produce Blender or Unreal Engine projects](../assets/img/blog/frontier3dbench/task-formulation.png "Figure 1 · Read left to right: instructions, optional references and initial assets → code generation or editing by a coding agent → object, scene, or interactive-world project files. Source: original Figure 2, PDF page 3; original source image, without cropping or redrawing.")

### Step one: prepare tasks by construction unit

The benchmark contains **145 tasks, 9 categories, and 3 levels**. Object and scene tasks use public 3D assets, dataset imagery, and photographs captured by the authors. World tasks additionally use game screenshots and panoramic imagery. The authors use GPT-6-astra to expand creation instructions and world interaction specifications, then prepare references and checking conditions.

| Level | Category | Tasks | What the agent receives and must accomplish |
| --- | --- | --- | --- |
| L1: objects | Text2Code | 15 | Build specified geometry and parts from text |
| L1: objects | Img2Code | 25 | Reconstruct an object from multiple views |
| L1: objects | Img2Code-SingleView | 25 | Reconstruct an object from one image |
| L2: scenes | Brief2Scene | 20 | Organize objects, layout, and lighting from text |
| L2: scenes | Ref2Scene | 10 | Reconstruct a scene from a rendered reference |
| L2: scenes | Ref2Scene-RealPhoto | 25 | Reconstruct space and contents from a photograph |
| L2: scenes | SceneEdit | 10 | Modify the target in an initial scene while preserving protected content |
| L3: interactive worlds | Text2Env | 5 | Build connected spaces and functionality from text and an interaction contract |
| L3: interactive worlds | Img2Env | 10 | Reconstruct an environment and implement functionality from images, text, and an interaction contract |

*Source: original Table 1, PDF page 4. L1 and L2 each contain 65 tasks; L3 contains 15.*

Inputs consist of instructions, optional images, and optional initial projects or assets. Source models and evaluation annotations used for scoring are withheld; editing tasks explicitly supply the project to modify. L3 also provides an interaction contract defining entities, initial states, operations, prerequisites, and physical constraints. **An open world here means a connected, explorable environment with persistent state within a session; each task need not be a vast outdoor map.**

### Step two: author and submit native projects in constrained environments

L1/L2 deliver Blender projects and construction or editing code. L1 also requires a GLB export; L2 requires main and alternate renders. L3 delivers Unreal Engine projects, assets, and interaction logic, with task-appropriate read-only asset libraries and integration interfaces available.

General network access is disabled during generation and evaluation, with model requests passing through a restricted gateway. L1/L2 generation uses isolated containers with 2 CPU cores and 4 GiB of memory; submitted code runs in Blender 5.2.1. Each task permits at most 6 attempts within a 32-hour total budget. Timeouts, transport errors, or failed public execution/delivery checks trigger new attempts, which receive execution errors but no quality scores. **This is not best-of-6 selection using hidden scores.**

L3 uses Unreal Engine 5.8.3 in persistent containers with 8 CPU cores, 64 GiB of memory, and an assigned GPU, under a 24-hour limit. These are runtime limits and environment settings, not measured time spent on every task.

### Step three: collect separate evidence for appearance, structure, and behavior

For L1/L2, the evaluator executes a baseline and 3 seed reruns, checking files, loadability, editable geometry, and dependencies. These are execution variants of the submitted program, not independent model-generated samples. Detail fidelity takes the weakest variant: L1 checks 8 variants, consisting of native and GLB artifacts from each of 4 runs; L2 checks 4 native variants.

The visual judge is **GPT-6-astra at medium reasoning effort**, with generator identity hidden. It scores criteria using instructions, references, and rendered evidence. L1/L2 visual grades run from 0–4 and are normalized; rule-based checks measure dimensions, parts, spatial relations, and permitted edits. Reference similarity combines regional and global structure, color, tone, and edges. Localization checks projected position, size, and count, rather than directly measuring complete 3D geometric accuracy.

For L3, an independent observer rebuilds the project in a separate workspace and records images, geometry, motion, character routes, inventory, and state changes. Local probes can place test fixtures. Continuous activities prohibit teleportation and resets, requiring actual traversal of the behavioral chain. This separates evidence that an individual mechanism works from evidence that a complete activity is achievable.

### Step four: score task families and aggregate level means

Each component below is normalized to 0–1 before the final score is multiplied by 100. Confirmed execution or delivery failures receive zero; valid artifacts receive component-wise quality scores.

| Task type | Quality formula | Components |
| --- | --- | --- |
| Text-driven object or scene generation | \(Q=0.60V+0.30R+0.10D\) | Visual fidelity, requirements, detail |
| Reference reconstruction | \(Q=0.20V+0.50I+0.20L+0.10D\) | Visual fidelity, image similarity, localization, detail |
| Scene editing | \(Q=0.20V+0.20R+0.10D+0.30T+0.20P\) | Adds target modification and protected-content preservation |
| Interactive worlds | \(Q=0.60A+0.20F+0.05G+0.15H\) | Appearance quality, task fidelity, spatial layout, interaction correctness |

*Source: original Appendix A, PDF pages 16–17.*

World interaction is further decomposed as \(H=0.40M+0.25C+0.35W\), where \(M\) denotes local mechanisms, \(C\) motion clearance, and \(W\) state/workflow. Within \(W\), final-state predicates and complete-route success receive equal weight. A switch can therefore trigger correctly while subsequent paths, inventory states, or coordinated operations fail.

Task scores are averaged within each level, including measured zeros, and combined as:

\[
S_{\mathrm{overall}}=0.30S_{\mathrm{L1}}+0.30S_{\mathrm{L2}}+0.40S_{\mathrm{L3}}.
\]

This is not an equally weighted average over 145 tasks. The 15 L3 tasks contribute 40% of the total, reflecting the authors' emphasis on integrated capability. Within the world score, however, appearance still receives 60% and interaction 15%. **A high overall score cannot directly establish that most complete activities succeed.** See [Appendix A for scoring details](https://arxiv.org/pdf/2611.09017v1#page=16).

## 5. Experiments and results: overall performance before capability diagnosis

### Main experiment: 11 model–harness configurations

The authors evaluate **11 configurations on all 145 tasks, measuring 1,595 task scores**. GPT models use Codex, Opus uses Claude Code, Kimi uses Kimi CLI, DeepSeek uses DSH, and GLM uses ZCode. MiniMax, Qwen, and Doubao also use Claude Code. Qwen uses xhigh reasoning effort; the other models use max.

The comparison concerns configurations comprising a model, harness, and execution protocol. Tool scheduling, context management, and other harness differences can affect results. This is not a pure model comparison under one identical framework. All scores below are on a 0–100 scale, higher is better, and represent average artifact quality, **not pass@1 or success rates**.

| Model | Harness | Overall | L1: objects | L2: scenes | L3: interactive worlds |
| --- | --- | --- | --- | --- | --- |
| GPT-6.1-sol | Codex | **66.02** | **71.21** | **70.35** | 58.89 |
| GPT-6-astra | Codex | 63.85 | 68.63 | 62.51 | **61.28** |
| Claude Opus 5.5 | Claude Code | 62.29 | 67.37 | 62.61 | 58.23 |
| DeepSeek-v4.1-Flash | DSH | 57.45 | 63.20 | 62.00 | 49.72 |
| Kimi-K3.1-Pro | Kimi CLI | 55.96 | 61.34 | 59.42 | 49.34 |
| MiniMax-M3.1-Flash | Claude Code | 52.55 | 58.98 | 60.55 | 41.74 |
| Kimi-K3 | Kimi CLI | 49.18 | 52.45 | 55.53 | 41.96 |
| GPT-6-luna | Codex | 48.56 | 56.40 | 54.14 | 38.50 |
| GLM-5.3-Flash | ZCode | 47.61 | 56.01 | 55.92 | 35.08 |
| Qwen3.8-Max | Claude Code | 46.03 | 50.19 | 50.64 | 39.44 |
| Doubao-Seed-Evolving | Claude Code | 42.94 | 51.24 | 49.58 | 31.72 |

*Source: original Table 3, PDF page 7. Level means cover 65, 65, and 15 tasks, respectively; the overall score uses 30% / 30% / 40% weights.*

Sol leads the runner-up by **2.17 points**, with scenes contributing the largest advantage; Astra leads both world categories. Across 9 categories, Sol leads 6, Opus leads text-driven object generation, and Astra leads text- and image-conditioned worlds. The main evaluation provides differentiated capability profiles and shows that no configuration leads everywhere. It does not establish that this scoring system covers every requirement of real production work.

### Analysis one: reference reconstruction trails text-driven generation

For Sol, text-driven object generation scores **82.10**, multi-view reconstruction **69.61**, and single-view reconstruction **66.26**. Text-driven scene generation scores **79.87**, versus **60.95 and 60.86** for rendered-reference and photographic-reference reconstruction. Every configuration scores higher on text-driven objects/scenes than on the corresponding reference-reconstruction families.

Qwen shows a larger gap: text-driven objects score **81.98**, close to Sol, while the two reconstruction categories score **43.97 and 37.34**. This supports the authors' observation that specified shapes, layouts, and details remain difficult. However, task content and scoring formulas differ, so the gap is not a causal estimate of adding image input. A projected-image score also cannot establish the accuracy of all hidden geometry.

Editing reveals another specialization: MiniMax scores **78.70**, second in that category despite ranking sixth overall. Actual task profiles are therefore more informative for choosing an agent than a single overall ranking. See [Table 3 for all category results](https://arxiv.org/pdf/2611.09017v1#page=7).

### Analysis two: why working mechanisms do not establish complete interaction capability

![Visual, structural, and task-fulfillment profiles across construction levels](../assets/img/blog/frontier3dbench/capability-profiles.png "Figure 2 · Each row is a configuration. Circles, squares, and triangles represent objects, scenes, and interactive worlds. Panels show visual quality, structural/spatial consistency, and task fulfillment. Source: original Figure 4, PDF page 9; original vector figure rendered without cropping or redrawing.")

The paper groups scoring components into visual quality, structure, and task fulfillment, renormalizing weights within each dimension. Task fulfillment covers detail, editing, and preservation in L1/L2, and environment coverage and interaction in L3. It remains a dimensional quality score rather than a complete-route success rate.

The central runtime finding covers **all 165 L3 submissions: 11 configurations × 15 world tasks**:

| Interaction subcomponent | Mean / 100 | What it checks |
| --- | --- | --- |
| Local mechanisms | 83.08 | Entity presence, observable action effects, and rejection of invalid-reach operations |
| Motion clearance | 20.82 | Intersections involving sampled moving parts |
| State/workflow | 30.26 | Satisfaction of end states and completion of continuous routes |

*Source: original Section 3.4 and Appendix A.2.3. These are component means across submissions, not human-rated success rates for 165 real-user activities.*

A teaching example illustrates the distinction: a door responding to a switch supports local correctness. If it rotates through a wall, blocks the player, or an item disappears after moving to another region, motion and continuous-activity checks can still fail. This example explains the metrics; it is not a step-by-step trajectory reported in the paper.

Weights also matter. Expanding the formula ourselves, increasing state/workflow \(W\) from zero to full credit contributes at most **2.1 points** directly to the overall score, from \(100\times0.40\times0.15\times0.35\). Aggregate scores can therefore coexist with weak continuous behavior, making submetrics essential.

### Analysis three: cases illustrate component relationships and context

![Comparisons of spinning-wheel reconstruction, bathtub editing, and Minecraft-village construction](../assets/img/blog/frontier3dbench/cases.png "Figure 3 · The top row compares spinning-wheel parts and assembly; the middle row compares bathtub edits against retained supports and cloth; the bottom rows compare the village axis and continuous terrain. World views use model-specific cameras, so viewpoint differences are not all reconstruction errors. Source: original Figure 6, PDF page 11; no cropping or redrawing. Minecraft reference attribution: Akirby80.")

For the spinning wheel, the authors report **71.97** for Sol, **66.21** for Opus, and **38.87** for Kimi-K3: the weaker artifact retains a ring and rods but omits important components. In the bathtub edit, Sol scores **91.43** and Astra **82.97**, fitting the existing supports more successfully. Luna scores **55.42**, separating the tub from its feet and failing to accommodate the cloth. Figure labels round to one decimal place.

These selected cases clarify structural differences. They do not replace aggregate results, and static screenshots cannot confirm that a world's complete interactions pass.

### Analysis four: how broadly do humans support the automatic scores?

The authors select **45 items** from 4 reference-reconstruction families, choosing 4 valid outputs per item. **8 raters** rank them, producing **360 complete rankings**. The items comprise 14 multi-view objects, 16 single-view objects, 8 rendered-reference scenes, and 7 photographic-reference scenes. Candidates include the highest and lowest scores and those nearest the score interval's trisection points, with adjacent candidates at least 4 points apart. Model identities and scores are hidden, and labels are randomized.

Automatic scores versus human rankings have mean Kendall \(\tau_b\) **0.727**, top-one agreement **79.2%**, and exact-order agreement **44.7%**. Mean human–human \(\tau_b\) is **0.679** across **1,260** same-item ranking pairs. This supports an association with human reference-fidelity judgments under this sampling procedure, while complete rankings still differ.

Among the 25 items spanning at least 30 score points, mean \(\tau_b\) is **0.793**; it is **0.644** for the other 20. Human evaluation therefore provides stronger support for ordering visibly separated outputs. It does not directly validate close configuration comparisons, text-only tasks, editing preservation, or continuous L3 interaction. See [Section 3.7, Table 4, and Appendix B.3](https://arxiv.org/pdf/2611.09017v1#page=11).

### Analysis five: interpreting the cost frontier

![Overall scores versus estimated generation API cost per task](../assets/img/blog/frontier3dbench/cost-quality.png "Figure 4 · The horizontal axis is estimated API cost per task in USD on a logarithmic scale; the vertical axis is overall score. Positions and the frontier use cost-range midpoints. Vertical bars are 95% task-bootstrap score intervals; some cost estimates are lower bounds. Source: original Figure 5, PDF page 10; original vector figure rendered without cropping or redrawing.")

The plotted estimates are approximately **$0.27** per task for Luna, **$0.45** for DeepSeek, and **$1.01** for Sol, forming the quality–cost frontier under these estimates. Astra is approximately **$5.58** and Opus **$21.17**, while both score below Sol overall. These use the authors' API price assumptions as of October 30, 2026, rather than current quotations.

Crucially, costs include recorded API usage only in each task's **final successful generation attempt**. They omit earlier failed retries, judging, tools, infrastructure, cache storage, and taxes. DeepSeek, both Kimi configurations, and GLM have incomplete records, making their estimates lower bounds. Plotted positions also hide ranges caused by cache lifetimes, pricing periods, and long-context tiers. Cost averages weight all 145 tasks equally, while scores use level weights, so their aggregation differs.

Vertical intervals use paired within-level task resampling with **100,000** replicates and retain the level weights. They measure task-sampling variation for the evaluated submissions, not the randomness of repeated independent generation. These experiments provide configuration comparisons, dimensional analyses, and evaluation validation. **The paper does not ablate agent modules to establish that a particular planning or feedback mechanism causes a lead.** See [Appendix B.2 for cost and uncertainty accounting](https://arxiv.org/pdf/2611.09017v1#page=18).

## 6. Our reflections

### Topic reflection: what is this field studying?

We see this direction as investigating the transition from content synthesis to engineering delivery. A project must retain specified appearance, coherent structure, and usable behavior, checked through independent execution evidence. Frontier3DBench connects these requirements within one workflow and makes the gap between local mechanisms and complete activities observable.

Higher levels also require more composition: part relationships extend into spatial relationships, which must support action prerequisites and state transfer. The authors' expectation that coding agents will replace traditional specialized vision pipelines is a vision; these experiments do not directly compare and establish comprehensive replacement.

### Limitations reflection: what remains unresolved?

**First, aggregate scores can understate activity failures.** L3 receives substantial overall weight but still emphasizes appearance internally; state/workflow itself is a mixed metric. Applications requiring complete usability need more than average quality to express delivery risk.

**Second, model, harness, and budget effects remain entangled.** Results concern specific configurations at high reasoning effort. There are only 15 world tasks, and task bootstrap cannot determine whether rankings survive another generation seed, a shorter budget, or a different harness.

**Third, score validation and cost coverage are limited.** Human validation focuses on reference reconstruction with score-separated candidates. Astra serves both instruction expansion and visual judging; hiding generator identity helps but does not automatically exclude preferences. Cost covers only some resources in the final successful attempt, limiting its use for forecasting total reproduction expense.

### Solution reflection: which directions could address these issues?

The following are our proposals, not experiments already completed by the authors.

For the first limitation, report complete-route success, state retention, collision failures, and visual quality separately, alongside quality conditional on all critical functions passing. Test sensitivity to scoring weights and examine rankings when behavior receives greater emphasis. Add action-order changes and cross-region return trips to check state stability.

For the second, compare models under the same harness and budget, and run the same model across harnesses. Repeat independent generation on matched tasks and report paired differences with intervals. Expand independently designed worlds and hidden tests to assess transferable construction capability.

For the third, add human evaluation of close-scoring artifacts and actual interaction, cross-check with other model and human judges, and audit instruction–rubric alignment. Accumulate costs from the first attempt, including failures, repairs, all evaluation, and engine execution, while reporting elapsed time and the number of usable final artifacts. This would address the practical question of resources required to deliver a reliable world.

*Reading basis: Sections 2–3 and Appendices A–B of arXiv v1; [original PDF](https://arxiv.org/pdf/2611.09017v1), [project page](https://lab.einsia.ai/frontier3dbench/), and [official repository](https://github.com/Einsia/Frontier3D). Images reproduce original Figures 2, 4, 6, and 5, © Xinjie Lin and colleagues, under the paper's [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license. Third-party assets retain their original attribution and licenses; Minecraft reference: Akirby80. We did not rerun the full benchmark. Numerical results are author-reported; formula expansion and future directions are our analysis.*
