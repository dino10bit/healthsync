# **A Solo Developer's Guide to PRD Creation: Strategic Prompts**

**Version:** 1.8 | **Last Updated:** August 21, 2025

This guide is tailored for a solo developer building a mobile app. The prompts are organized into a sequential workflow to help you create a strategic, lean, and actionable Product Requirements Document.

### **Advanced Project Directory Structure for PRD Documents**

Before diving into the prompts, establish a clear directory structure to keep your project documentation organized. This ensures that all artifacts are easy to find, reference, and maintain.

```text

/your-app-name  
|  
├── README.md  
|  
├── 00\_strategy\_and\_vision/  
│   ├── 01\_strategic\_narrative.md  
│   ├── 02\_pr\_faq.md  
│   └── 03\_competitive\_analysis.md  
|  
├── 01\_research\_and\_validation/  
│   ├── user\_persona\_icp.md  
│   ├── validation\_plan.md  
│   └── ux\_research\_plan.md  
|  
├── 02\_product\_definition/  
│   ├── PRD\_MAIN.md  
│   ├── 01\_user\_story\_map.md  
│   ├── 02\_requirements\_functional.md  
│   └── 03\_requirements\_non\_functional.md  
|  
├── 03\_design\_and\_ux/  
│   ├── 01\_design\_principles.md  
│   ├── 02\_user\_flows.md  
│   └── 03\_wireframes/  
|  
├── 04\_technical\_architecture/  
│   ├── 01\_architecture\_overview.md  
│   ├── adrs/  
│   └── api\_contracts/  
|  
├── 05\_project\_management/  
│   ├── 01\_release\_plan.md  
│   └── 02\_definition\_of\_done.md  
|  
├── 06\_financials/  
│   ├── 01\_tco\_model.md  
│   └── 02\_roi\_analysis.md  
|  
├── 07\_go\_to\_market/  
│   ├── 01\_gtm\_strategy.md  
│   └── 02\_launch\_plan.md  
|  
└── 99\_archive/
```


### **Phase 0: Defining Documentation Structure**

*This foundational phase is about establishing a clear, organized, and maintainable structure for your project documentation from day one.*

#### **Foundational Setup**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **1\. Select a PRD Template** | **Prompt:** "Propose three distinct PRD templates suitable for a solo developer (e.g., a lean one-pager, a standard template, a PR-FAQ model). For each, analyze the pros and cons to help me select the most effective format for this project." | templates/03-prd-template.md |
| **2\. Define Documentation Scope** | **Prompt:** "Define the essential documentation required for this project beyond the PRD (e.g., a concise design spec, a high-level technical architecture overview, a changelog). Justify the inclusion of each artifact to ensure a lean but comprehensive documentation suite." | README.md |
| **3\. Establish a Single Source of Truth (SSoT)** | **Prompt:** "Outline a strategy for establishing a 'Single Source of Truth' (SSoT) for all project information. Recommend a primary tool (e.g., Notion, a Git repository) and justify its selection based on accessibility, versioning, and integration capabilities." | README.md |
| **4\. Generate a PRD Table of Contents** | **Prompt:** "Based on the selected template, generate a detailed Table of Contents for the PRD. This will serve as the foundational structure and checklist for the entire document." | docs/prd/02-product-scope.md |
| **5\. Define a Version Control Strategy** | **Prompt:** "Define a simple yet robust version control strategy for the PRD and other key documents. Outline the process for managing updates, revisions, and historical tracking to ensure clarity on the latest version." | README.md |

#### **Content & Governance**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **6\. Structure the 'Out of Scope' Section** | **Prompt:** "Draft a template for the 'Out of Scope' section of the PRD. What key areas and features should be explicitly excluded to maintain focus on the MVP and prevent scope creep?" | docs/prd/02-product-scope.md |
| **7\. Create a Project Glossary Framework** | **Prompt:** "Create a structure for a project glossary. List the key technical and business terms that should be defined upfront to ensure clarity and consistency throughout all documentation." | docs/prd/GLOSSARY.md |
| **8\. Plan for Visual Documentation** | **Prompt:** "Outline a plan for incorporating visual documentation. Specify the essential diagrams (e.g., user flows, architecture diagrams, wireframes) and recommend tools for their creation and integration." | docs/ux/60-brand-assets.md |
| **9\. Define a Document Review Process** | **Prompt:** "Outline a self-review checklist for the PRD. What key questions should I ask myself before finalizing a version to ensure it is complete, clear, and actionable?" | README.md |
| **10\. Draft a Documentation Maintenance Plan** | **Prompt:** "Draft a simple maintenance plan for the project documentation. Define the cadence and triggers for reviewing and updating documents to ensure they remain relevant as the project evolves." | docs/ops/22-maintenance.md |

#### **Automation & Tooling**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **11\. Implement a Global PRD Linter** | **Prompt:** "Run a comprehensive PRD linter across `docs/prd/**/*.md`, `docs/architecture/**/*.md`, and `docs/*/*.md`. Enforce rules: required sections present (summary, goals, KPIs, acceptance criteria), no missing acceptance criteria, no TODOs, no “TBD” placeholders, consistent units (ms/sec/GB/€/{currency}), and no inline private credentials. Output `reports/prd_lint/sarif_prd_lint.sarif` and `reports/prd_lint/prd_lint.csv` with rule ids, file, line, severity. Create `tools/lint/prd_rules.yml` with the rule set and a GitHub Action `.github/workflows/prd-lint.yml` to run on PRs. Open a draft PR that (a) adds the linter config, (b) attaches the report, and (c) creates GitHub issues for items with severity ≥ `{severity_threshold}` assigned to `{assignee}`." | tools/lint/prd_rules.yml |
| **12\. Generate a Full PRD and Dev Plan** | **Prompt:** "Clone `{repo}` on branch `{branch}`. Create a `docs/prd/{feature_name}_PRD.md` that contains: product summary, goals & KPIs, user personas, user stories, functional requirements (detailed), non-functional requirements (SLA/latency/availability), acceptance criteria (Gherkin-style), security/privacy requirements, rollout & migration plan, monitoring & observability checklist, and a phased milestone timeline with effort estimates (in story points and dev-days). Also generate a JIRA-style set of tickets (CSV) for the first 3 sprints and open a draft PR `feat/prd/{feature_name}` with these files. Include a short justification for each acceptance criterion. Output a one-paragraph executive summary at the top." | docs/prd/{feature_name}_PRD.md |

### **Phase 1: Strategic Framing & Vision**

*This phase is about defining the "why" behind your app and ensuring your idea is built on a solid foundation.*

