Starting from one kidney CT slice, we first specify the image, question, answer, and reference annotation, then work toward understanding medical VLMs, hidden representations, and probes.

For clarity, suppose this CT contains both a kidney tumor and a kidney cyst. All example model answers below are hypothetical, not our experimental results. Tumors and cysts can coexist, and a cyst cannot simply be described as another malignant tumor. We retain that distinction throughout.

Compiled October 29, 2026. These examples explain research questions; they are not clinical judgments or formal experimental conclusions.

## 1. What tasks can a medical VLM receive?

VLM stands for Vision-Language Model: a model connecting images and language. Here, medical VLM mainly means a model that accepts medical images and textual instructions and responds in text.

For the same CT, we might ask, “Is there a kidney cyst in this slice?” We want an explicit presence/absence judgment. Alternatively, “What abnormalities are visible?” requires a description of findings.

“Write an imaging report” calls for a longer output, potentially including findings and impressions. We might also request coordinates or boxes identifying abnormal regions. These correspond to lesion-presence judgment, medical visual question answering, report generation, and localization.

Different questions about one image require different evaluations. Fluent reports still need checks of lesion identity and location; localization needs separate assessment. Pixelwise segmentation requires its own output design and validation.

For every experiment, write down four things:

- What does the model see?
- What is it asked?
- Which answer forms are allowed?
- What reference answer do we use?

Together, these make the task clearer. A “task protocol” refers to such concrete agreements.

Another distinction matters: a single CT slice provides one plane, while a complete examination provides more information. “Does this slice contain a cyst?” differs from “Does this patient have a cyst?” A cyst may appear on other slices but not the current one.

Our first study starts narrowly: **look at one slice and answer whether a specified lesion is present in that slice.** Clear scope makes answers and annotations easier to align.

## 2. Meet the models and data

With that task in mind, model names become easier to place.

