Given a powder X-ray diffraction pattern, how can a research agent decide whether a crystal structure explains the measurement? Gan Jiang integrates specialist tools that propose candidates with explicit checks against measured patterns and physical constraints. When analysis exposes a recurring failure, the system can revise the procedure and test the new version on separate samples. [Paper v1, Bin Cao et al., October 6, 2026](https://arxiv.org/abs/2610.07862v1)

## 1. Understanding the Topic: What Can a Diffraction Pattern Tell Us?

A powder diffractometer records X-ray intensity at different scattering angles. Peak positions constrain lattice-plane spacings, relative intensities inform atomic arrangements, and peak widths also reflect crystallite size, strain, and instrumentation. When several phases coexist, peaks can overlap. The same strong reflection can support several candidates, while small but reproducible extra reflections may change the conclusion.

**Phase identification** proposes which phases are present. **Structural refinement** starts from a proposed model and varies eligible parameters to explain the measured profile. Even when the total residual decreases, analysts still need to inspect its location, check parameter plausibility, and ask whether another structure could account for the same data. [Paper Figure 2](https://arxiv.org/html/2610.07862v1#Sx2.F2)

## 2. Related Work: From Diffraction Tools to Revisable Procedures

| Work | Problem addressed | Role in this reading |
| --- | --- | --- |
| [XMatcher](https://arxiv.org/abs/2607.17162) | Simulates a peak library from known structures and searches by positions, intensities, and chemical constraints | Provides inspectable peak matches. AutoMix evaluates combinations of candidates |
| [GSAS-II](https://doi.org/10.1107/S0021889813003531) | Performs crystallographic calculations and powder diffraction refinement | One of the numerical backends Gan Jiang can route to |
| [Memento-Skills](https://arxiv.org/abs/2603.18743) | Revises external skills by reflecting on task trajectories | Gan Jiang applies the idea to diffraction, using traces, residuals, and structural plausibility to guide revisions |

## 3. Research Questions: Which Capabilities Require Separate Tests?

We organize the paper around three questions:

1. **Identification.** Given a diffraction pattern, can the system rank the correct structure first or recover all phases in a mixture? How does composition information change the outcome?
2. **Refinement.** Given a supplied or evidence-checked structure, can the tools produce parameters and a calculated profile that explain the measurements?
3. **Skill transfer.** Can procedures revised on development data and then frozen improve refinement on held-out samples?

## 4. Understanding the Method: From Measured Profiles to Auditable Conclusions

![From measurement to a conclusion, and from the analysis record to a revised skill](../assets/img/blog/gan-jiang-xrd/workflow.svg "Figure 1 · Our schematic based on Figures 3–4 of the paper. The upper row follows analysis of the current sample. The lower row shows skill revision, validation, and freezing.")

**Step 1. Preserve the measurement and retrieve candidates.** Peak analysis and refinement retain the original angular range and intensity scale. XQueryer-LW receives a separate resampled and normalized input. XMatcher searches observed peaks for single-phase candidates, and supplied elements can enable a complementary XQueryer-LW search. Candidate structures are represented by crystallographic information files (CIFs) with source and ranking information. [Paper Figure 3a–b](https://arxiv.org/html/2610.07862v1#Sx2.F3)

**Step 2. Inspect candidates and decide whether to analyze a mixture.** XRDinspector compares calculated profiles with the measurement. Acceptance also requires applicable composition checks and mandatory peak evidence. In automatic mode, rejection of available single-phase hypotheses can trigger XMatcher-AutoMix or XDecomposer. Tool errors and insufficient single-phase evidence are separate states. AutoMix estimates contributions to retained peak evidence. Mass fractions require subsequent quantitative refinement. [Paper Figure 3b–c and Methods](https://arxiv.org/html/2610.07862v1#Sx2.F3)

**Step 3. Refine the model and retain an audit record.** An accepted phase set or a user-supplied CIF can enter FullProf, GSAS-II, or PyWPEM. The system compares aligned observed and calculated profiles and retains peak coverage, fit diagnostics, parameters, and execution history. Eligible convergence or iteration-budget failures allow at most one automatic retry. Unexplained peaks prompt reconsideration of the structural hypothesis. [Paper Figure 3d](https://arxiv.org/html/2610.07862v1#Sx2.F3)

**Step 4. Change the procedure for future samples.** Adjusting a lattice parameter for one sample is refinement. Revising when parameters should be released or how saved results should be checked changes the procedure for subsequent samples. Gan Jiang stores those changes in versioned skills with instructions and supporting code, and may adjust eligible refinement settings. The underlying language-model parameters and physical models stay fixed. [Paper Figure 4](https://arxiv.org/html/2610.07862v1#Sx2.F4)

## 5. Experimental Design and Results: Identification and Skill Transfer

### Main Evaluation: Single- and Multiphase Identification on DeltaXRDbench

The benchmark contains **62,044** patterns: **12,044** single-phase patterns and **50,000** two- or three-phase mixtures constructed from source profiles. MP500 is simulated, while RRUFF and opXRD come from experimental measurements. Evaluation matches submitted structures to references, retaining empty predictions in the denominator. Single-phase Top-1 checks the first candidate. Multiphase exact recovery requires a one-to-one match of the complete sets, while macro-F1 gives credit for partial recovery. [Paper Methods and benchmark repository](https://github.com/DeltaGanjiang/deltaxrdbench)

| Source | Single-phase samples | AutoXRD Top-1, XRD only | Gan Jiang Top-1, XRD only | Gan Jiang Top-1, reference composition |
| --- | ---: | ---: | ---: | ---: |
| MP500 | 10,000 | 58.00% | 96.30% | 99.90% |
| RRUFF | 1,164 | 58.47% | 81.78% | 92.16% |
| opXRD | 880 | 26.45% | 40.83% | 48.93% |

Single-phase baselines include Uni3DAR, PXRDGen-Flow, XtalNet-HMOF100, and AutoXRD. PXRDGen-Flow uses eligible subsets of some experimental data under its atom-count limit. The table shows AutoXRD, the strongest comparator, whose candidate library follows the same construction procedure as Gan Jiang's. Gan Jiang leads on all three sources without composition, with less than half correct on opXRD. Providing reference composition is a separate input condition whose practical availability depends on independent chemical measurements or sample information. [Paper Table 1](https://arxiv.org/html/2610.07862v1#Sx2.T1)

| Multiphase source | AutoXRD exact recovery, XRD only | Gan Jiang exact recovery, XRD only | Gan Jiang macro-F1, XRD only |
| --- | ---: | ---: | ---: |
| MP500 | 15.80% | 22.80% | 66.98% |
| RRUFF | 13.80% | 15.90% | 56.23% |
| opXRD | 1.30% | 3.10% | 27.04% |

Multiphase comparisons also include AutoAnalyzer and S-CNN. The evaluation samples **1,000** mixtures per source with each of three fixed seeds and averages the three runs. The **27.04% F1** and **3.10% exact recovery** on opXRD illustrate the gap between identifying some phases and recovering the entire set. Mixtures constructed from experimental profiles retain the complexity of measured peaks. Physical mixtures still require separate validation. [Paper Table 2](https://arxiv.org/html/2610.07862v1#Sx2.T2)

### Supporting Evaluation: Do Frozen Skills Improve Refinement?

The authors start from expert-optimized procedures, propose revisions from execution traces, run paired comparisons on development data, and freeze the selected procedures. The frozen workflows are compared with the original workflows on held-out samples. The outcome is a composite profile agreement score, with higher values preferred and failures or timeouts scored as zero. [Paper Figure 4](https://arxiv.org/html/2610.07862v1#Sx2.F4)

| Backend | Initial workflow | Frozen revised workflow | Change |
| --- | ---: | ---: | ---: |
| FullProf | 46.90 | 72.38 | +25.48 |
| GSAS-II | 39.01 | 60.02 | +21.01 |
| PyWPEM | 31.74 | 38.33 | +6.59 |

FullProf revisions include bounded searches over peak width and angular offset. GSAS-II revisions check parameter passing and saved results. Revision scope differs across the three backends, so the table shows changes within each branch. Applications include overlapping lead sulfate reflections, a five-phase ancient Egyptian cosmetic, an operating battery, and competing oxide configurations. The case studies show the structural outputs the workflow can produce. The held-out comparison directly tests whether revised procedures transfer. [Paper Figures 1 and 4](https://arxiv.org/html/2610.07862v1#Sx2.F1)

## 6. Our Reflections

### Topic Reflection: What Is This Field Studying?

Gan Jiang records evidence for each decision: where a candidate came from, which peaks support it, why the workflow switched branches, and what changed. These records help researchers audit an existing conclusion and revise the procedure in response to specific failures.

### Limitation Reflection: What Remains Unresolved?

**Library coverage and evidence discrimination interact.** A good fit cannot supply missing evidence when the correct phase is absent from the library or when the distinguishing angular range was never measured. **The sources of workflow gains remain unclear.** Frozen evaluations support transfer of the final procedures, and different revision scopes complicate attribution to individual rules. The paper describes regression testing and rollback for deployment, while its evaluation centers on controlled revisions and frozen comparisons. [Paper Discussion](https://arxiv.org/html/2610.07862v1#Sx3)

### Solution Reflection: What Directions Could Address These Issues?

On the same spectra, vary candidate-library coverage and mask the angular regions that distinguish candidates. Then report correct identifications, abstentions, and false confirmations separately. For skill learning, hold the backend and budget fixed, vary instructions, support code, and refinement settings separately, and compare held-out results across instruments while retaining failed runs. This would help determine whether accumulated experience improves candidate search, workflow execution, or judgment about physical evidence.

*The workflow schematic was drawn for this reading. See the authors’ [execution architecture](https://arxiv.org/html/2610.07862v1#Sx2.F3) and [skill-learning diagram](https://arxiv.org/html/2610.07862v1#Sx2.F4).*