#### **Core Vision & Narrative**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **13\. Craft a Strategic Narrative and Vision** | **Prompt:** "Act as a strategic advisor. For a new mobile application, '\[App Name\]', draft a 'Strategic Narrative'. This document should include a market opportunity analysis, the product's unique value proposition, and a compelling 'North Star' vision statement to guide the product development and investment thesis." | docs/prd/01-context-vision.md |
| **14\. Draft a 'Press Release (PR-FAQ)'** | **Prompt:** "Draft a future-dated internal Press Release for the launch of '\[App Name\]'. This document should articulate the customer benefits and market impact as if the launch were successful. Then, generate an accompanying FAQ to address critical questions from potential investors or stakeholders." | docs/prd/01-context-vision.md |
| **16\. Draft a 'Working Backwards' Document** | **Prompt:** "Synthesize the product vision into a 'Working Backwards' document. The document must originate from the ideal customer experience and deconstruct it to define the Minimum Viable Product (MVP) required to deliver that experience." | docs/prd/01-context-vision.md |
| **17\. Define Product Tenets** | **Prompt:** "Establish a set of 3-5 core product tenets. These should be memorable, actionable principles that will guide every product decision and trade-off (e.g., 'Simplicity over Complexity,' 'Privacy by Design')." | docs/prd/01-context-vision.md |

#### **Market & Competitive Analysis**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **15\. Analyze Your Competitive Advantage** | **Prompt:** "Conduct a competitive analysis for the target market. Identify 2-3 key competitors and evaluate their strengths and weaknesses. Define the product's unique value proposition and articulate its defensible moat, considering the advantages of a solo, agile development approach." | docs/prd/03-competitive-analysis.md |
| **18\. Map the Value Chain** | **Prompt:** "Analyze the value chain for the target market. Identify where my product fits, what upstream and downstream dependencies exist, and where the greatest value can be captured." | docs/prd/03-competitive-analysis.md |
| **20\. Conduct a PESTLE Analysis** | **Prompt:** "Conduct a PESTLE (Political, Economic, Social, Technological, Legal, Environmental) analysis to identify macro-environmental factors that could impact the product's success." | docs/prd/03-competitive-analysis.md |
| **24\. Identify Strategic Differentiators** | **Prompt:** "Go beyond features to identify the strategic differentiators. What unique assets, data, or community effects will create a long-term, defensible advantage?" | docs/prd/03-competitive-analysis.md |

#### **Business Strategy & Positioning**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **19\. Formulate the Investment Thesis** | **Prompt:** "Articulate the investment thesis for this product in one paragraph. It should answer: Why this product? Why now? Why me? What is the expected return on the investment of my time and capital?" | docs/prd/01-context-vision.md |
| **21\. Define the 'Anti-Product'** | **Prompt:** "Clearly define the 'Anti-Product'. What features, user segments, or business models will I explicitly avoid to maintain focus and strategic clarity?" | docs/prd/02-product-scope.md |
| **22\. Outline the Core Business Model** | **Prompt:** "Detail the core business model. How will the product create, deliver, and capture value? (e.g., Subscription, Freemium, Transactional). Be specific about the value metric." | docs/prd/11-monetization.md |
| **23\. Draft the Elevator Pitch** | **Prompt:** "Draft a 30-second elevator pitch that clearly and concisely explains the product, the problem it solves, and its target audience." | docs/ux/58-marketing-and-seo.md |
| **24\. Create a Pitch Deck** | **Prompt:** "Create a compelling pitch deck (10-15 slides) that summarizes the product vision, problem, solution, market size, business model, and team. This should be a visual and concise presentation suitable for potential investors or partners." | docs/prd/01-context-vision.md |
| **25\. Set the North Star Metric** | **Prompt:** "Define the single North Star Metric that best represents the core value being delivered to users. This metric should be the primary measure of the product's success." | docs/analytics/feature_events.md |
| **26\. Create a Stakeholder Map** | **Prompt:** "Even as a solo developer, create a stakeholder map. Identify key external partners, advisors, or potential investors and outline a communication and engagement strategy for each." | docs/ops/62-developer-onboarding.md |

### **Phase 2: Market & User Discovery**

*This phase focuses on deeply understanding your target users to ensure you're building something people actually want.*

#### **User Research & Validation**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **27\. Define Your Target User and 'Ideal Customer Profile' (ICP)** | **Prompt:** "Generate a detailed 'Ideal Customer Profile' (ICP) for the application's primary user segment. Include demographic, psychographic, and behavioral data, as well as their core problems and the 'Job to Be Done' they would 'hire' the product for." | docs/prd/04-user-stories.md |
| **28\. Draft a Hypothesis-Driven Validation Plan** | **Prompt:** "Draft a 'Lean Validation Plan'. Identify the three highest-risk assumptions underlying the business case. For each, formulate a falsifiable hypothesis and design a lean experiment to validate or invalidate it with measurable success and failure criteria." | docs/qa/14-qa-testing.md |
| **29\. Draft a UX Research and Usability Testing Plan** | **Prompt:** "Draft a formal UX Research and Usability Testing Plan for the MVP. The plan must include research objectives, participant criteria, the selected methodology, and a test script with key tasks to evaluate the core user flow." | docs/qa/14-qa-testing.md |
| **39\. Run a "Fake Door" Demand Test** | **Prompt:** "Outline a plan for a 'fake door' demand test. This involves creating a simple landing page that describes the product and measuring interest via email sign-ups before building the full app." | docs/qa/14-qa-testing.md |

#### **Customer Journey & Personas**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **33\. Perform a Jobs-to-be-Done (JTBD) Analysis** | **Prompt:** "Frame the user's need using the Jobs-to-be-Done framework. What is the underlying 'job' the user is trying to accomplish? What are the functional, social, and emotional dimensions of this job?" | docs/prd/04-user-stories.md |
| **30\. Develop a "Day in the Life" Scenario** | **Prompt:** "Write a short narrative describing a 'Day in the Life' of my ideal user, highlighting their current pain points and showing how my app would fit into their routine to solve a problem." | docs/prd/04-user-stories.md |
| **34\. Create an Empathy Map** | **Prompt:** "Based on my user persona, create a detailed empathy map. What does the user see, hear, think, feel, say, and do? What are their pains and gains?" | docs/prd/04-user-stories.md |
| **32\. Map the Customer Journey** | **Prompt:** "Create a customer journey map that visualizes the user's experience from awareness and consideration to onboarding, engagement, and advocacy. Identify key touchpoints and moments of friction." | docs/ux/38-ux-flow-diagrams.md |
| **31\. Conduct a "Switch" Interview Analysis** | **Prompt:** "Outline a script for a 'switch' interview. The goal is to understand the forces (push, pull, anxiety, habit) that would make a user switch from their current solution to my product." | docs/ux/42-customer-feedback.md |
| **38\. Draft a Persona "Anti-Pattern"** | **Prompt:** "To sharpen my focus, create a persona 'anti-pattern'. This should describe a user who might seem like a good fit but is explicitly *not* my target customer, and explain why." | docs/prd/04-user-stories.md |

