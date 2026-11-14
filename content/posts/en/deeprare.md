> **Main finding:** DeepRare coordinates phenotype, case, knowledge, and genetic-analysis tools through a central LLM, producing evidence-supported differential diagnoses through retrieval, hypotheses, counterevidence, and verification. It leads substantially on multiple retrospective datasets, but demonstrating clinical benefit still requires prospective, multicenter, workflow-level validation.

## Paper card

| Item | Details |
|---|---|
| Title | *An agentic system for rare disease diagnosis with traceable reasoning* |
| System | **DeepRare** |
| Journal | *Nature* 651, 775–784 (2026) |
| Published online | 2026-02-18 |
| Task | Decision support for rare-disease differential diagnosis |
| Inputs | Free text, HPO phenotypes, WES-derived VCF, or combinations |
| Outputs | Top-K candidate diseases with traceable, evidence-supported explanations |
| Scale | 6,401 cases, 2,919 diseases, 14 specialties; sources in Asia, North America, and Europe |
| Paper | [Nature article](https://www.nature.com/articles/s41586-025-10097-9) |
| Code and product | [GitHub](https://github.com/MAGIC-AI4Med/DeepRare) · [DeepRare Web](https://deeprare.cn) |

---

## 1. What problem does the paper address?

More than 300 million people worldwide have rare diseases. Individual diseases are rare, but their combined spectrum is broad; approximately 80% are associated with genetic factors. Clinical difficulties include:

- **Phenotypic heterogeneity:** The same disease presents differently, while different diseases can look similar.
- **Long-tail knowledge:** More than 7,000 rare diseases have limited disease-specific training samples.
- **Rapidly changing knowledge:** New diseases and gene–phenotype relationships continue to emerge.
- **Heterogeneous inputs:** Complaints, records, HPO terms, laboratory results, and variants must be integrated.
- **Accountability:** Disease names alone are insufficient; physicians need reasons and supporting sources.

Traditional HPO-matching tools rank diseases well but often explain little. Standalone LLMs interact naturally but may hallucinate. Genetic tools are specialized but often depend strongly on sequencing. The authors hypothesize that **using an LLM as a workflow coordinator rather than the sole knowledge source can improve accuracy, updateability, and traceability together**.

## 2. How does DeepRare work?

![Figure 1: DeepRare architecture, knowledge tools, and benchmark comparisons; source: paper](https://media.springernature.com/lw685/springer-static/image/art%3A10.1038%2Fs41586-025-10097-9/MediaObjects/41586_2025_10097_Fig1_HTML.png)

*Figure 1: DeepRare’s three-layer architecture, knowledge/tool system, and benchmark comparisons. Source: paper.*

### Three-layer architecture

| Layer | Role | Responsibilities |
|---|---|---|
| Central host | Locally deployed DeepSeek-V3 by default, plus a memory bank | Decompose tasks, schedule tools, synthesize evidence, propose diagnoses, self-reflect |
| Agent servers | Six specialized agent types | Phenotype extraction, disease standardization, knowledge retrieval, similar-case retrieval, phenotype analysis, genetic analysis |
| External environment | More than 40 tools/data sources | PubMed, Crossref, Orphanet, OMIM, HPO, MedlinePlus, the web, case databases, and bioinformatics tools |

### Diagnostic workflow: from records to checkable candidates

1. **Standardize phenotypes:** Extract candidate phenotypes from narrative records and map them to HPO with BioLORD; discard entities with similarity below 0.8.
2. **Gather evidence in parallel:**
   - Knowledge agents search papers, rare-disease databases, and webpages.
   - Case agents retrieve the top 50 from 67,795 cases using embeddings, then rerank with a MedCPT cross-encoder.
   - Phenotype agents call specialized tools including PhenoBrain and PubCaseFinder.
3. **Process genetic data, if available:** Annotate VCF variants and rank using frequency, functional impact, conservation, pathogenicity, and inheritance.
4. **Form initial differential diagnoses:** The host integrates phenotypes, variants, similar cases, and knowledge.
5. **Self-reflect and seek counterevidence:** Search again to support or reject candidates; if all are excluded, deepen retrieval and repeat.
6. **Output and verify links:** Return top-K diseases, evidence-supported explanations, and sources; remove invalid URLs during postprocessing.

> **Interpretation:** Gains mainly come from system orchestration rather than a stronger base model. Ablations show relatively limited effects from changing the central LLM; case retrieval, web/medical knowledge, and self-reflection are complementary, with the complete system outperforming partial configurations.

## 3. How is it evaluated?

Data come from research papers, case reports, and clinical centers, with increasing difficulty. Main metrics are Recall@1, Recall@3, and Recall@5: whether the correct diagnosis appears first, among the top three, or among the top five.

- Public and hospital datasets total **6,401 cases**, **2,919 diseases**, and **14 specialties**.
- WES/VCF data for 168 Xinhua Hospital cases and 162 Hunan Children’s Hospital cases support multimodal evaluation.
- More than 15 baselines include traditional bioinformatics tools, general, reasoning, and medical LLMs, and other agent systems.
- Eight senior rare-disease specialists reviewed automated rankings; physician/LLM assessments had Pearson correlation **0.8689**.
- Ten associate-chief-level specialists verified cited evidence for 180 cases.
- Five physicians with over ten years’ clinical experience were compared with DeepRare on 163 Xinhua cases.

## 4. Results worth remembering

| Setting | DeepRare | Comparator | Interpretation |
|---|---:|---:|---|
| HPO-only mean Recall@1 across datasets | **57.18%** | Runner-up 33.39% | 23.79-percentage-point lead |
| HPO-only mean Recall@3 across datasets | **65.25%** | Runner-up approximately 46.60% | Correct diseases enter the top three more often |
| Xinhua: HPO + genetics Recall@1 | **69.1%** | Exomiser 55.9% | Integrating evidence exceeds a single bioinformatics workflow |
| Hunan: HPO + genetics Recall@1 | **63.6%** | Exomiser 58.0% | Advantage persists at the second center, with a smaller gap |
| Xinhua: Recall@1 before/after genetics | **39.9% → 69.1%** | — | 29.2-percentage-point gain |
| Hunan: Recall@1 before/after genetics | **33.3% → 63.6%** | — | 30.3-percentage-point gain |
| Expert comparison, 163 cases, Recall@1 | **64.4%** | Physicians’ mean 54.6% | Exceeds the expert mean on this controlled task |
| Expert comparison, 163 cases, Recall@5 | **78.5%** | Physicians’ mean 65.6% | Particularly useful for candidate generation |
| Cited-evidence accuracy | **95.4%** | Expert verification | Approximately 4.6% remains inaccurate or irrelevant |

![Figure 3: specialty, long-tail, expert, and phenotype–genetics comparisons; source: paper](https://media.springernature.com/lw685/springer-static/image/art%3A10.1038%2Fs41586-025-10097-9/MediaObjects/41586_2025_10097_Fig3_HTML.png)

*Figure 3: Cross-specialty and disease-long-tail results, expert comparisons, and phenotype–genetics evaluation. Source: paper.*

### What ablations show

- Standalone GPT-4o averages **25.60%** Recall@1 on five public datasets; within DeepRare it reaches **54.67%**.
- DeepSeek-V3 rises from **26.18%** to **56.94%**.
- Case retrieval contributes strongly when similar cases exist. Knowledge retrieval and self-reflection matter more without historical precedents.

The transferable lesson is that **reliable medical AI resembles a workflow with tools, memory, and review mechanisms more than a chatbot that memorizes more medical knowledge**.

## 5. Where does it fail?

Three senior physicians categorized 200 sampled cases where the correct diagnosis was absent from the top five:

| Failure mode | Share | Meaning |
|---|---:|---|
| Incorrect reasoning weights | **41.0%** | Broadly sound logic overweights nonspecific phenotypes and underweights key findings |
| Confusion with phenotypic mimics | **38.5%** | Overlapping presentations make molecular causes difficult to distinguish using HPO alone |
| Related etiology, different classification | **15.5%** | Identifies the pathological direction but misses the exact disease entity |
| Factual reasoning errors | **2.5%** | Incorrect medical facts |
| Incorrect evidence links | **2.5%** | Incorrect relationship between retrieved evidence and diagnosis |

Citation errors mainly include plausible but nonexistent URLs and materials unrelated to the true disease because the diagnosis itself is wrong.

## 6. My critical reading

### Which conclusions are relatively well supported?

- **Tool orchestration outperforms standalone LLMs:** Results align across base models, datasets, and ablations.
- **Phenotypes plus genetics outperform phenotypes alone:** Two independent hospital cohorts show gains of approximately 30 percentage points.
- **Top-K candidate generation has practical value:** Narrowing the search for physician review better reflects rare-disease practice than expecting a one-shot final diagnosis.
- **Failure analysis is useful:** The paper identifies weighting and mimic discrimination as bottlenecks rather than reporting averages alone.

### Which claims need qualification?

1. **Exceeding experts does not mean outperforming clinicians comprehensively.** The comparison covers 163 selected cases. Both physicians and system receive structured HPO extracted from outpatient records and list up to five candidates; they do not conduct complete consultations, select tests, interpret all findings, or bear clinical responsibility.
2. **This is a retrospective benchmark, not a prospective trial.** It does not establish shorter diagnostic journeys, lower misdiagnosis costs, better outcomes, or safe workflow use. Time/cost savings are closer to potential implications than directly measured causal outcomes.
3. **95.4% measures reliable, relevant references, not reasoning faithfulness.** Correct citations need not reflect the internal causal process producing an answer. “Traceable evidence” is more precise than “interpretable model mechanisms.”
4. **Automatic evaluation may remain biased.** GPT-4o locates the correct diagnosis in free-text lists. Strong expert correlation does not rule out stylistic preferences for similar LLM outputs; physicians assigned more favorable correct-diagnosis rankings in 10% of cases.
5. **Leakage is not fully excluded.** Exact case-database duplicates were removed, but literature cases, public benchmarks, pretraining corpora, and semantic near-duplicates may overlap, especially in literature-derived datasets.
6. **Calibration and abstention analyses are missing.** Recall@K does not show confidence reliability or establish when the system should say it does not know or escalate to genetics specialists.
7. **Deployment safety remains central.** Dynamic retrieval introduces webpage-quality variation, prompt injection, knowledge drift, and privacy risks. Local inference mitigates data export but does not automatically solve them.

> **Appropriate role:** An evidence-retrieval and differential-diagnosis copilot for rare-disease physicians, rather than an autonomous diagnostic system. Top-five candidates, sources, counterevidence, and human review matter more than one top-ranked answer.

## 7. Implications for medical AI and agent design

- **Put knowledge in tools/data sources and the LLM in coordination.** Updating medical knowledge need not require retraining the entire model.
- **Use structured intermediate representations.** HPO, standard disease identifiers, and variant annotations enable interoperability and auditing.
- **Retrieve both similar cases and authoritative knowledge.** One supplies precedents; the other standards and current evidence.
- **Make verification a product capability.** URL checks, source quality, relevance, counterevidence search, and version stamps belong in the workflow.
- **Design interaction around uncertainty.** Let clinicians edit HPO, inspect supporting/opposing evidence, compare candidates, and retain final authority.
- **Evaluate clinical utility beyond model metrics.** Measure time to diagnosis, test counts, referral paths, workload, missed serious diseases, calibration, and patient outcomes.

## 8. Review cards

**Q1: What most distinguishes DeepRare from a medical chatbot?**  
A: A central LLM schedules more than 40 tools and current knowledge sources, with memory, reflection, counterevidence retrieval, and link checks forming an auditable workflow.

**Q2: What is HPO, and why does it matter?**  
A: Human Phenotype Ontology is a standardized vocabulary for phenotypic abnormalities, making narrative findings computable, searchable, and interoperable.

**Q3: What is the strongest system-level evidence?**  
A: Multiple base LLMs substantially improve Recall@1 within the full agent workflow, supporting benefits from process/tool coordination.

**Q4: What causes most failures?**  
A: Incorrect phenotype weighting (41.0%) and confusion among similar diseases (38.5%), rather than purely factual errors.

**Q5: Why does 95.4% not establish completely reliable reasoning?**  
A: It mainly assesses reliable, relevant citations, not diagnostic correctness, causal faithfulness, or clinical workflow safety.

## 9. Suggested discussion questions

1. If adding only one safety module, prioritize calibration, abstention, or evidence grading—and why?
2. How would a prospective randomized study show shorter diagnostic journeys without unnecessary tests?
3. How can case retrieval avoid reproducing historical misdiagnoses and population biases?
4. Which follow-up questions maximize information gain for phenotypic mimics?
5. How should clinicians be shown the distinction between cited explanations and faithful model explanations?

---

## Further reading and resources

- [Full open-access Nature paper](https://www.nature.com/articles/s41586-025-10097-9)
- [DeepRare source code](https://github.com/MAGIC-AI4Med/DeepRare)
- [DeepRare Web](https://deeprare.cn)
- [RareBench dataset](https://huggingface.co/datasets/chenxz/RareBench)
- [Human Phenotype Ontology](https://hpo.jax.org)
- [Orphanet](https://www.orpha.net)
- [OMIM](https://www.omim.org)

> This note supports paper study and research discussion. It is not medical advice and does not replace clinicians, genetic counseling, or standard care pathways.
