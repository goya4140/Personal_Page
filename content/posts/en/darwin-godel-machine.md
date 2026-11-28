If an agent modifies its own code and immediately scores worse, should that version be kept? The Darwin Gödel Machine (DGM) keeps versions that retain basic editing ability and allows them to have descendants. The paper reports **20.0% to 50.0%** on its SWE-bench Verified subset and **14.2% to 30.7%** on full Polyglot. Some intermediate versions score lower before enabling useful changes. [Jenny Zhang et al., ICLR 2026, arXiv v3](https://arxiv.org/abs/2505.22954v3)

## 1. Understanding the Topic: Why Keep a Weaker Branch?

A software change can make an editing interface more flexible while invalidating its old instructions. Discarding it immediately removes the chance to make the instructions work with the new interface. Retaining several branches costs more evaluation and requires deciding where to invest the next run. Automated harness development faces the same trade-off.

## 2. Related Work: Proof, Automated Design, and Archives

The [Gödel Machine](https://arxiv.org/abs/cs/0309048) considers self-modification with provable benefit. DGM uses empirical task performance. [Automated Design of Agentic Systems](https://arxiv.org/abs/2408.08435) uses a meta-agent to propose and search candidate designs. In DGM, an archived coding agent selected as parent can develop its own components, so the developer can change with the version. [Sections 2–3](https://arxiv.org/html/2505.22954v3#S3)

## 3. Research Questions: Do the Gains Transfer?

1. Can changes to tools, prompts, and execution logic improve coding-task success with frozen model weights?
2. How much do retaining branches and allowing descendants to develop their own harnesses contribute?
3. Does a selected harness retain its gains under a different executor or benchmark?

## 4. Understanding the Method: From Parent to Evaluated Child

![DGM selects parents from an archive, evaluates new versions, and retains branches](../assets/img/blog/darwin-godel-machine/overview.png "Figure 1 · A selected parent generates changes to its harness. Separate coding tasks evaluate the child and determine whether it is archived. Source: v3 Figure 1, PDF page 2, reproduced unchanged.")

DGM starts with a simple coding agent. Parent selection favors better-performing agents that have fewer descendants. A selected parent uses evaluation history to propose and implement changes in its own harness. Tools and execution logic can change. Model weights and the outer archive search stay fixed. [Section 3](https://arxiv.org/html/2505.22954v3#S3)

A child is checked for basic editing functionality before progressively larger evaluations. Versions that compile and retain editing ability can enter the archive even when they score below their parent. The archive's best score can therefore improve while the lineage of its final best version has temporary setbacks. [Section 4.2 and Figure 3](https://arxiv.org/html/2505.22954v3#S4.SS2)

## 5. Experimental Design and Results

### Main Evaluation: After 80 Search Iterations

The paper runs **80** iterations on each of SWE-bench Verified and Polyglot. Self-modification uses Claude 3.5 Sonnet (New). Downstream execution uses Claude 3.5 Sonnet (New) on SWE-bench and o3-mini on Polyglot. The SWE-bench evaluation expands in stages to **200** tasks for strong candidates. The Polyglot search uses a **50**-task setting. A separate full Polyglot comparison evaluates the initial and selected agents under pass@1. [Setup and results](https://arxiv.org/html/2505.22954v3#S4)

| Evaluation | Initial agent | Best discovered agent |
| --- | ---: | ---: |
| SWE-bench Verified subset used | 20.0% | 50.0% |
| Polyglot search subset | 14.0% | 38.0% |
| Full Polyglot | 14.2% | 30.7% |

The full Polyglot gain is **16.5 percentage points**, compared with **24.0** on the search subset. The latter helps select candidates and is included in the full evaluation. The paper also evaluates transfer to another benchmark to test a different task distribution. [Section 4.4](https://arxiv.org/html/2505.22954v3#S4.SS4)

### Supporting Evaluation: What Happens Without Branches?

![SWE-bench progress across archive average, archive best, and the final agent's lineage](../assets/img/blog/darwin-godel-machine/progress.png "Figure 2 · The blue line tracks the best archived result. The dark line follows the final version's ancestors. Source: the original standalone right panel of v3 Figure 3, PDF page 7.")

Keeping only the most recent version that can edit code yields **23.0%** on SWE-bench and **14.0%** on Polyglot. Holding the developer fixed yields **39.0%** and **28.0%**. The full method leads both comparisons, while the estimated cost of one SWE-bench run is roughly **$22,000** for DGM and **$10,000** for either main ablation. The reported comparison leaves cost-matched performance open. [Appendix Table 1 and cost estimates](https://arxiv.org/pdf/2505.22954v3#page=25) · [Appendix E.1](https://arxiv.org/pdf/2505.22954v3#page=32)

In cross-benchmark tests, the harness selected on SWE-bench reaches **28.9%** on Polyglot against **14.2%** initially. The reverse transfer gives **24.5%** against **20.0%**. Replacing the executor with o3-mini on the SWE-bench subset yields **23.0% to 33.0%** in the reported comparison. These results apply to the selected artifacts and settings. [Figure 4](https://arxiv.org/html/2505.22954v3#S4.F4)

## 6. Our Reflections

### Topic Reflection: What Is This Field Studying?

An archive changes which failures can be productive. A branch can score poorly immediately after introducing a tool, and a later descendant can discover a complementary change that makes the tool useful.

### Limitation Reflection: What Remains Unresolved?

Candidate selection uses some of the same tasks as performance estimates, so repeated search and randomness can affect the best observed score. Costs are unequal. Basic editing checks cover one capability, whereas deployment requires independent checks of reliability and permissions. The experiments cover coding under a finite budget. [Sections 5–6](https://arxiv.org/html/2505.22954v3#S5)

### Solution Reflection: What Directions Could Address These Issues?

Compare archive search, best-only selection, and a simple random search under the same total cost. Report distributions of final performance and cost over independent runs. Use tasks and deployment checks separate from the search, and keep the evaluator fixed outside the candidate. Retaining lineage, versions, and evidence helps reviewers trace the effects of individual changes.

*Figures are from Zhang et al., DGM v3, and are reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*