#### **Market Sizing & Analysis**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **35\. Segment the Total Addressable Market (TAM)** | **Prompt:** "Break down the Total Addressable Market (TAM) into Serviceable Addressable Market (SAM) and Serviceable Obtainable Market (SOM) to create a realistic and actionable market entry strategy." | docs/prd/01-context-vision.md |
| **36\. Analyze Analogous Markets** | **Prompt:** "Identify and analyze an analogous market. What can I learn from a successful product that solved a similar problem for a different user base or in a different industry?" | docs/prd/03-competitive-analysis.md |
| **37\. Identify User "Watering Holes"** | **Prompt:** "Identify the top 3-5 online 'watering holes' where my target audience congregates (e.g., specific subreddits, forums, newsletters, influencers). This will inform my GTM strategy." | docs/ux/58-marketing-and-seo.md |

### **Phase 3: Solution Definition & Prioritization**

*Here, you translate your vision and user insights into a concrete set of features and a prioritized plan.*

#### **Feature Definition & Prioritization**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **40\. Conduct a Kano Model Analysis** | **Prompt:** "For the proposed product, generate a list of 10 potential features. Categorize these features using the Kano Model (Basic, Performance, Excitement) to inform the prioritization strategy and ensure the MVP delivers a satisfying user experience." | docs/prd/02-product-scope.md |
| **41\. Develop a Themed Product Roadmap** | **Prompt:** "Structure the product plan as a 'Themed Roadmap' instead of a feature list. Define three strategic themes for the initial release (e.g., 'User Acquisition & Onboarding', 'Core Value Proposition', 'Engagement & Retention')." | docs/prd/13-roadmap.md |
| **42\. Prioritize Features with the RICE Scoring Model** | **Prompt:** "Evaluate the top 10 potential features using the RICE scoring model (Reach, Impact, Confidence, Effort). Generate a table with these calculations to create a data-informed, prioritized product backlog." | docs/prd/02-product-scope.md |

#### **Requirements & User Stories**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **43\. Create a Comprehensive User Story Map** | **Prompt:** "Generate a user story map for the MVP. The map must visualize the end-to-end user journey, structured by user activities and tasks, to serve as a comprehensive blueprint for development sprints." | docs/prd/04-user-stories.md |
| **44\. Draft Detailed Functional and Non-Functional Requirements** | **Prompt:** "Deconstruct the top 3 user stories from the story map into detailed functional (what the system does) and non-functional (how the system performs) requirements. This should be an unambiguous specification for implementation." | docs/prd/04-user-stories.md |

#### **Analytics & Experimentation**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **45\. Define Feature-Level Success Metrics** | **Prompt:** "For the three core MVP features, define specific Key Performance Indicators (KPIs). Include both leading and lagging indicators to measure user adoption and value delivery effectively." | docs/analytics/feature_events.md |
| **46\. Validate Analytics and Event Coverage** | **Prompt:** "Scan `docs/analytics/*.md`, code instrumentation (`src/**/analytics`, `tools/analytics/**`) and PRD event tables. Ensure every tracked event in PRD is implemented (event name, properties) and that no instrumentation exists without a corresponding PRD entry. Output `reports/analytics_coverage.csv` mapping PRD events → implemented events → test status. Auto-generate issues for missing events and create `tests/analytics/test_event_coverage.py` skeletons. Commit and open a PR." | reports/analytics_coverage.csv |
| **47\. Create an Analytics Events and Instrumentation Plan** | **Prompt:** "Produce `docs/analytics/{feature_name}_events.md` listing all analytics events (names, properties, required vs optional), sample tracking code snippets, and mapping to dashboards & KPI alerts. Provide a staging QA script to verify events are emitted and an event-backfill plan. Commit and PR." | docs/analytics/{feature_name}_events.md |
| **48\. Create an A/B Experiment Framework** | **Prompt:** "Draft `docs/experiments/{feature_name}_ab_test.md` specifying the primary/secondary metrics, segmentation, sample size estimates, expected effect sizes, stopping rules, and guardrail metrics. Provide experiment rollout code snippet and monitoring queries to detect unintended regressions. Commit and open PR." | docs/experiments/{feature_name}_ab_test.md |

### **Phase 4: Design & User Experience**

*This phase covers the user-facing design, brand identity, and responsible product principles.*

#### **Brand Identity & Design Principles**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **49\. Outline Your Design Principles and Brand Voice** | **Prompt:** "Outline the core design principles and a 'Voice and Tone' guide for '\[App Name\]'. Define the brand's personality and provide examples to ensure consistency across all user-facing copy and interactions." | docs/ux/60-brand-assets.md |

#### **UX Flows & Prototyping**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **50\. Create User Flow Diagrams and Wireframes** | **Prompt:** "For the primary user journey, create a user flow diagram. Based on this flow, generate low-fidelity wireframes for the key screens, focusing on layout, information hierarchy, and core user interactions." | docs/ux/38-ux-flow-diagrams.md |
| **53\. Create a Customer Journey and UX Prototype** | **Prompt:** "For `{feature_name}`, create `docs/ux/{feature_name}_customer_journey.md` mapping user personas to detailed journey steps, pain points, and success metrics. Generate low-fidelity UI mockups (Figma JSON or SVGs) for the critical screens and a short usability test plan (5 tasks). Commit under `docs/ux/` and open a draft PR." | docs/ux/{feature_name}_customer_journey.md |

#### **Ethical Design & Quality Assurance**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **51\. Conduct an Ethical Design Review** | **Prompt:** "Conduct an ethical design and risk assessment for the product's core functionality. Identify potential negative consequences (e.g., data privacy vulnerabilities, addictive usage patterns) and propose mitigation strategies or design principles." | docs/security/19-security-privacy.md |
| **52\. Check Diagram and Artifact Links** | **Prompt:** "Validate all diagrams and cross-links: render `docs/**/*.mmd` mermaid files, confirm embedded images exist, and check every intra-doc link or external reference isn't broken. Produce `reports/diagrams/link_report.csv` with broken links, rendering errors, and missing images. Auto-generate corrected link suggestions where possible and open a PR with fixes for trivial issues and issues for non-trivial ones." | reports/diagrams/link_report.csv |

### **Phase 5: Technical Planning**

*This phase focuses on creating a robust, scalable, and secure technical blueprint for the application.*

#### **System Architecture & Design**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **54\. Justify the Technology Stack** | **Prompt:** "Justify the proposed technology stack (frontend, backend, database, cloud provider). The rationale should be based on a trade-off analysis considering factors like performance requirements, development velocity, and total cost of ownership." | docs/architecture/06-technical-architecture.md |
| **55\. Propose the System Architecture** | **Prompt:** "Propose a high-level system architecture (e.g., serverless, monolith, microservices). Create a simple diagram and justify the chosen pattern based on the product's requirements for scale, cost, and maintainability." | docs/architecture/06-technical-architecture.md |
| **56\. Conduct a 'Build vs. Buy' Analysis** | **Prompt:** "For a critical system component, such as '\[e.g., user authentication or payment processing\]', conduct a formal 'Build vs. Buy' analysis. Compare the options based on total cost of ownership, time to market, and long-term maintenance." | docs/architecture/33-third-party-integration.md |
| **66\. Create a Technical Architecture and Sequence Diagrams** | **Prompt:** "For `{feature_name}`, propose a technical architecture diagram and a detailed component design. Add a `docs/architecture/{feature_name}_architecture.md` with: architecture overview, component responsibilities, data flow, sequence diagrams as mermaid code, storage/caching decisions, API contracts (paths + data models), and a short risk assessment with mitigations. Commit the mermaid diagrams as `.mmd` files and include rendered PNGs in `docs/architecture/images/`. Create a PR draft." | docs/architecture/{feature_name}_architecture.md |

