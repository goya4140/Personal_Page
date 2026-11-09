> **Scope:** AI for Writing / Story Generation studies model participation throughout ideation, planning, drafting, continuation, revision, and evaluation. This guide focuses on long-form planning, state memory, interactive choices, and narrative evaluation.

## 1. What does this field study?

AI for Writing spans NLP, artificial intelligence, computational creativity, and human–computer interaction. Beyond fluent passages, it asks whether machines can understand writing goals, organize long-range structure, form causal events, maintain characters/worlds, and collaborate effectively with authors or readers.

Story generation is especially challenging because it is open-ended: one prompt admits many equally reasonable stories with different plots and expression. It therefore tests language, planning, commonsense reasoning, character modeling, creativity, and reader experience.

Existing research can be organized along the following dimensions.

| Dimension | Type | Core question |
|---|---|---|
| Primary author | Independent generation | Generate from prompts, themes, or outlines |
| Primary author | Author assistance | Human-led suggestions, continuation, rewriting, feedback, or local material |
| Scale | Short stories | A few sentences to hundreds of words; event completeness and endings |
| Scale | Long stories/novels | Thousands of words or more; planning, memory, long-range consistency |
| Control | Conditional generation | Follow themes, characters, style, emotional arcs, outlines, or knowledge |
| Control | Interactive generation | Authors/readers choose, edit, or provide feedback during generation |

The creative workflow commonly includes:

1. **Ideation:** Themes, characters, worlds, conflicts, and inspiration.
2. **Planning:** Plotlines, outlines, chapters, emotional arcs, and character goals.
3. **Drafting:** Realize plans as readable narrative.
4. **Revision:** Detect and rewrite repetition, contradictions, flat plots, and style issues.
5. **Evaluation:** Assess fluency, coherence, interest, creativity, and satisfaction of creative constraints.

> The central tension is that language models excel at local fluency without naturally ensuring global planning, while open, subjective, multidimensional story quality cannot be judged through reference-word overlap alone.

---

## 2. Core question: how to generate

### 2.1 Direct generation and continuation

The simplest setting supplies a title, prompt, or opening and asks the model to continue. It is flexible but can produce drift, repetition, sudden characters, inconsistent facts, rushed endings, and declining quality with length.