**Qwen3-VL** is a general-purpose image–text model. We have already run a natural-image probing workflow with it, learning to supply images and save outputs and internal representations. Its medical abilities still require dedicated evaluation when applied to medical images. [Model introduction](https://arxiv.org/abs/2511.21631)

**LLaVA-Med** illustrates medical adaptation: how biomedical image–language data introduces a visual assistant to the domain. It is a useful starting point for understanding why general models need medical data, without first studying every architectural layer. [Paper](https://arxiv.org/abs/2306.00890)

Our planned implementation uses **MedGemma 1.5 4B**, which targets medical image–text generation. Choosing a concrete model lets us complete the workflow and examine performance on our task. [Official model card](https://developers.google.com/health-ai-developer-foundations/medgemma/model-card)

A simplified account of the computation is sufficient for now:

**Images become numerical features → image information interacts with the question → the model generates an answer token by token.**

The computation produces many numerical values. A “hidden representation” is a numerical record at a particular computational location. It is not directly readable like a report, and no coordinate is designated specifically for “cyst” or “tumor.” Relevant information may be distributed across many values.

We can extract this record at a specified location and study its relationship to lesions and final answers. That provides an entry into our research question.

We also need data that independently establishes whether an answer is correct.

Some datasets pair **images with physician reports**. MIMIC-CXR provides chest radiographs and reports for image–text and report research. A report corresponds to an examination that may contain multiple images, so descriptions must still be mapped to the appropriate image. [Dataset](https://physionet.org/content/mimic-cxr/2.1.0/)

Other datasets pair **images with region annotations**. Our selected KiTS23 includes kidney, tumor, and cyst segmentation. Think of an aligned map labeling pixels belonging to each structure. [Dataset](https://kits-challenge.org/kits23/)

These annotations allow us to derive reference answers about cyst presence on a slice. We must construct the presence/absence task from the original segmentation data; this explains the data-construction stage in our plan.

At inference, the model receives the original image and question; we retain region annotations for evaluation. Colored overlays help us inspect lesions, but the actual image-reading task uses unannotated images without colored hints.

## 3. What else do we want to know after a correct answer?

Return to the hypothetical CT. We ask whether a cyst is present, and the model answers yes, agreeing with the annotation.

After recording success, we can ask which information supported that judgment.

It might rely on cyst morphology, surrounding tissue, co-occurrence with another abnormality, or question wording. These remain possibilities. A single “yes” does not separate their contributions.

Alternatively, suppose a cyst is present but the model says no. Recording an error establishes failure on the question. Improving the model requires a more specific diagnosis: was lesion information inadequately represented during image processing, or was usable information present but absent from the final answer?

Interpretability asks a concrete question: **how can image evidence, internal computation, and the final answer be connected to understand a judgment?**

In medical tasks, abnormalities, locations, and conclusions need to be checked against the current image and independent references. Understanding dependencies can clarify what an improvement actually changes. Interpretability results themselves also need controlled validation.

You noted that such analysis is less visible when using coding agents. That is understandable: users mostly encounter patches, tests, and execution results. Researchers nevertheless probe code models for syntactic, structural, and semantic information. [What do pre-trained code models know about code?](https://arxiv.org/abs/2108.11308) is one example.

We are applying this kind of internal analysis to medical images and lesion judgments. Understanding that motivation makes the methods easier to place.

## 4. Start from the question, then choose an explanation method

The most immediate question is which image regions relate to an answer.

Spatial attribution and some attention analyses visualize regions or connections associated with a specified output. Grad-CAM, for example, uses gradients to construct localization maps. It was originally developed around CNNs and related architectures; applying it elsewhere requires identifying appropriate modules and outputs. [Paper](https://arxiv.org/abs/1610.02391)

A heatmap is an observational clue to compare with images and lesion annotations. Bright regions do not by themselves establish necessary causal reliance. Attention weights have similar interpretive boundaries. [Discussion](https://aclanthology.org/N19-1357/)

If the question is whether internal records contain information useful for predicting cyst presence, we can use a **probe**. It turns otherwise opaque numerical records into predictions comparable with lesion labels. Our project begins here.

If we then ask whether that information influences the original model’s decision, we can consider **interventions**: change inputs or internal representations in targeted ways, observe behavior, and compare random changes and intervention strengths. Amnesic Probing offers an approach that removes readable information and then examines behavior. [Paper](https://aclanthology.org/2021.tacl-1.10/)

The [POPE paper](https://aclanthology.org/2023.emnlp-main.20/) you shared also fits this map. It uses more stable presence questions to study behavior and biases involving frequency and co-occurrence. First establish a behavioral phenomenon, then use internal readouts and interventions to investigate it.

For now, this is enough of the broader map. Let us walk through probing itself.

## 5. Train a probe and examine what it reads

Suppose we have CT slices with independent cyst-present or cyst-absent labels.

The same medical VLM sees every image with the same question. Before answer generation, we save a hidden representation from a fixed location. Keeping the original model frozen, we train a simple classifier to predict cyst presence from those representations. That separately trained classifier is our probe.

It is a readout tool: labeled examples teach it which patterns of numerical variation relate to cyst labels.

Each image now has two judgments. The original model produces yes/no through its own generation process; the probe predicts through separately learned rules. We save both and compare each with the same independent annotation.

A subtle distinction matters: if a cyst is visible but the model answers no, the presence label remains positive. A study of whether the model answered correctly would require a separate answer-correctness label. Keeping these labels separate clarifies later experiments.

Split by patient: use some patients for training, others for selecting settings, and held-out patients for final evaluation. Adjacent slices from one patient are often similar. Patient separation helps assess generalization to new patients.

Strong probe performance on new cases provides specific evidence that the representation supports lesion prediction using this readout method.

That is a worthwhile finding, but the probe receives additional supervision. Its own capacity and dataset correlations may contribute. The Control Tasks work emphasizes controls when interpreting probe performance. We would borrow its logic and add random-label negative controls to check readout reliability. [Paper](https://aclanthology.org/D19-1275/)

Comparing original answers with probe predictions may then reveal an interesting disagreement.

## 6. First question: why do the judgments differ?

In our hypothetical example, the annotation says a cyst is present, the model says no, and the probe predicts yes.

Record the example as a possible difference between judgment procedures, then test whether the pattern recurs across independent cases.

Interpret cautiously. Extra probe training may learn a rule better suited to the current labels or exploit different clues. It is premature to say the original model “knew the answer but did not say it.” First establish the observation robustly.

The first experiment can be:

> **On the same independent cases, compare reference annotations, model answers, and probe predictions one by one, documenting agreement and disagreement.**

Inspect both probe-correct/model-wrong and model-correct/probe-wrong cases, alongside both-correct and both-wrong cases. A complete contingency table is more informative than a few selected examples.

This also exposes missing data. Selecting only slices where tumors and cysts coexist biases the sample toward positives. If every answer is yes, an always-yes classifier can achieve high accuracy. A meaningful presence task needs different lesion combinations, particularly appropriate negative slices.

After these preparations, the first results become interpretable. Even if the probe is no better than the original model, recorded errors and disagreements can guide subsequent questions.

## 7. What can one cyst score tell us?

Suppose the first experiment confirms that the probe predicts cysts on new patients. We can next examine how its score relates to the original model’s answer correctness.

A high score initially means only that this readout favors a positive prediction. It is not directly lesion-signal strength or the weight the original model assigns to that evidence.

Imagine two cases with similar cyst-probe scores but different answer correctness. To turn that observation into research, ask: **does other information reliably help predict this difference on new cases?**

Tumors are a natural candidate in our data. A slice may contain both lesions, and one representation may carry information about both. We can train another probe on the same representation to predict tumor presence.

The second experiment follows:

> **Predict original-model answer correctness from the cyst score alone, then add the tumor readout from the same representation and test whether prediction improves on independent cases.**

We would also analyze lesion size, slice position, and other factors, checking what the extra readout adds and whether it merely substitutes for measurable case difficulty.

If its benefit disappears after controlling these factors, narrow the interpretation. If a stable benefit remains, one cyst score has not captured all information related to answer behavior.

The direction is left to the data. Other lesions may accompany more errors, fewer errors, or no stable relationship. Intuitions such as “the tumor steals attention” remain candidate explanations awaiting evidence.

This studies what predicts model answers. We can then ask whether the representation direction we read actually affects the current decision.

## 8. Intervene and observe the original model

The first two steps are observational. To test influence, consider a narrowly defined intervention.

After a simple probe learns cyst prediction, we identify a numerical direction on which it relies—a coordinated pattern of changes across values. Remove that component from a selected representation, feed the modified representation into the original output layer, and observe the Yes/No decision at the same answer position.

This draws on Amnesic Probing. The initial study only ablates one learned direction; projection details and controls still need implementation decisions. First specify the comparison:

> **How does the current decision change with the original representation, removal of the cyst-readout direction, and matched random changes?**

Random controls are essential because arbitrary internal changes can degrade answers. Compare direction and magnitude, and check whether readouts for other lesions also deteriorate.

We would train an additional checking classifier to test whether cysts remain predictable through other patterns after modification. Looking only at the original probe is insufficient: its score is expected to change when its own direction is removed, and that does not show all cyst information has disappeared.

An effect exceeding matched random changes without general damage provides evidence that this part of the representation affects the current decision. Otherwise, narrow the hypothesis and investigate what the readout direction actually establishes.

Even with an effect, another question remains: how much of the direction reflects genuine cyst-related visual features? Answering that requires independent localization and verifiable spatial interventions. Each study should state precisely what it supports.

The assigned research question should now be easier to unpack:

> **To what extent does probe-readable lesion information in medical VLMs reflect the original model’s current lesion-presence decision?**

First test whether information is readable, then what answer differences one score captures, then whether the readout direction influences the native decision. Those three questions establish our starting point.

## Next: begin by understanding a few images

For the first practical step, place original CT slices, region annotations, and derived presence labels together. Locate lesions and explain why one slice is positive and another negative. Only then ask the model the same question and inspect its answer.

After checking a few images yourself, image presence, model answers, and probe predictions become three concrete objects. Data formats, extraction locations, and execution steps can then be tied to specific experimental operations.

We begin there: clarify one question, then carry that understanding forward.