#### **API & Data Management**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **57\. Design the Data Schema** | **Prompt:** "Draft a high-level data schema for the core entities of the application. The design should consider data relationships, integrity constraints, and future scalability requirements." | docs/architecture/05-data-sync.md |
| **58\. Define the API Contract** | **Prompt:** "Define the API contract for the primary services using a standard like OpenAPI. Specify key endpoints, request/response payloads, and authentication methods to ensure a clear separation of concerns between client and server." | docs/architecture/61-api-documentation.md |
| **67\. Create an API-First PRD with OpenAPI and Contract Tests** | **Prompt:** "Produce an **API-first** section of the PRD for `{feature_name}`. Generate a complete OpenAPI v3 spec `openapi/{feature_name}.yaml` (paths, request/response schemas, auth, error codes). Then scaffold contract tests (using pytest + requests or equivalent in this repo) in `tests/contract/test_{feature_name}_api.py`. Add acceptance criteria that map to each OpenAPI path and include sample request/response payloads. Commit and open a draft PR." | openapi/{feature_name}.yaml |
| **69\. Create a Backwards-Compatibility and API Versioning Plan** | **Prompt:** "Create `docs/api/{feature_name}_compatibility.md` describing compatibility guarantees, deprecation policy, migration steps for clients, adapter patterns, and an automated compatibility test matrix. Add example feature-flag rules and a compatibility-check script for CI. Commit and open PR." | docs/api/{feature_name}_compatibility.md |
| **70\. Create a Data Contract and Schema Evolution Plan** | **Prompt:** "Add `docs/data/{feature_name}_data_contract.md` with canonical schemas, field-level owners, validation rules, retention policy, and a schema-evolution strategy. Generate Avro/JSON Schema files in `schemas/{feature_name}/` and sample producer/consumer contract tests. Commit and PR." | docs/data/{feature_name}_data_contract.md |

#### **Security, Performance & Cost**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **59\. Conduct a Security Threat Model** | **Prompt:** "Conduct a security threat modeling exercise for the application architecture using the STRIDE methodology. Identify potential threats (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) and propose specific design-level mitigations." | docs/security/19-security-privacy.md |
| **63\. Create a Capacity Plan with Queueing Theory** | **Prompt:** "For `{feature_name}` produce `docs/infra/{feature_name}_capacity_plan.md` containing: traffic forecast (RPS/time), service time distribution, and an analytic sizing section using queueing theory (M/M/c / M/G/c calculations) showing required servers for p95 latency ≤ `{target_sla}`. Add a reproducible Jupyter notebook `analysis/{feature_name}_queueing.ipynb` that: (a) fits parametric service-time distributions to sample telemetry (use historical metrics CSV or synthetic generator), (b) computes blocking probability / utilization curves, and (c) compares autoscaling thresholds (CPU, custom QPS metric). Commit notebook + exported PNG plots and a `tools/sim/load_profile_generator.py` to create realistic test traffic for k6/Gatling. Open a draft PR." | docs/infra/{feature_name}_capacity_plan.md |
| **64\. Perform Latency vs. Cost Pareto Analysis** | **Prompt:** "Produce `docs/architecture/{feature_name}_pareto.md` that enumerates architecture options (monolith→microservices, serverless vs containers vs bare VMs) and computes a latency-vs-cost Pareto frontier using measured or simulated data. Add `analysis/{feature_name}_pareto.ipynb` which runs multi-objective optimization, assigns weights per stakeholder (performance, cost, operational overhead), and outputs a ranked shortlist with clear tradeoffs and recommended architectures for different budget bands." | docs/architecture/{feature_name}_pareto.md |
| **65\. Create an End-to-End Benchmark Harness** | **Prompt:** "Add `benchmarks/{feature_name}/` containing: (a) an infra-as-code baseline for ephemeral test environments (`benchmarks/{feature_name}/terraform/`), (b) a reproducible benchmark harness `benchmarks/{feature_name}/run_bench.sh` which deploys baseline infra, runs load scenarios (steady, spike, ramp), collects Prometheus metrics, and generates a `benchmarks/{feature_name}/results.csv`. Produce `docs/benchmarks/{feature_name}_results.md` with cost-per-scenario and raw artifacts. Include teardown automation and a `benchmarks/README.md`." | docs/benchmarks/{feature_name}_results.md |
| **68\. Define Performance & SLOs and a Load-Testing Plan** | **Prompt:** "Define measurable non-functional requirements for `{feature_name}`: SLOs, SLIs, and error budgets (latency, throughput, p99, availability). Produce a `docs/perf/{feature_name}_slo.md` and a `tools/loadtests/{feature_name}_plan.yml` for a load test (k6 or Gatling) with scenarios, thresholds, and test data instructions. Add monitoring dashboards (suggest Prometheus/Grafana metrics and example PromQL queries). Commit and open PR." | docs/perf/{feature_name}_slo.md |
| **71\. Create an Autoscaling and Right-Sizing Plan** | **Prompt:** "Produce `docs/infra/{feature_name}_autoscale_rightsize.md` that recommends autoscaling policies (targets, cooldowns, metrics), instance sizing guidelines, and a simulated cost curve showing cost vs. latency for different scaling thresholds. Add HPA/HVPA/Karpenter examples (Kubernetes) or ASG autoscaling policies (AWS) and a lightweight simulation script `tools/cost/simulate_autoscale.py`. Commit and PR." | docs/infra/{feature_name}_autoscale_rightsize.md |
| **72\. Create a Storage Tiering and Lifecycle Policy Plan** | **Prompt:** "Create `docs/storage/{feature_name}_storage_tiering.md` describing data classes, retention, hot/warm/cold tiering, compression, and lifecycle rules (S3 Glacier, object lifecycle, DB archiving). Add cost estimates for each tier (per GB/month) and migration SQL/scripts for moving old records to cheaper storage. Commit and PR." | docs/storage/{feature_name}_storage_tiering.md |
| **73\. Analyze Network and Egress Optimization** | **Prompt:** "Produce `docs/net/{feature_name}_network_costs.md` analyzing egress, cross-AZ, and inter-region traffic costs. Recommend CDN placement, caching, transfer acceleration, and peering/VPN tradeoffs. Include sample CloudFront/Cloudflare patterns and a monthly egress cost projection under low/expected/high user geographies. Commit and PR." | docs/net/{feature_name}_network_costs.md |
| **74\. Implement IaC with Continuous Cost Estimation** | **Prompt:** "Scaffold `infra/{feature_name}_core.tf` with minimal infra for the feature and add Infracost integration config (`infracost.yaml`) plus CI steps (`.github/workflows/infracost.yml`) to run cost estimates on PRs. Commit and open a draft PR that shows a sample Infracost output for a baseline deployment." | infra/{feature_name}_core.tf |
| **75\. Compare Multi-Region vs. Multi-Cloud Costs and Latency** | **Prompt:** "Create `docs/costs/{feature_name}_multi_region_vs_multicloud.md` comparing single-region, multi-region, and multi-cloud approaches for availability, latency, and cost. Produce a simple latency vs cost chart (CSV + small script `tools/cost/latency_cost_plot.py`) and recommend the most cost-effective approach for the target SLA. Commit and PR." | docs/costs/{feature_name}_multi_region_vs_multicloud.md |
| **132\. Create Security & Privacy Checklists and Threat Model** | **Prompt:** "Add a `docs/security/{feature_name}_security.md` that includes: data flow with PII marked, threat model (STRIDE) with mapped mitigations, required encryption (at-rest/in-transit), auth & least-privilege rules, OWASP concerns, required logging/audit events, and a compliance checklist (GDPR/other if applicable). Generate code checklist items and grep commands to find likely code locations to update. Commit as a draft PR." | docs/security/{feature_name}_security.md |