[Hierarchical Neural Story Generation](https://aclanthology.org/P18-1082/) introduces WritingPrompts and separates premise generation from story realization, addressing the inadequacy of word-by-word generation for high-level structure.

### 2.2 Plan-and-Write: planning before writing

A common long-form approach separates two levels:

\(x \rightarrow P \rightarrow Y\)

Here, \(x\) is the prompt/setting, \(P\) the plan, and \(Y\) the story.

Plans may be event sequences, keyword plotlines, chapter or hierarchical outlines, emotional arcs, or character goals. The generator realizes the plan section by section rather than continuing freely.

Key developments include:

- [Plan-and-Write](https://ojs.aaai.org/index.php/AAAI/article/view/4726), AAAI 2019: compares complete advance planning with interleaved planning/writing.
- [PlotMachines](https://aclanthology.org/2020.emnlp-main.349/), EMNLP 2020: tracks dynamic plot state during outline-conditioned generation.
- [Re3](https://aclanthology.org/2022.emnlp-main.296/), EMNLP 2022: generates global plans, recursively reinjects plans/state, reranks continuations, and revises facts.
- [DOC](https://aclanthology.org/2023.acl-long.190/), ACL 2023: detailed hierarchical outlines and fine-grained controllers for stories of thousands of words.
- [DOME](https://aclanthology.org/2025.naacl-long.63/), NAACL 2025: dynamically expands hierarchical outlines and uses temporal knowledge graphs for character/event changes.

The emerging understanding is that **long-form generation needs macro planning separated from local realization, with plans allowed to adapt during writing; longer context windows alone are insufficient**.

### 2.3 Memory, state, and knowledge

Long stories must track what has happened, including:

- Character attributes, goals, relationships, knowledge, and emotions.
- World rules, locations, objects, and social relationships.
- Events, causality, and chronology.
- Outstanding promises, foreshadowing, and unresolved conflicts.
- Current outline position and progress toward an ending.

Implementations include summaries, retrieval memories, character profiles, event graphs, knowledge graphs, and explicit state tables. [RecurrentGPT](https://arxiv.org/abs/2305.13304) uses natural-language long/short-term memory for paragraphwise generation. DOME adds temporal knowledge graphs to detect contextual conflicts.

### 2.4 Candidates, criticism, and revision

Another approach avoids accepting the first draft:

\(\text{Draft} \rightarrow \text{Critique} \rightarrow \text{Select/Revise}\)

Re3 reranks candidates by plot coherence and prompt relevance. [Collective Critics for Creative Story Generation](https://aclanthology.org/2024.emnlp-main.1046/), EMNLP 2024, uses multiple critics and a leader to improve plans and prose for coherence, creativity, and expressiveness. Evaluation enters the generation loop, connecting the two research questions.

### 2.5 Human–AI co-writing

AI can support authors rather than replace them:

- [Wordcraft](https://doi.org/10.1145/3490099.3511105), IUI 2022: continuation, substitution, and rewriting suggestions.
- [CoAuthor](https://arxiv.org/abs/2201.06796), CHI 2022: 1,445 GPT-3 writing sessions with 63 writers for studying collaboration.
- [Dramatron](https://arxiv.org/abs/2209.14958), CHI 2023: hierarchical generation of characters, plot points, scenes, and dialogue from a logline, used and evaluated by professional writers.
- [Plan, Write, and Revise](https://aclanthology.org/N19-4016/), INLG 2019: compares human involvement at different creative stages.

Good writing systems need controllable, understandable, reversible, editable processes alongside quality text.

---

## 3. Core question: how to evaluate

### 3.1 Why BLEU and ROUGE are insufficient

Story generation is strongly one-to-many. A good story need not share words with a reference. BLEU, ROUGE, and embedding similarity generally assess surface proximity rather than plot quality, creativity, or reader response reliably.

[UNION](https://aclanthology.org/2020.emnlp-main.736/) and [OpenMEVA](https://aclanthology.org/2021.acl-long.500/) show insufficient human correlation and difficulty detecting event-order errors, long-range incoherence, and causal-commonsense problems in common metrics.

### 3.2 Which dimensions matter?

Evaluation should extend beyond one overall score:

| Level | Dimensions | Questions |
|---|---|---|
| Language | Fluency, grammar, readability, style | Are sentences natural and voice/style stable? |
| Local narrative | Transitions, event plausibility | Does an event follow naturally from prior text? |
| Global narrative | Plot, causality, chronology, character consistency | Do facts from earlier chapters still hold? |
| Structure | Beginning, development, climax, ending, pacing | Is this a complete story rather than accumulated fragments? |
| Control | Prompts, outlines, style, constraints | Is it the requested story? |
| Creativity | Novelty, surprise, expression, interest | Does it avoid clichés while remaining plausible? |
| Reader | Immersion, emotion, empathy, desire to continue | Does the work affect readers? |

[DeltaScore](https://aclanthology.org/2023.findings-emnlp.353/) evaluates fluency, coherence, relevance, logicality, and interest. [Psychological Depth Scale](https://aclanthology.org/2024.emnlp-main.953/) draws on literary theory and reader experience to assess authenticity, complexity, emotion, empathy, and engagement.

### 3.3 Main automatic evaluation approaches

**1. Rules and structural checks**

Check conflicting character properties, reversed chronology, repeated plots, violations of world rules, and outline coverage. These are interpretable but cover only formalized errors.

**2. Learned reference-free metrics**

UNION distinguishes real stories from perturbed ones to detect repetition, logical conflicts, and long-range incoherence. OpenMEVA is a benchmark for testing correlation, generalization, robustness, and discourse-error detection rather than merely another metric.

**3. Perturbation-based evaluation**

DeltaScore perturbs stories along a quality dimension and measures language-model probability changes to assess that dimension.

**4. LLM-as-a-Judge**

[Do Language Models Enjoy Their Own Stories?](https://aclanthology.org/2024.tacl-1.62/), TACL 2024, examines substituting LLMs for human evaluation. LLM judges outperform traditional metrics at system level but remain sensitive to prompts, explanation quality, self-preference, and model biases. Decomposed checklists, swapped candidate order, multiple judges, and human calibration are preferable to one model’s overall score.

**5. Human readers**

Human evaluation remains central. Prefer pairwise preferences over asking readers to distinguish scores such as six and seven precisely. Ask which story is more coherent, interesting, faithful to its setting, or worth continuing, and whether readers can identify concrete contradictions.

### 3.4 A recommended evaluation combination

> Instead of seeking one universal score, combine **deterministic state checks, story-specific automated metrics, human-calibrated multidimensional LLM judges, and real-reader pairwise preferences/behavior**.

Report:

1. **Hard constraints:** Conflicts involving characters, chronology, objects, places, and narrative commitments.
2. **Generation quality:** Fluency, coherence, causality, relevance, style, creativity.
3. **Control:** Prompt adherence, outline coverage, goal achievement.
4. **Human outcomes:** Overall preference, desire to continue, emotional engagement.
5. **Process:** Writing/inference cost, recovery, and user interventions.

---

## 4. Reading list

### A. Surveys for a field map

1. [Text-to-Text Automatic Story Generation: A Survey](https://aclanthology.org/2026.eacl-srw.39/) — EACL SRW 2026; text-to-text work from 2021–2025.
2. [A Survey on LLMs for Story Generation](https://aclanthology.org/2025.findings-emnlp.750/) — Findings of EMNLP 2025; separates independent generation and author assistance.
3. [Narrative Theory-Driven LLM Methods for Automatic Story Generation and Understanding](https://arxiv.org/abs/2602.15851) — 2026; narrative-theory organization of generation, understanding, and evaluation.
4. [Automatic Story Generation: A Survey of Approaches](https://doi.org/10.1145/3453156) — ACM Computing Surveys 2021; symbolic planning, earlier neural methods, and evaluation history.

### B. Generation foundations and long-form work

5. [Hierarchical Neural Story Generation](https://aclanthology.org/P18-1082/) — ACL 2018; WritingPrompts and hierarchical generation.
6. [Plan-and-Write: Towards Better Automatic Storytelling](https://ojs.aaai.org/index.php/AAAI/article/view/4726) — AAAI 2019; explicit plotline planning.
7. [PlotMachines](https://aclanthology.org/2020.emnlp-main.349/) — EMNLP 2020; outline conditioning and dynamic plot state.
8. [Re3: Generating Longer Stories With Recursive Reprompting and Revision](https://aclanthology.org/2022.emnlp-main.296/) — EMNLP 2022; planning, candidate reranking, consistency revision.
9. [DOC: Improving Long Story Coherence With Detailed Outline Control](https://aclanthology.org/2023.acl-long.190/) — ACL 2023; detailed hierarchical control over thousands of words.
10. [Collective Critics for Creative Story Generation](https://aclanthology.org/2024.emnlp-main.1046/) — EMNLP 2024; iterative plan/prose improvement with multiple critics.
11. [Generating Long-form Story Using Dynamic Hierarchical Outlining with Memory-Enhancement](https://aclanthology.org/2025.naacl-long.63/) — NAACL 2025; dynamic outlines, temporal knowledge graphs, conflict detection.
12. [STORYTELLER: An Enhanced Plot-Planning Framework](https://aclanthology.org/2025.findings-acl.1071/) — Findings of ACL 2025; plot coherence and transitions.
13. [From Style to Story: A Curriculum Learning Approach for Imitative Novel Generation](https://aclanthology.org/2026.findings-acl.968/) — Findings of ACL 2026; imitation of style, characters, worlds, and plot.

### C. Story-specific evaluation

14. [UNION: An Unreferenced Metric for Evaluating Open-ended Story Generation](https://aclanthology.org/2020.emnlp-main.736/) — EMNLP 2020; reference-free story quality.
15. [OpenMEVA](https://aclanthology.org/2021.acl-long.500/) — ACL 2021; metric correlation, generalization, robustness, and discourse errors.
16. [DeltaScore](https://aclanthology.org/2023.findings-emnlp.353/) — Findings of EMNLP 2023; perturbation-based fine-grained evaluation.
17. [Do Language Models Enjoy Their Own Stories?](https://aclanthology.org/2024.tacl-1.62/) — TACL 2024; capabilities and biases of story judges.
18. [Measuring Psychological Depth in Language Models](https://aclanthology.org/2024.emnlp-main.953/) — EMNLP 2024; authenticity, emotion, complexity, and empathy from reader psychology.
19. [CoKe: Customizable Fine-Grained Story Evaluation](https://aclanthology.org/2025.gem-1.31/) — GEM 2025; customizable dimensions.
20. [Help Me Write a Story](https://aclanthology.org/2025.acl-long.1254/) — ACL 2025; human-injected problems for testing defect detection and feedback.

### D. Human–AI writing

21. [Plan, Write, and Revise](https://aclanthology.org/N19-4016/) — INLG 2019; human involvement across creative stages.
22. [Wordcraft](https://doi.org/10.1145/3490099.3511105) — IUI 2022; professional story-writing assistance.
23. [CoAuthor](https://arxiv.org/abs/2201.06796) — CHI 2022; large-scale human–GPT-3 writing-process data.
24. [Co-Writing Screenplays and Theatre Scripts with Language Models](https://arxiv.org/abs/2209.14958) — CHI 2023; Dramatron and professional-writer evaluation.

### E. Interactive fiction and reader choices

25. [How to Tame Your Plotline](https://aclanthology.org/2024.wnu-1.2/) — WNU 2024; generate a story segment and three actions per turn, then continue from user choice.
26. [RecurrentGPT](https://arxiv.org/abs/2305.13304) — 2023; long/short-term memory, long text, and candidate continuation plans.
27. [Procedural Generation of Interactive Stories Using Language Models](https://pcgworkshop.com/archive/freiknecht2020procedural.pdf) — 2020; analytical, masked, and free-generation choices.
28. [Branching Narratives: Character Decision Points Detection](https://aclanthology.org/2024.games-1.8/) — Games and NLP 2024; consequential character decisions.
29. [Generating Relaxed, Obvious, and Dilemma Choices with Dunyazad](https://ojs.aaai.org/index.php/AIIDE/article/view/12791) — AIIDE 2015; choices with different psychological effects.
30. [Towards a Theory of Choice Poetics](https://www.fdg2014.org/papers/fdg2014_paper_19.pdf) — FDG 2014; framing, options, and outcomes.
31. [Choose Your Own Adventure: Paired Suggestions](https://aclanthology.org/2021.naacl-main.279/) — NAACL 2021; evaluating continuations through human choices.
32. [Rushes: A Human Preference Dataset for Pluralistic Alignment](https://arxiv.org/abs/2607.20767) — 2026; 44,226 narrative choices from 8,167 users.
33. [Can LLM Agents Stick to the Script?](https://arxiv.org/abs/2608.08160) — ICML 2026; factual and narrative commitments in long interactions.

---

## 5. Suggested reading order

To develop a research proposal quickly:

1. **Overview:** A Survey on LLMs for Story Generation.
2. **Generation:** Plan-and-Write → Re3 → DOC → DOME.
3. **Evaluation:** UNION → OpenMEVA → DeltaScore → Do Language Models Enjoy Their Own Stories?
4. **Interactive tasks:** How to Tame Your Plotline → RecurrentGPT → CHADPOD → Dunyazad.
5. **Interactive evaluation:** Choice Poetics → Rushes → NCP-Bench.

The intended research picture is a **generation loop of planning, memory, prose, decisions, and state updates**, paired with evaluation covering text quality, story structure, choices, consequence fidelity, long-range consistency, and real-reader experience.

---

*Retrieved and compiled September 2, 2026. The list prioritizes original papers on ACL Anthology, AAAI, ACM/DOI, and arXiv.*
