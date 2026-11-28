When an agent recreates a design in code, a difficult moment is often when it believes the result already looks right. The code runs, yet text wrapping, contours, or 3D proportions still differ visibly. If the coding model cannot identify those discrepancies, further edits lack reliable direction.

This article reads **Vision-as-a-Tool: Visual Harness for Multimodal Agentic Coding**, based on [arXiv v1](https://arxiv.org/abs/2611.17797v1), submitted on November 13, 2026. The paper introduces the VaaT paradigm and implements VHarness, which wraps an external multimodal model in five visual actions. It improves final quality across three visual coding tasks while substantially increasing inference investment. Both aspects matter.

## 1. Topic: who checks whether running code looks right?

Visual coding translates requirements in images into executable code: HTML/CSS from webpage screenshots, SVG from raster images, or Blender scripts from multiple views. A system must generate valid code, execute it, render the result, and compare that result against the target.

This creates a feedback process: observe the target, construct an artifact, render, identify discrepancies, and revise. Discrepancy judgments determine the usefulness of edits and influence stopping. Button locations, font weights, occlusion, and 3D part connectivity can all exceed a single model’s reliable perception.

One design lets the coding model inspect images directly, optionally through cropping and zooming. Another delegates visual judgments to an external model and returns textual or structured feedback. This gives text-only coding models a visual interface and lets multimodal models request additional analysis. Evaluating this design requires final-artifact quality, feedback reliability, and additional cost together.

## 2. Related work: bringing visual input and feedback into coding

| Work or direction | Existing exploration | This paper’s emphasis |
| --- | --- | --- |
| [Design2Code](https://aclanthology.org/2025.naacl-long.199/) | Screenshot-to-code generation and automated front-end reconstruction evaluation | Extends initial understanding into ongoing visual diagnosis |
| [3DCodeBench](https://arxiv.org/abs/2606.01057) | Evaluates procedural 3D reconstruction through agent-generated code | Introduces visual-feedback tools into multi-view modeling and checks geometric improvements |
| Cropping and zooming tools | Help a model examine regions, while interpretation remains with the coding model | Makes interpretation and comparison themselves callable services returning actionable information |

VaaT is the organizational paradigm of treating visual reasoning as a tool. VHarness is its concrete implementation. The backend multimodal model supplies the tools’ visual capability. These should not be confused with one newly trained model. The work primarily organizes existing models through a harness, interfaces, and prompts; it does not introduce a new model-training algorithm. [Section 2](https://arxiv.org/html/2611.17797v1#S2)

## 3. Research questions: what does tool-based vision enable?

We group the paper’s questions into three themes to organize the method and evidence.

1. **Can visual judgment be separated from the coding model?** Can text-only models perform visual coding through external feedback, and can multimodal models still benefit?
2. **How can external vision become a dependable interface?** How do five defined actions compare with a single free-form multimodal query tool?
3. **How much additional execution does better final quality require?** What refinement process produces improvement, and does an advantage remain under equal budgets?

Strict budget attribution in the third theme is our further scrutiny. The paper reports tokens and action statistics but does not provide a cost-matched main experiment.

## 4. Method: turn target images into feedback and code revisions

![VHarness connects coding, intrinsic vision, and external visual tools](../../assets/img/blog/vharness/overview.png "Figure 1 · Target inputs appear on the left; the agent selects tools, writes code, and decides its next step in the middle; previous renders appear above; five visual actions appear below. Calls interleave on demand rather than forming a fixed pipeline. Original Figure 1, PDF page 1; complete diagram cropped without redrawing. Copyright Haolin Yang and coauthors.")

### Step 1: provide targets, a coding environment, and a renderer

Inputs include target images and a workspace. HTML tasks also supply human-verified visual assets without layout coordinates. SVG tasks require pure-vector code. The 3D task supplies four reference views; the agent writes a Blender script while a shared renderer controls cameras, lighting, screenshots, and GLB export.

The agent can read files, execute commands, write code, and edit code. Multimodal agents retain direct image inspection. Text-only agents depend on textual or structured observations returned by the tools. [Appendix A.1](https://arxiv.org/html/2611.17797v1#A1.SS1)

### Step 2: obtain actionable observations through five actions

VHarness runs a persistent FastMCP server and registers five MCP actions in the Claude Code harness. The main experiments use **Gemini-3.8-Flash** as the visual backend.

| Action | Input and output | Role in code revision |
| --- | --- | --- |
| transcribe | Target image → global structure; a layout tree for 2D or parts, spatial relations, and materials for 3D | Establishes the initial artifact’s organization |
| grep | Image and textual query → matching elements, categories, bounding boxes, and related fields | Locates the elements to modify |
| inspect | Image or region → text and typography, or appearance and geometric details | Supplies local details for more informed implementation |
| align | Region and proposed text/specification → Boolean match judgment | Checks a local content assertion |
| diff | Target and current render → discrepancies or paired region boxes | Identifies deviations for the next revision |

*Source: [Section 2.2 and Appendices A.3–A.4](https://arxiv.org/html/2611.17797v1#S2.SS2).*

The names resemble shell utilities, but their outputs are model inferences. For example, grep requests JSON boxes normalized to 0–1000 coordinates. The text mode of inspect requests transcription plus font family, weight, width, slant, and text color. The diff action can rank discrepancies by visual prominence or return paired target/render boxes.

The scope of align deserves care. Its appendix prompt checks **meaning and wording while ignoring fonts**. Therefore, match=true does not certify typography, placement, overall aesthetics, or all task requirements. Tool feedback supports a judgment; it is not automatically calibrated ground truth.

![Queries and responses for the five visual actions](../../assets/img/blog/vharness/actions.png "Figure 2 · Read the target and highlighted regions on the left against five query/response examples on the right: a structure tree, localization boxes, detailed inspection, a match judgment, and target/render discrepancies. Original Figure 3, PDF page 7; complete diagram cropped without redrawing. Copyright the original authors.")

### Step 3: select tools for the current question, edit, and render again

The agent decides when to invoke tools. It may obtain structure before locating details, or compare a render directly against its target and investigate discrepancies afterward. The paper does not force one call to every action on each iteration.

As a teaching example, a workflow could locate a text passage, check wrapping and weight, edit CSS, render again, and compare discrepancies. This illustrates the idea; it is not a fixed algorithm followed by every reported trajectory.

Neither group has a forced minimum iteration count or an equal token budget. Baselines judge completion through intrinsic vision. VHarness agents use external feedback to inspect remaining discrepancies and decide what to do next. This is part of the method, and it also means final-quality comparisons incorporate additional computation. [Section 2.3](https://arxiv.org/html/2611.17797v1#S2.SS3)

### Step 4: preserve artifacts and separate feedback from final evaluation

Tool feedback guides revisions during execution. Final evaluation independently scores generated HTML, SVG, and meshes with image or geometric measures. The experiment does not simply use diff’s own claim that the images match as its final score.

As of November 22, 2026, the [official repository](https://github.com/TidalHarley/Vision-as-a-Tool/tree/7ae2705dee8c957f8e375adc6ab48e06074c11ff) linked by the project page contains only a notice that code is under review and planned for release. We checked the paper’s interfaces and prompts but could not inspect a complete implementation or independently rerun it from that repository.

## 5. Experiments and results: better resemblance with more computation

### Main setup: three tasks on the same underlying harness

| Task | Samples and inputs | Final outputs | Important restrictions |
| --- | --- | --- | --- |
| Image-to-HTML | 100 complex webpage, magazine, poster, and slide screenshots with assets | Self-contained HTML/CSS | Assets provide filenames and native dimensions, without positions or layout metadata |
| Image-to-SVG | 100 complex raster designs | Standalone pure-vector SVG | Embedded images, base64, and traced bitmaps prohibited |
| Image-to-3D | 100 randomly sampled 3DCodeBench cases, four reference views each | Blender Python, GLB, and corresponding renders | Shared cameras, lighting, and material/rendering process |

*Source: [Section 3.1 and Appendices A.1–A.2](https://arxiv.org/html/2611.17797v1#S3.SS1). Because some original images did not match their meshes, the authors regenerate ground-truth meshes and four views from official material scripts to align inputs with ground truth.*

Four multimodal coding models run on the Claude Code harness, each with and without VHarness. Baselines can use image-processing libraries to assist intrinsic vision; the treatment additionally receives five actions. Text-only GLM-5.2 is evaluated only with tools because it cannot directly consume baseline image inputs. Budget constraints limit it to **50 random cases per task**. Most configurations use high reasoning and a 200K context window; the supplementary GPT-6-astra experiment uses low reasoning. [Section 3.2 and Table 4](https://arxiv.org/html/2611.17797v1#S3.SS2)

The 2D metrics include SigLIP2 and DINOv2 similarities, LPIPS distance, SSIM, pixel error, and edge agreement. The 3D task additionally uses Uni3D similarity and normalized bidirectional squared Chamfer distance. Following the official protocol, Chamfer takes the minimum over four canonical yaw rotations. These are **automated similarities of final artifacts**, not human aesthetic ratings, functional pass rates, or best-of-N sampling scores. [Appendix B.2](https://arxiv.org/html/2611.17797v1#A2.SS2)

### Main results: paired comparisons with the same coding model

The following excerpts three complementary 2D metrics. Arrows mean baseline → VHarness; each row aggregates the same 100 task cases for that model.

| Task and model | SigLIP2 ↑ | LPIPS ↓ | Edge F1 ↑ |
| --- | ---: | ---: | ---: |
| HTML · GPT-5.5 | 0.5773 → 0.6319 | 0.2277 → 0.1820 | 0.5389 → 0.5820 |
| HTML · GPT-5.6-sol | 0.6527 → 0.6859 | 0.1635 → 0.1414 | 0.6517 → 0.6936 |
| HTML · Claude Opus 4.8 | 0.3908 → 0.5077 | 0.4596 → 0.2974 | 0.3257 → 0.4316 |
| HTML · GLM-5.3-Flash | 0.6743 → 0.7553 | 0.1486 → 0.0937 | 0.7089 → 0.8059 |
| SVG · GPT-5.5 | 0.6265 → 0.6537 | 0.1537 → 0.1266 | 0.6141 → 0.6478 |
| SVG · GPT-5.6-sol | 0.6703 → 0.6830 | 0.1087 → 0.1001 | 0.6985 → 0.7020 |
| SVG · Claude Opus 4.8 | 0.4774 → 0.5502 | 0.3759 → 0.2605 | 0.3165 → 0.4360 |
| SVG · GLM-5.3-Flash | 0.6887 → 0.7095 | 0.0943 → 0.0778 | 0.7262 → 0.7671 |

*Source: [Table 1(a–b), PDF page 5](https://arxiv.org/pdf/2611.17797v1#page=5). Preferred directions appear in the headers; different metrics are not added together.*

| 3D model | DINOv2 ↑ | Uni3D ↑ | Chamfer ↓ |
| --- | ---: | ---: | ---: |
| GPT-5.5 | 0.6622 → 0.7496 | 0.7575 → 0.7933 | 0.0094 → 0.0058 |
| GPT-5.6-sol | 0.7046 → 0.8122 | 0.7738 → 0.8496 | 0.0157 → 0.0035 |
| Claude Opus 4.8 | 0.5342 → 0.7017 | 0.7129 → 0.7863 | 0.0339 → 0.0086 |
| GLM-5.3-Flash | 0.7593 → 0.8190 | 0.8154 → 0.8545 | 0.0056 → 0.0035 |

*Source: [Table 1(c)](https://arxiv.org/pdf/2611.17797v1#page=5), also 100 cases per configuration.*

All reported main-table metrics improve for the four multimodal models across the three tasks. This supports better final resemblance under the tested execution settings. Gains vary: GPT-5.6-sol’s SVG Edge F1 increases only **0.0035**, whereas its 3D Chamfer decreases from **0.0157 to 0.0035**. The paper does not provide confidence intervals or multi-seed errors for these main results, nor does it test accessibility, interaction correctness, or physical usability of 3D objects.

### Text-only coding: compare the same 50 cases

Comparing GLM-5.2’s 50 cases directly with others’ 100 cases can confound sample composition. An appendix reports the identical 50-case subsets. We excerpt one 2D distance and one geometric distance.

| Configuration on the same subset | HTML LPIPS ↓ | SVG LPIPS ↓ | 3D Chamfer ↓ |
| --- | ---: | ---: | ---: |
| GPT-5.5, baseline | 0.2129 | 0.1546 | 0.0100 |
| GPT-5.6-sol, baseline | 0.1694 | 0.1137 | 0.0172 |
| GLM-5.2, VHarness | 0.2028 | 0.1219 | 0.0092 |

*Source: [Table 8, Appendix C.2](https://arxiv.org/html/2611.17797v1#A3.SS2). The same 50 cases are used per task; rankings can differ across metrics.*

This supports visual coding by a text-only model through external visual services, with competitive results on some metrics. It does not give GLM-5.2 a paired no-tool improvement and does not show superiority to multimodal models on every measure. The system’s visual capability still comes from the multimodal backend it calls.

### Interface ablation: five actions versus free-form queries

GPT-5.6-sol is compared under three settings on 100 3D cases. Freestyle uses the same Gemini-3.8-Flash backend through one general query MCP interface, with usage examples.

| Metric | Baseline | Freestyle | Five-action VHarness |
| --- | ---: | ---: | ---: |
| SigLIP2 ↑ | 0.6400 | 0.6677 | 0.7212 |
| DINOv2 ↑ | 0.7046 | 0.7481 | 0.8122 |
| LPIPS ↓ | 0.1211 | 0.1028 | 0.0634 |
| Uni3D ↑ | 0.7738 | 0.8255 | 0.8496 |
| Chamfer ↓ | 0.0157 | 0.0070 | 0.0035 |

*Source: [Table 3, Section 3.4](https://arxiv.org/html/2611.17797v1#S3.SS4).*

Free-form access already helps, and five actions improve further, supporting defined queries and outputs in this setting. This is not an action-by-action removal study: it neither proves every action indispensable nor isolates interface effects under equal call counts and compute.

A supplementary experiment uses GPT-6-astra as both coding agent and visual backend on 100 SVG cases. SigLIP2 rises from **0.7368 to 0.7529**, while LPIPS falls from **0.0572 to 0.0473**. It supports benefits from tool-based organization and additional calls even with the same underlying model capability, but does not attribute all gains to capability separation alone. [Table 2](https://arxiv.org/pdf/2611.17797v1#page=7)

### Cost and process: more feedback leads to more execution

The following reports GPT-5.6-sol’s **mean cumulative recorded coding-agent output tokens per case**.

| Task | Baseline | VHarness | Approximate multiplier |
| --- | ---: | ---: | ---: |
| HTML | 23,825 | 62,005 | 2.60× |
| SVG | 16,301 | 64,841 | 3.98× |
| 3D | 17,918 | 104,543 | 5.83× |

*Source: [Table 5, Appendix C.1](https://arxiv.org/html/2611.17797v1#A3.SS1). Multipliers are calculated here from the reported values. This table does not capture all external visual-backend calls and input costs, and is not a dollar-cost estimate.*

For text-only GLM-5.2, mean SVG output reaches **1,971,312 tokens per case**. This accumulates across calls; it is not a single context length. Its mean visual-action calls per case are **733.0, 366.4, and 443.8** for HTML, SVG, and 3D. [Tables 5–6](https://arxiv.org/html/2611.17797v1#A3.SS1)

Trajectory analysis shows higher similarity at matched early render iterations and continued refinement afterward. Dashed baseline segments after termination merely extend the last score; they do not represent further execution. Equal render counts still do not imply equal tokens, visual calls, or time. The evidence supports better final artifacts from this complete execution scheme; equal-cost superiority remains untested. [Figure 4 and Appendix C.3](https://arxiv.org/html/2611.17797v1#A3.SS3)

## 6. Our reflections

### Topic reflection: what is this field studying?

An agent’s capability depends on its model, what it can observe, how it expresses questions, and whether feedback produces effective revisions. VHarness organizes visual questions into structure, location, attributes, assertions, and differences, connecting feedback to actual artifact edits. Scientific agents could similarly expose figure checks and experimental-visualization analysis through tools with defined outputs.

### Limitations reflection: what remains unresolved?

1. **Quality and computation are not fully separated.** Output tokens and tool calls rise substantially, without complete comparisons under equal cost, time, and budgets.
2. **Visual feedback can itself be wrong.** Boxes, text, and discrepancies are inferred by models; Boolean judgments have limited scope. The paper does not systematically measure how incorrect feedback affects edits and stopping.
3. **Task and reproduction coverage remain limited.** Evaluation concerns static pages, graphics, and individual objects, with limited interactive-state or functional testing. The public repository cannot yet support reproduction, and per-action ablations are absent.

### Solution reflection: which directions could address these problems?

1. **Plot quality against total investment.** Compare intrinsic vision, free-form tools, and five actions under fixed cost or runtime, including the coding model, visual backend, rendering, and retries.
2. **Independently verify feedback.** Record judgments and corresponding edits; label false alarms, missed discrepancies, and harmful revisions. Separate text, placement, style, and functional assertions, and study stopping under uncertainty.
3. **Extend reproducible evaluation to dynamic tasks.** Release code, cases, and configurations; remove actions individually; add multi-state webpages, interaction replays, and temporally consistent 3D scenes, evaluating visual quality and functionality together.

*Based on the [v1 PDF](https://arxiv.org/pdf/2611.17797v1), [project page](https://vision-as-a-tool.github.io/), and repository snapshot above. This is an independent reading. Original Figures 1 and 3 are limited quotations for method discussion, credited to Haolin Yang and coauthors; only surrounding page content is cropped, without redrawing. The arXiv page lists a perpetual non-exclusive distribution license, which we do not mislabel as a Creative Commons license. Tables excerpt experimental data. Calculated multipliers, interpretations, and proposed directions are our analysis.*