#### **Validation & Automation**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **60\. Check API Contract vs. PRD Sync** | **Prompt:** "Validate all OpenAPI specs (`openapi/*.yaml`) against corresponding PRD functional requirement sections and example payloads. Checks: endpoint existence, parameter names, response fields, status codes, and security schemes. Produce `reports/api_consistency/{feature_name}_api_vs_prd.csv` listing mismatches and a script `tools/analysis/api_diff_report.py` that outputs suggested diffs to align PRD or OpenAPI. Create issues for mismatches and open a draft PR with the CSV and suggested diffs." | reports/api_consistency/{feature_name}_api_vs_prd.csv |
| **61\. Check Data Model and Schema Consistency** | **Prompt:** "Compare data models declared in PRDs (`docs/data/*.md`) against actual schemas in `schemas/`, database migrations (`migrations/`), and protobuf/Avro files. Detect mismatches in field names, types, nullable flags, and retention policies. Produce `reports/schema_mismatch/{feature_name}_schema_mismatches.csv` and suggested migration patches or PRD corrections. Add `tools/analysis/schema_consistency.py` and open a draft PR with results and issues." | reports/schema_mismatch/{feature_name}_schema_mismatches.csv |
| **62\. Validate Non-Functional Requirements (NFR)** | **Prompt:** "Extract NFRs (SLOs/SLA/throughput/latency/availability) from PRDs and compare to monitoring/alerting config (`monitoring/**`, `prometheus/**`, `grafana/**`) and load-test definitions (`benchmarks/**`). Flag SLOs that are unmonitored, have no alerting, or conflict with infra sizing. Produce `reports/nfr_coverage.csv` and a `docs/gaps/{feature_name}_nfr_gaps.md`. Open issues for each NFR gap and add a CI check that fails if critical SLOs lack monitoring." | reports/nfr_coverage.csv |

### **Phase 6: Project Structure & Execution Planning**

*This phase focuses on defining your personal workflow and processes to stay organized and productive.*

#### **Agile Framework & Tooling**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **76\. Establish a Development Framework** | **Prompt:** "Outline a suitable agile development framework (e.g., Personal Kanban, 1-week Scrum sprints) for a solo developer. Define the key ceremonies and routines required to maintain momentum and ensure consistent progress." | docs/ops/62-developer-onboarding.md |
| **77\. Define the Product Operations Toolchain** | **Prompt:** "Propose a cost-effective and scalable toolchain for product operations. Recommend specific tools for version control, task management, CI/CD, documentation, and design collaboration, with a justification for each." | docs/ops/62-developer-onboarding.md |
| **78. Draft a Communication Plan** | **Prompt:** "Draft a communication plan that outlines the frequency, channels, and content for communicating with different stakeholders (e.g., weekly email updates, monthly progress reports). This ensures everyone stays informed and aligned." | docs/ops/62-developer-onboarding.md |
| **83\. Create a Developer Onboarding and Code Samples** | **Prompt:** "Create `docs/onboarding/{feature_name}_dev_onboarding.md` with setup steps, local dev run commands, environment variables, example requests, and a minimal reproducible example (small script or Postman collection) demonstrating the new feature. Add a `CONTRIBUTING_{feature_name}.md` with coding standards, review checklist, and testing requirements. Commit and PR." | docs/onboarding/{feature_name}_dev_onboarding.md |

#### **Release & Quality Management**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **78\. Draft a Release Plan and 'Definition of Done'** | **Prompt:** "Draft a comprehensive release plan for the MVP. Define a strict 'Definition of Done' for user stories, sprints, and the final release to ensure quality and completeness." | docs/ops/25-release-management.md |
| **79. Define 'Definition of Ready'** | **Prompt:** "Define a 'Definition of Ready' for user stories. This checklist should specify the criteria a story must meet before it can be accepted into a sprint, ensuring clarity and readiness for development." | docs/ops/25-release-management.md |
| **81\. Create a Risk, Rollout, and Rollback Plan** | **Prompt:** "Create `docs/release/{feature_name}_rollout.md` covering deployment strategy (feature flags, canary %, staged rollout), detailed rollback steps, DB migration plan (zero-downtime steps), dependency impact matrix, and post-deploy verification checks. Provide a checklist of automated verifications and manual smoke tests. Place any DB migration SQL in `migrations/` and open a PR." | docs/release/{feature_name}_rollout.md |
| **82\. Create a QA Test Matrix and Acceptance Automation** | **Prompt:** "Produce `docs/qa/{feature_name}_test_matrix.md` mapping each functional requirement to test types: unit, integration, e2e, and manual. For each mapped test, add example test cases (input, expected output). Scaffold at least three automated e2e tests (Playwright or Cypress) in `tests/e2e/`. Mark flaky-prone areas and suggest instrumentation to reduce flakiness." | docs/qa/{feature_name}_test_matrix.md |
| **84\. Create a Data Migration and Backward Transition Plan** | **Prompt:** "Create `docs/migrations/{feature_name}_migration_plan.md` with step-by-step DB migration strategy (blue-green / expand-contract), data verification scripts, sampling-based validation queries, and rollback steps. Add SQL migration files in `migrations/` and a small test runner. Commit and PR." | docs/migrations/{feature_name}_migration_plan.md |

