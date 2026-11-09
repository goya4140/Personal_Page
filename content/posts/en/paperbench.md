Can AI agents reproduce frontier AI research from scratch, and how can partial progress on such long tasks be scored automatically?

## Setting

Replication of 20 ICML 2024 Spotlight/Oral papers, with 8,316 independently scorable subtasks. Rubrics were developed with the corresponding paper authors, alongside a separate judge benchmark.

## Method and reported findings

Large tasks are decomposed hierarchically into artifact and subtask criteria, which an LLM judge scores. The strongest evaluated agent achieved an average replication score of 21.0%.

## Limitations and risks

Paper replication is expensive and requires specialized environments. A hierarchy or reference artifact may favor matching the gold solution over accepting another valid approach. Judge errors can accumulate through the tree.

## Place in our research framework

Use this under “hierarchical rubrics for long-horizon agents.” A reusable diagram is: task → hierarchical artifact rubric → judge → failure analysis.