#### **Governance & Automation**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **79\. Build Cross-Doc Traceability Matrix** | **Prompt:** "Build a Requirements Traceability Matrix (RTM) mapping requirements in `docs/prd/*.md` to design artifacts (`docs/architecture/*.md`), API specs (`openapi/*.yaml`), tickets (`tickets/*.csv`) and tests (`tests/**`). Output `reports/rtm/{feature_name}_rtm.csv` with columns: requirement-id, source-file, mapped-artifacts, test-coverage (yes/no), owner. Flag and create issues for any requirements with no mapped design or no tests. Commit RTM and open a draft PR." | reports/rtm/{feature_name}_rtm.csv |
| **80\. Implement Governance and Cost-Policy Enforcement** | **Prompt:** "Implement a governance layer: add `policy/opa/{feature_name}_policies.rego` to block non-compliant resources (untagged, public S3, oversized instances). Wire a GitHub Action `.github/workflows/policy-check.yml` to evaluate PRs with the OPA policy and, on violations, open automated remediation tickets (CSV/JSON) and suggest fix diffs. Add `tools/policy/remediate_suggestions.py` to produce the suggested Terraform patch. Document enforcement cadence in `docs/governance/{feature_name}_governance.md`." | docs/governance/{feature_name}_governance.md |

### **Phase 7: Financial Modeling & Business Viability**

*This phase ensures your app makes financial sense by modeling costs and potential revenue.*

#### **Core Financial Models**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **85\. Develop a TCO and ROI Model** | **Prompt:** "Create a 1-year Total Cost of Ownership (TCO) model, including all anticipated expenses (development, infrastructure, marketing, etc.). Subsequently, develop a Return on Investment (ROI) model based on the proposed monetization strategy." | docs/costs/66-costs-model.md |
| **86\. Formulate a Monetization Strategy** | **Prompt:** "Develop a comprehensive monetization model. Define the pricing strategy and tiers, and conduct a break-even analysis to determine the number of users or transactions required to achieve profitability." | docs/prd/11-monetization.md |
| **87\. Model Unit Economics (LTV/CAC)** | **Prompt:** "Create a model to estimate the Lifetime Value (LTV) of a customer and the Customer Acquisition Cost (CAC). Define the key variables for each and calculate the LTV/CAC ratio needed for a sustainable business." | docs/costs/66-costs-model.md |
| **89\. Develop a Multi-Year Financial Forecast** | **Prompt:** "Develop a 3-year financial forecast that includes projected revenue, costs, and profit/loss. This should be based on your user growth and monetization assumptions." | docs/costs/66-costs-model.md |
| **90\. Analyze the Bill of Materials (BOM)** | **Prompt:** "Create a detailed Bill of Materials (BOM) that lists every third-party service, API, and software license required, along with its associated monthly or annual cost." | docs/costs/66-costs-model.md |
| **91\. Model Different Pricing Strategies** | **Prompt:** "Model the financial impact of three different pricing strategies (e.g., a low-cost entry tier, a premium tier, and a usage-based model). Compare the projected revenue and user adoption for each." | docs/prd/11-monetization.md |
| **92\. Create a Burn Rate and Runway Analysis** | **Prompt:** "Based on your projected costs and available capital, create a burn rate and runway analysis. This should calculate your monthly expenses and determine how many months you can operate before needing additional funding." | docs/costs/66-costs-model.md |
| **94\. Outline a CapEx vs. OpEx Breakdown** | **Prompt:** "Categorize your projected expenses into Capital Expenditures (CapEx) and Operating Expenditures (OpEx) for proper financial planning and accounting." | docs/costs/66-costs-model.md |
| **103\. Create a 3-Year TCO Model** | **Prompt:** "Build a `docs/costs/{feature_name}_tco_3yr.xlsx` and `docs/costs/{feature_name}_tco_3yr.md` estimating TCO over 36 months. Include CAPEX vs OPEX breakdown, staffing, licenses, backups, DR, and migration costs. Provide an assumptions sheet and sensitivity knobs (±20% traffic, storage growth). Commit both files and open a PR." | docs/costs/{feature_name}_tco_3yr.xlsx |

#### **Advanced Financial Analysis**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **88\. Conduct a Sensitivity Analysis** | **Prompt:** "Conduct a sensitivity analysis on your financial model. Show how a \+/- 25% change in key assumptions (e.g., conversion rate, churn, user growth) impacts your revenue and profitability projections." | docs/costs/67-advanced-cost-optimizations.md |
| **93\. Perform a "Sanity Check" with Industry Benchmarks** | **Prompt:** "Compare your key financial projections (e.g., LTV/CAC ratio, conversion rates) against industry benchmarks for similar apps to ensure your assumptions are realistic." | docs/costs/66-costs-model_summary.md |
| **96\. Create a Monte-Carlo Cost Model** | **Prompt:** "Create `docs/costs/{feature_name}_montecarlo.md` and `analysis/{feature_name}_cost_montecarlo.ipynb`. Implement a Monte-Carlo simulation that models monthly cost under uncertain inputs (traffic growth, egress, storage growth, spot interruption rate). Include PDFs/priors for each parameter, run 10k trials, produce percentile-cost outputs (P50/P90/P99), and a tornado plot for sensitivity. Export `docs/costs/{feature_name}_cost_simulation.csv` and include recommended budget guardrails (commitment thresholds, recommended RI/Savings Plan coverage) for `{currency}`. Add a CI job to regenerate the simulation when `pricing/` changes." | docs/costs/{feature_name}_montecarlo.md |
| **100\. Create a Data Residency & Compliance Cost Model** | **Prompt:** "Create `docs/compliance/{feature_name}_data_residency.md` that enumerates legal constraints per `{region_list}`, required isolation patterns (separate accounts, VPCs, encryption keys), and the additional cost of compliance (replicated storage, audit logs, dedicated regions). Build `analysis/{feature_name}_residency_cost_breakdown.xlsx` with per-region cost lines and a recommended minimal-compliance architecture that balances cost and regulator requirements." | docs/compliance/{feature_name}_data_residency.md |

#### **Cost Optimization & Automation**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **95\. Detect Cost Model Inconsistencies** | **Prompt:** "Parse all cost-related docs (`docs/costs/**/*.md`, spreadsheets) and validate assumptions against pricing templates in `pricing/` (or a bundled sample pricing CSV). Detect unrealistic assumptions (e.g., zero egress, 0% CPU utilization), mismatched currency/units, and missing risk buffers. Produce `reports/cost_inconsistencies.csv` with severity and suggested fixes (e.g., add P90/P99 scenarios, add RI recommendations). Add `tools/cost/assumption_validator.py`. Commit and open a PR creating issues for high-severity inconsistencies." | reports/cost_inconsistencies.csv |
| **97\. Create an Optimal Commitment & Purchase Plan** | **Prompt:** "Produce `docs/costs/{feature_name}_commitment_strategy.md` plus `tools/cost/optimize_commitments.py`. Model the decision of on-demand vs reserved/savings plans vs spot as an integer linear program (ILP) minimizing expected 3-year cost subject to availability constraints and error budget. Use inputs: baseline instance shapes, historical utilization, spot interruption probability, and discount tiers. Output recommended commitment portfolio (instances, commitment % by family, expected savings) and sensitivity to utilization. Include solver results and a reproducible example." | docs/costs/{feature_name}_commitment_strategy.md |
| **98\. Automate End-to-End Cost Delta Checks** | **Prompt:** "Implement an automated cost-delta check for PRs: add `infracost` + `cloud-pricer` config and a GitHub Actions workflow `.github/workflows/infracost-pr.yml` that posts an inline PR comment with P50 cost delta and bill-of-resources. Also add a `tools/cost/validate_pr_comment.py` script to format the message and fail CI if delta exceeds thresholds. Update `README_CostChecks.md` describing enforcement rules. Commit and open PR; include a sample PR comment output." | .github/workflows/infracost-pr.yml |
| **99\. Create a FinOps Playbook and Anomaly Detection** | **Prompt:** "Create `docs/finance/{feature_name}_finops_playbook.md` with runbooks for cost spikes, automated tagging enforcement, and chargeback rules. Add `tools/finops/cost_anomaly_detector.py` that ingests billing time series and detects anomalies using seasonal decomposition + robust z-score or Isolation Forest; output alert examples and Grafana alert rule snippets. Include an onboarding page for finance + SRE teams and an SLA for cost incident response." | docs/finance/{feature_name}_finops_playbook.md |
| **101\. Create a Cost & Infra Estimate** | **Prompt:** "Produce `docs/costs/{feature_name}_cost_estimate.md` estimating infra cost for month 1 and month 6 under three traffic scenarios (low/expected/high). Recommend instance sizes, autoscaling rules, storage sizing, and approximate monthly cost breakdown (compute, storage, bandwidth). Provide Terraform/CloudFormation snippet examples for core infra and a short checklist for cost-optimization (spot instances, caching, lifecycle policies)." | docs/costs/{feature_name}_cost_estimate.md |
| **102\. Create a Cost-Performance Tradeoff Matrix** | **Prompt:** "For `{feature_name}`, produce `docs/costs/{feature_name}_cost_perf_matrix.md` that lists several architecture options (serverless, containers on Fargate/EKS, VMs), their expected performance profiles, and a cost-per-unit (e.g., \$/1k requests or \$/GB processed) comparison for three load tiers. Create a decision matrix mapping KPIs → recommended architecture and include short mermaid diagrams for each option. Commit and open a draft PR." | docs/costs/{feature_name}_cost_perf_matrix.md |
| **104\. Create Cost-Aware SLOs and Alerting Plan** | **Prompt:** "Draft `docs/ops/{feature_name}_slo_cost_policy.md` linking SLO targets to budgeted infra spend. List SLIs that materially affect cost (p99 latency, egress) and add Prometheus alerting rules and Grafana dashboard snippets that surface cost burn and error-budget consumption. Commit and PR." | docs/ops/{feature_name}_slo_cost_policy.md |
| **105\. Create a Monthly Forecast and Billing Scripts** | **Prompt:** "Produce `docs/costs/{feature_name}_monthly_forecast.md` and a spreadsheet `docs/costs/{feature_name}_monthly_forecast.csv` that projects month-by-month costs for the next 12 months under three scenarios. Add `tools/cost/fetch_billing_sample.py` (placeholder using cloud billing APIs) and a small script `tools/cost/generate_forecast.py` that turns assumptions into the CSV. Commit and PR." | docs/costs/{feature_name}_monthly_forecast.md |
| **106\. Create a Tagging, Chargeback, and Cost-Allocation Framework** | **Prompt:** "Create `docs/finance/{feature_name}_tagging_chargeback.md` specifying required resource tags, cost-centers, and a chargeback plan. Provide sample tagging enforcement Terraform policies (Sentinel/OPA/Policy as Code) and an example billing dashboard query mapping tags to product/team lines. Commit and PR." | docs/finance/{feature_name}_tagging_chargeback.md |

### **Phase 8: Go-to-Market & Growth Strategy**

*With a clear plan for the app, this phase focuses on how you will launch it and get your first users.*

#### **GTM Strategy & Planning**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **107\. Architect a Product-Led Growth Engine** | **Prompt:** "Design a sustainable Product-Led Growth (PLG) loop for the application. Detail how the natural use of the product will drive user acquisition, activation, and referral, creating a virtuous growth cycle." | docs/ux/58-marketing-and-seo.md |
| **108\. Develop a Go-to-Market (GTM) Strategy** | **Prompt:** "Outline a lean, phased Go-to-Market (GTM) strategy. Define the objectives and key activities for the pre-launch, launch, and post-launch phases, focusing on high-impact, low-cost tactics." | docs/ux/58-marketing-and-seo.md |
| **112\. Outline a Phased Rollout Plan** | **Prompt:** "To mitigate risk, outline a phased rollout plan. Will you launch in a specific geographic region first? To a private beta group? Describe the stages of your launch." | docs/ops/25-release-management.md |
| **117\. Create a Stakeholder-Facing One-Pager and Launch Comms** | **Prompt:** "Write a `docs/comm/{feature_name}_onepager.md` — a single-page summary for stakeholders: the problem statement, solution, benefits, KPIs, timelines, risks, and “ask” (resources/approvals). Then draft an internal launch email and API consumer changelog entry. Put them in `docs/comm/` and open a PR." | docs/comm/{feature_name}_onepager.md |

#### **User Acquisition & Activation**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **109\. Formulate an Acquisition Strategy** | **Prompt:** "Identify and prioritize the top 2-3 user acquisition channels for the initial launch. Provide a rationale for each choice based on the Ideal Customer Profile and estimated channel effectiveness." | docs/ux/58-marketing-and-seo.md |
| **110\. Design the "Aha\!" Moment and Activation Funnel** | **Prompt:** "Define the 'Aha\!' moment—the point at which a new user first understands the value of your product. Then, map the key steps in the activation funnel that lead them to this moment." | docs/ux/08-ux-onboarding.md |
| **111\. Develop a Content Marketing Strategy** | **Prompt:** "Outline a content marketing strategy to attract your target audience. What kind of content (e.g., blog posts, tutorials, social media) will you create to build awareness and establish credibility?" | docs/ux/58-marketing-and-seo.md |
| **113\. Create a "First 100 Users" Acquisition Plan** | **Prompt:** "Get specific about early growth. Detail a hands-on, non-scalable plan to acquire your first 100 users through direct outreach, personal networks, and community engagement." | docs/ux/58-marketing-and-seo.md |
| **114\. Define the Onboarding Experience** | **Prompt:** "Design the new user onboarding experience. What are the first five screens or interactions a user will have? What is the one key action you want them to take to become activated?" | docs/ux/08-ux-onboarding.md |
| **115\. Develop a Referral Program** | **Prompt:** "Outline the mechanics of a simple referral program. What is the incentive for the referrer and the referred user? How will you make it easy for users to share?" | docs/ux/54-social-sharing.md |

#### **Messaging & Internationalization**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **116\. Define Key Messaging and Positioning** | **Prompt:** "Craft the core messaging and positioning statement for your product. It should clearly articulate what the product is, who it's for, and why it's different, in a way that resonates with your target audience." | docs/ux/58-marketing-and-seo.md |
| **118\. Plan for Localization and i18n Readiness** | **Prompt:** "Produce `docs/i18n/{feature_name}_i18n.md` listing all user-facing strings, recommended translation keys, RTL/LTR considerations, locale-specific formatting, and pluralization rules. Add a script to extract strings from the codebase (`tools/i18n/extract_{feature_name}.py`) and a small localization QA checklist. Commit and PR." | docs/i18n/{feature_name}_i18n.md |

### **Phase 9: Long-Term Planning & Risk Mitigation**

*This final phase focuses on preparing for the future, anticipating challenges, and ensuring your app's long-term health.*

#### **Risk Management & Deprecation**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **119\. Conduct a Pre-Mortem Analysis** | **Prompt:** "Conduct a 'Pre-Mortem' analysis. Assuming the product has failed six months post-launch, brainstorm and detail at least 5 plausible causes. For the top two risks, develop specific, actionable mitigation plans." | docs/prd/21-risks.md |
| **120\. Establish a Product Lifecycle Policy** | **Prompt:** "Define a formal framework for feature lifecycle management. Establish the quantitative and qualitative criteria that will be used to evaluate features for deprecation to maintain product focus and reduce technical debt." | docs/ops/25-release-management.md |
| **122\. Conduct a SWOT Analysis** | **Prompt:** "Conduct a formal SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for the product. This should be an honest assessment of both internal and external factors." | docs/prd/03-competitive-analysis.md |
| **123\. Develop a "Kill Switch" Criteria** | **Prompt:** "Define the specific, measurable criteria that would trigger a decision to pivot or sunset the product. This ensures that you make rational, data-driven decisions if the product is not gaining traction." | docs/prd/21-risks.md |
| **133\. Create a Dependency and Third-Party Impact Map** | **Prompt:** "Generate `docs/deps/{feature_name}_dependency_map.md` listing all internal & external dependencies, SLA expectations, failure modes, and a matrix of who owns each dependency. Add a mermaid dependency graph and suggested fallbacks/circuit-breaker policies. Commit and PR." | docs/deps/{feature_name}_dependency_map.md |

#### **Continuous Improvement & Feedback**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **121\. Implement a Continuous Feedback Loop** | **Prompt:** "Design a system for continuous user feedback and product discovery. Outline the methods for collecting, synthesizing, and prioritizing user insights to inform the ongoing product roadmap." | docs/ux/55-user-feedback-collection.md |
| **127\. Define a Customer Support and Success Strategy** | **Prompt:** "Outline your strategy for customer support. What channels will you offer (e.g., email, FAQ)? What is your target response time? How will you proactively ensure user success?" | docs/ops/24-user-support.md |

#### **Future-Proofing & Strategic Foresight**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **124\. Outline a Data Privacy and Compliance Roadmap** | **Prompt:** "Look ahead to future data privacy and compliance needs. What regulations (e.g., GDPR, CCPA) might apply as you grow, and what steps should you take now to prepare?" | docs/security/20-compliance-regulatory.md |
| **125\. Develop a Technical Debt Management Strategy** | **Prompt:** "Outline a proactive strategy for managing technical debt. How will you allocate a percentage of your development time to refactoring and infrastructure improvements to ensure long-term health?" | docs/architecture/06-technical-architecture.md |
| **126\. Map out the "Product Vision 2.0"** | **Prompt:** "Think beyond the MVP. What does the next major iteration of the product look like? Outline a high-level vision for 'Version 2.0' to guide your long-term roadmap." | docs/prd/45-future-enhancements.md |
| **128\. Perform a "Future-Proofing" Analysis** | **Prompt:** "Analyze potential future trends (e.g., new technologies, changing user behaviors) and assess how they might impact your product. How can you design your app to be adaptable to future changes?" | docs/prd/45-future-enhancements.md |

#### **Cross-Cutting Checks & Audits**

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **129\. Find Semantic Contradictions** | **Prompt:** "Use an LLM-based cross-document checker to detect *semantic contradictions* across PRD docs (e.g., SLA p99 = 200ms in one doc and p99 = 500ms in another; data retention 90 days vs 2 years; auth: OAuth required vs no auth). Produce `reports/semantic_contradictions.json` with each contradiction, confidence score, files/lines, and suggested reconciliations. Add `tools/analysis/semantic_checker.py` that can be re-run in CI. Commit results and open a PR that files issues for contradictions with confidence ≥ 0.7." | reports/semantic_contradictions.json |
| **130\. Generate an End-to-End QA Checklist** | **Prompt:** "Aggregate all previous checks (lint, RTM, semantic contradictions, API diffs, schema mismatches, NFR gaps, cost inconsistencies, analytics gaps, diagrams) into a single executive remediation report `reports/remediation/{repo_name}_remediation_plan.md`. Provide: prioritized issue list (severity, owner, ETA estimate in story points), quick wins (<=1 dev-day), and a recommended remediation sprint plan (3 sprints). Add `issues/prioritized_issues.csv` and open a draft PR that adds the remediation plan and files and creates GitHub issues/tickets for the top 20 items assigned to `{assignee}`." | reports/remediation/{repo_name}_remediation_plan.md |
| **131\. Create a Resilience-Cost Tradeoff Matrix** | **Prompt:** "Produce `docs/ops/{feature_name}_resilience_cost_tradeoffs.md` mapping resilience patterns (multi-AZ, multi-region, quorum read replicas, read-only caches) to cost and RTO/RPO improvements. Add `tools/chaos/chaos_validation_suite.py` to run safe chaos experiments (node termination, increased latency) in a staging environment and collect cost impact metrics (retries, egress, autoscale churn). Output a validated resilience policy and gating criteria for prod promotion." | docs/ops/{feature_name}_resilience_cost_tradeoffs.md |
| **134\. Create an Observability and Runbook for Incidents** | **Prompt:** "Produce `docs/ops/{feature_name}_observability.md` listing required logs, traces, metrics, SLO/SLA targets, and a sample Grafana dashboard layout (PromQL snippets). Add `runbooks/{feature_name}_runbook.md` with step-by-step incident playbooks and on-call escalation. Commit and PR." | docs/ops/{feature_name}_observability.md |
| **135\. Plan Chaos Engineering and Resilience Tests** | **Prompt:** "Produce `docs/chaos/{feature_name}_chaos_plan.md` describing targeted resilience experiments (latency injection, pod kill, DB failovers), hypotheses, success criteria, and safety gates. Add scripts for automated chaos tests (e.g., kubectl-based) and CI gating suggestions. Commit and PR." | docs/chaos/{feature_name}_chaos_plan.md |
