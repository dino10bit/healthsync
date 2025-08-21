# **A Solo Developer's Guide to PRD Creation: Strategic Prompts**

**Version:** 1.6 | **Last Updated:** August 21, 2025

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

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **1\. Select a PRD Template** | **Prompt:** "Propose three distinct PRD templates suitable for a solo developer (e.g., a lean one-pager, a standard template, a PR-FAQ model). For each, analyze the pros and cons to help me select the most effective format for this project." | templates/03-prd-template.md |
| **2\. Define Documentation Scope** | **Prompt:** "Define the essential documentation required for this project beyond the PRD (e.g., a concise design spec, a high-level technical architecture overview, a changelog). Justify the inclusion of each artifact to ensure a lean but comprehensive documentation suite." | README.md |
| **3\. Establish a Single Source of Truth (SSoT)** | **Prompt:** "Outline a strategy for establishing a 'Single Source of Truth' (SSoT) for all project information. Recommend a primary tool (e.g., Notion, a Git repository) and justify its selection based on accessibility, versioning, and integration capabilities." | README.md |
| **4\. Generate a PRD Table of Contents** | **Prompt:** "Based on the selected template, generate a detailed Table of Contents for the PRD. This will serve as the foundational structure and checklist for the entire document." | docs/prd/02-product-scope.md |
| **5\. Define a Version Control Strategy** | **Prompt:** "Define a simple yet robust version control strategy for the PRD and other key documents. Outline the process for managing updates, revisions, and historical tracking to ensure clarity on the latest version." | README.md |
| **6\. Structure the 'Out of Scope' Section** | **Prompt:** "Draft a template for the 'Out of Scope' section of the PRD. What key areas and features should be explicitly excluded to maintain focus on the MVP and prevent scope creep?" | docs/prd/02-product-scope.md |
| **7\. Create a Project Glossary Framework** | **Prompt:** "Create a structure for a project glossary. List the key technical and business terms that should be defined upfront to ensure clarity and consistency throughout all documentation." | docs/prd/GLOSSARY.md |
| **8\. Plan for Visual Documentation** | **Prompt:** "Outline a plan for incorporating visual documentation. Specify the essential diagrams (e.g., user flows, architecture diagrams, wireframes) and recommend tools for their creation and integration." | docs/ux/60-brand-assets.md |
| **9\. Define a Document Review Process** | **Prompt:** "Outline a self-review checklist for the PRD. What key questions should I ask myself before finalizing a version to ensure it is complete, clear, and actionable?" | README.md |
| **10\. Draft a Documentation Maintenance Plan** | **Prompt:** "Draft a simple maintenance plan for the project documentation. Define the cadence and triggers for reviewing and updating documents to ensure they remain relevant as the project evolves." | docs/ops/22-maintenance.md |
| **11\. Implement a Global PRD Linter** | **Prompt:** "Run a comprehensive PRD linter across `docs/prd/**/*.md`, `docs/architecture/**/*.md`, and `docs/*/*.md`. Enforce rules: required sections present (summary, goals, KPIs, acceptance criteria), no missing acceptance criteria, no TODOs, no “TBD” placeholders, consistent units (ms/sec/GB/€/{currency}), and no inline private credentials. Output `reports/prd_lint/sarif_prd_lint.sarif` and `reports/prd_lint/prd_lint.csv` with rule ids, file, line, severity. Create `tools/lint/prd_rules.yml` with the rule set and a GitHub Action `.github/workflows/prd-lint.yml` to run on PRs. Open a draft PR that (a) adds the linter config, (b) attaches the report, and (c) creates GitHub issues for items with severity ≥ `{severity_threshold}` assigned to `{assignee}`." | tools/lint/prd_rules.yml |

### **Phase 1: Strategic Framing & Vision**

*This phase is about defining the "why" behind your app and ensuring your idea is built on a solid foundation.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **12\. Craft a Strategic Narrative and Vision** | **Prompt:** "Act as a strategic advisor. For a new mobile application, '\[App Name\]', draft a 'Strategic Narrative'. This document should include a market opportunity analysis, the product's unique value proposition, and a compelling 'North Star' vision statement to guide the product development and investment thesis." | docs/prd/01-context-vision.md |
| **13\. Draft a 'Press Release (PR-FAQ)'** | **Prompt:** "Draft a future-dated internal Press Release for the launch of '\[App Name\]'. This document should articulate the customer benefits and market impact as if the launch were successful. Then, generate an accompanying FAQ to address critical questions from potential investors or stakeholders." | docs/prd/01-context-vision.md |
| **14\. Analyze Your Competitive Advantage** | **Prompt:** "Conduct a competitive analysis for the target market. Identify 2-3 key competitors and evaluate their strengths and weaknesses. Define the product's unique value proposition and articulate its defensible moat, considering the advantages of a solo, agile development approach." | docs/prd/03-competitive-analysis.md |
| **15\. Draft a 'Working Backwards' Document** | **Prompt:** "Synthesize the product vision into a 'Working Backwards' document. The document must originate from the ideal customer experience and deconstruct it to define the Minimum Viable Product (MVP) required to deliver that experience." | docs/prd/01-context-vision.md |
| **16\. Define Product Tenets** | **Prompt:** "Establish a set of 3-5 core product tenets. These should be memorable, actionable principles that will guide every product decision and trade-off (e.g., 'Simplicity over Complexity,' 'Privacy by Design')." | docs/prd/01-context-vision.md |
| **17\. Map the Value Chain** | **Prompt:** "Analyze the value chain for the target market. Identify where my product fits, what upstream and downstream dependencies exist, and where the greatest value can be captured." | docs/prd/03-competitive-analysis.md |
| **18\. Formulate the Investment Thesis** | **Prompt:** "Articulate the investment thesis for this product in one paragraph. It should answer: Why this product? Why now? Why me? What is the expected return on the investment of my time and capital?" | docs/prd/01-context-vision.md |
| **19\. Conduct a PESTLE Analysis** | **Prompt:** "Conduct a PESTLE (Political, Economic, Social, Technological, Legal, Environmental) analysis to identify macro-environmental factors that could impact the product's success." | docs/prd/03-competitive-analysis.md |
| **20\. Define the 'Anti-Product'** | **Prompt:** "Clearly define the 'Anti-Product'. What features, user segments, or business models will I explicitly avoid to maintain focus and strategic clarity?" | docs/prd/02-product-scope.md |
| **21\. Outline the Core Business Model** | **Prompt:** "Detail the core business model. How will the product create, deliver, and capture value? (e.g., Subscription, Freemium, Transactional). Be specific about the value metric." | docs/prd/11-monetization.md |
| **22\. Draft the Elevator Pitch** | **Prompt:** "Draft a 30-second elevator pitch that clearly and concisely explains the product, the problem it solves, and its target audience." | docs/ux/58-marketing-and-seo.md |
| **23\. Identify Strategic Differentiators** | **Prompt:** "Go beyond features to identify the strategic differentiators. What unique assets, data, or community effects will create a long-term, defensible advantage?" | docs/prd/03-competitive-analysis.md |
| **24\. Set the North Star Metric** | **Prompt:** "Define the single North Star Metric that best represents the core value being delivered to users. This metric should be the primary measure of the product's success." | docs/analytics/feature_events.md |
| **25\. Create a Stakeholder Map** | **Prompt:** "Even as a solo developer, create a stakeholder map. Identify key external partners, advisors, or potential investors and outline a communication and engagement strategy for each." | docs/ops/62-developer-onboarding.md |

### **Phase 2: Market & User Discovery**

*This phase focuses on deeply understanding your target users to ensure you're building something people actually want.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **26\. Define Your Target User and 'Ideal Customer Profile' (ICP)** | **Prompt:** "Generate a detailed 'Ideal Customer Profile' (ICP) for the application's primary user segment. Include demographic, psychographic, and behavioral data, as well as their core problems and the 'Job to Be Done' they would 'hire' the product for." | docs/prd/04-user-stories.md |
| **27\. Draft a Hypothesis-Driven Validation Plan** | **Prompt:** "Draft a 'Lean Validation Plan'. Identify the three highest-risk assumptions underlying the business case. For each, formulate a falsifiable hypothesis and design a lean experiment to validate or invalidate it with measurable success and failure criteria." | docs/qa/14-qa-testing.md |
| **28\. Draft a UX Research and Usability Testing Plan** | **Prompt:** "Draft a formal UX Research and Usability Testing Plan for the MVP. The plan must include research objectives, participant criteria, the selected methodology, and a test script with key tasks to evaluate the core user flow." | docs/qa/14-qa-testing.md |
| **29\. Develop a "Day in the Life" Scenario** | **Prompt:** "Write a short narrative describing a 'Day in the Life' of my ideal user, highlighting their current pain points and showing how my app would fit into their routine to solve a problem." | docs/prd/04-user-stories.md |
| **30\. Conduct a "Switch" Interview Analysis** | **Prompt:** "Outline a script for a 'switch' interview. The goal is to understand the forces (push, pull, anxiety, habit) that would make a user switch from their current solution to my product." | docs/ux/42-customer-feedback.md |
| **31\. Map the Customer Journey** | **Prompt:** "Create a customer journey map that visualizes the user's experience from awareness and consideration to onboarding, engagement, and advocacy. Identify key touchpoints and moments of friction." | docs/ux/38-ux-flow-diagrams.md |
| **32\. Perform a Jobs-to-be-Done (JTBD) Analysis** | **Prompt:** "Frame the user's need using the Jobs-to-be-Done framework. What is the underlying 'job' the user is trying to accomplish? What are the functional, social, and emotional dimensions of this job?" | docs/prd/04-user-stories.md |
| **33\. Create an Empathy Map** | **Prompt:** "Based on my user persona, create a detailed empathy map. What does the user see, hear, think, feel, say, and do? What are their pains and gains?" | docs/prd/04-user-stories.md |
| **34\. Segment the Total Addressable Market (TAM)** | **Prompt:** "Break down the Total Addressable Market (TAM) into Serviceable Addressable Market (SAM) and Serviceable Obtainable Market (SOM) to create a realistic and actionable market entry strategy." | docs/prd/01-context-vision.md |
| **35\. Analyze Analogous Markets** | **Prompt:** "Identify and analyze an analogous market. What can I learn from a successful product that solved a similar problem for a different user base or in a different industry?" | docs/prd/03-competitive-analysis.md |
| **36\. Identify User "Watering Holes"** | **Prompt:** "Identify the top 3-5 online 'watering holes' where my target audience congregates (e.g., specific subreddits, forums, newsletters, influencers). This will inform my GTM strategy." | docs/ux/58-marketing-and-seo.md |
| **37\. Draft a Persona "Anti-Pattern"** | **Prompt:** "To sharpen my focus, create a persona 'anti-pattern'. This should describe a user who might seem like a good fit but is explicitly *not* my target customer, and explain why." | docs/prd/04-user-stories.md |
| **38\. Run a "Fake Door" Demand Test** | **Prompt:** "Outline a plan for a 'fake door' demand test. This involves creating a simple landing page that describes the product and measuring interest via email sign-ups before building the full app." | docs/qa/14-qa-testing.md |

### **Phase 3: Solution Definition & Prioritization**

*Here, you translate your vision and user insights into a concrete set of features and a prioritized plan.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **39\. Conduct a Kano Model Analysis** | **Prompt:** "For the proposed product, generate a list of 10 potential features. Categorize these features using the Kano Model (Basic, Performance, Excitement) to inform the prioritization strategy and ensure the MVP delivers a satisfying user experience." | docs/prd/02-product-scope.md |
| **40\. Develop a Themed Product Roadmap** | **Prompt:** "Structure the product plan as a 'Themed Roadmap' instead of a feature list. Define three strategic themes for the initial release (e.g., 'User Acquisition & Onboarding', 'Core Value Proposition', 'Engagement & Retention')." | docs/prd/13-roadmap.md |
| **41\. Prioritize Features with the RICE Scoring Model** | **Prompt:** "Evaluate the top 10 potential features using the RICE scoring model (Reach, Impact, Confidence, Effort). Generate a table with these calculations to create a data-informed, prioritized product backlog." | docs/prd/02-product-scope.md |
| **42\. Create a Comprehensive User Story Map** | **Prompt:** "Generate a user story map for the MVP. The map must visualize the end-to-end user journey, structured by user activities and tasks, to serve as a comprehensive blueprint for development sprints." | docs/prd/04-user-stories.md |
| **43\. Draft Detailed Functional and Non-Functional Requirements** | **Prompt:** "Deconstruct the top 3 user stories from the story map into detailed functional (what the system does) and non-functional (how the system performs) requirements. This should be an unambiguous specification for implementation." | docs/prd/04-user-stories.md |
| **44\. Define Feature-Level Success Metrics** | **Prompt:** "For the three core MVP features, define specific Key Performance Indicators (KPIs). Include both leading and lagging indicators to measure user adoption and value delivery effectively." | docs/analytics/feature_events.md |
| **45\. Validate Analytics and Event Coverage** | **Prompt:** "Scan `docs/analytics/*.md`, code instrumentation (`src/**/analytics`, `tools/analytics/**`) and PRD event tables. Ensure every tracked event in PRD is implemented (event name, properties) and that no instrumentation exists without a corresponding PRD entry. Output `reports/analytics_coverage.csv` mapping PRD events → implemented events → test status. Auto-generate issues for missing events and create `tests/analytics/test_event_coverage.py` skeletons. Commit and open a PR." | reports/analytics_coverage.csv |

### **Phase 4: Design & User Experience**

*This phase covers the user-facing design, brand identity, and responsible product principles.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **46\. Outline Your Design Principles and Brand Voice** | **Prompt:** "Outline the core design principles and a 'Voice and Tone' guide for '\[App Name\]'. Define the brand's personality and provide examples to ensure consistency across all user-facing copy and interactions." | docs/ux/60-brand-assets.md |
| **47\. Create User Flow Diagrams and Wireframes** | **Prompt:** "For the primary user journey, create a user flow diagram. Based on this flow, generate low-fidelity wireframes for the key screens, focusing on layout, information hierarchy, and core user interactions." | docs/ux/38-ux-flow-diagrams.md |
| **48\. Conduct an Ethical Design Review** | **Prompt:** "Conduct an ethical design and risk assessment for the product's core functionality. Identify potential negative consequences (e.g., data privacy vulnerabilities, addictive usage patterns) and propose mitigation strategies or design principles." | docs/security/19-security-privacy.md |
| **49\. Check Diagram and Artifact Links** | **Prompt:** "Validate all diagrams and cross-links: render `docs/**/*.mmd` mermaid files, confirm embedded images exist, and check every intra-doc link or external reference isn't broken. Produce `reports/diagrams/link_report.csv` with broken links, rendering errors, and missing images. Auto-generate corrected link suggestions where possible and open a PR with fixes for trivial issues and issues for non-trivial ones." | reports/diagrams/link_report.csv |

### **Phase 5: Technical Planning**

*This phase focuses on creating a robust, scalable, and secure technical blueprint for the application.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **50\. Justify the Technology Stack** | **Prompt:** "Justify the proposed technology stack (frontend, backend, database, cloud provider). The rationale should be based on a trade-off analysis considering factors like performance requirements, development velocity, and total cost of ownership." | docs/architecture/06-technical-architecture.md |
| **51\. Propose the System Architecture** | **Prompt:** "Propose a high-level system architecture (e.g., serverless, monolith, microservices). Create a simple diagram and justify the chosen pattern based on the product's requirements for scale, cost, and maintainability." | docs/architecture/06-technical-architecture.md |
| **52\. Conduct a 'Build vs. Buy' Analysis** | **Prompt:** "For a critical system component, such as '\[e.g., user authentication or payment processing\]', conduct a formal 'Build vs. Buy' analysis. Compare the options based on total cost of ownership, time to market, and long-term maintenance." | docs/architecture/33-third-party-integration.md |
| **53\. Design the Data Schema** | **Prompt:** "Draft a high-level data schema for the core entities of the application. The design should consider data relationships, integrity constraints, and future scalability requirements." | docs/architecture/05-data-sync.md |
| **54\. Define the API Contract** | **Prompt:** "Define the API contract for the primary services using a standard like OpenAPI. Specify key endpoints, request/response payloads, and authentication methods to ensure a clear separation of concerns between client and server." | docs/architecture/61-api-documentation.md |
| **55\. Conduct a Security Threat Model** | **Prompt:** "Conduct a security threat modeling exercise for the application architecture using the STRIDE methodology. Identify potential threats (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) and propose specific design-level mitigations." | docs/security/19-security-privacy.md |
| **56\. Check API Contract vs. PRD Sync** | **Prompt:** "Validate all OpenAPI specs (`openapi/*.yaml`) against corresponding PRD functional requirement sections and example payloads. Checks: endpoint existence, parameter names, response fields, status codes, and security schemes. Produce `reports/api_consistency/{feature_name}_api_vs_prd.csv` listing mismatches and a script `tools/analysis/api_diff_report.py` that outputs suggested diffs to align PRD or OpenAPI. Create issues for mismatches and open a draft PR with the CSV and suggested diffs." | reports/api_consistency/{feature_name}_api_vs_prd.csv |
| **57\. Check Data Model and Schema Consistency** | **Prompt:** "Compare data models declared in PRDs (`docs/data/*.md`) against actual schemas in `schemas/`, database migrations (`migrations/`), and protobuf/Avro files. Detect mismatches in field names, types, nullable flags, and retention policies. Produce `reports/schema_mismatch/{feature_name}_schema_mismatches.csv` and suggested migration patches or PRD corrections. Add `tools/analysis/schema_consistency.py` and open a draft PR with results and issues." | reports/schema_mismatch/{feature_name}_schema_mismatches.csv |
| **58\. Validate Non-Functional Requirements (NFR)** | **Prompt:** "Extract NFRs (SLOs/SLA/throughput/latency/availability) from PRDs and compare to monitoring/alerting config (`monitoring/**`, `prometheus/**`, `grafana/**`) and load-test definitions (`benchmarks/**`). Flag SLOs that are unmonitored, have no alerting, or conflict with infra sizing. Produce `reports/nfr_coverage.csv` and a `docs/gaps/{feature_name}_nfr_gaps.md`. Open issues for each NFR gap and add a CI check that fails if critical SLOs lack monitoring." | reports/nfr_coverage.csv |

### **Phase 6: Project Structure & Execution Planning**

*This phase focuses on defining your personal workflow and processes to stay organized and productive.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **59\. Establish a Development Framework** | **Prompt:** "Outline a suitable agile development framework (e.g., Personal Kanban, 1-week Scrum sprints) for a solo developer. Define the key ceremonies and routines required to maintain momentum and ensure consistent progress." | docs/ops/62-developer-onboarding.md |
| **60\. Define the Product Operations Toolchain** | **Prompt:** "Propose a cost-effective and scalable toolchain for product operations. Recommend specific tools for version control, task management, CI/CD, documentation, and design collaboration, with a justification for each." | docs/ops/62-developer-onboarding.md |
| **61\. Draft a Release Plan and 'Definition of Done'** | **Prompt:** "Draft a comprehensive release plan for the MVP. Define a strict 'Definition of Done' for user stories, sprints, and the final release to ensure quality and completeness." | docs/ops/25-release-management.md |
| **62\. Build Cross-Doc Traceability Matrix** | **Prompt:** "Build a Requirements Traceability Matrix (RTM) mapping requirements in `docs/prd/*.md` to design artifacts (`docs/architecture/*.md`), API specs (`openapi/*.yaml`), tickets (`tickets/*.csv`) and tests (`tests/**`). Output `reports/rtm/{feature_name}_rtm.csv` with columns: requirement-id, source-file, mapped-artifacts, test-coverage (yes/no), owner. Flag and create issues for any requirements with no mapped design or no tests. Commit RTM and open a draft PR." | reports/rtm/{feature_name}_rtm.csv |

### **Phase 7: Financial Modeling & Business Viability**

*This phase ensures your app makes financial sense by modeling costs and potential revenue.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **63\. Develop a TCO and ROI Model** | **Prompt:** "Create a 1-year Total Cost of Ownership (TCO) model, including all anticipated expenses (development, infrastructure, marketing, etc.). Subsequently, develop a Return on Investment (ROI) model based on the proposed monetization strategy." | docs/costs/66-costs-model.md |
| **64\. Formulate a Monetization Strategy** | **Prompt:** "Develop a comprehensive monetization model. Define the pricing strategy and tiers, and conduct a break-even analysis to determine the number of users or transactions required to achieve profitability." | docs/prd/11-monetization.md |
| **65\. Model Unit Economics (LTV/CAC)** | **Prompt:** "Create a model to estimate the Lifetime Value (LTV) of a customer and the Customer Acquisition Cost (CAC). Define the key variables for each and calculate the LTV/CAC ratio needed for a sustainable business." | docs/costs/66-costs-model.md |
| **66\. Conduct a Sensitivity Analysis** | **Prompt:** "Conduct a sensitivity analysis on your financial model. Show how a \+/- 25% change in key assumptions (e.g., conversion rate, churn, user growth) impacts your revenue and profitability projections." | docs/costs/67-advanced-cost-optimizations.md |
| **67\. Develop a Multi-Year Financial Forecast** | **Prompt:** "Develop a 3-year financial forecast that includes projected revenue, costs, and profit/loss. This should be based on your user growth and monetization assumptions." | docs/costs/66-costs-model.md |
| **68\. Analyze the Bill of Materials (BOM)** | **Prompt:** "Create a detailed Bill of Materials (BOM) that lists every third-party service, API, and software license required, along with its associated monthly or annual cost." | docs/costs/66-costs-model.md |
| **69\. Model Different Pricing Strategies** | **Prompt:** "Model the financial impact of three different pricing strategies (e.g., a low-cost entry tier, a premium tier, and a usage-based model). Compare the projected revenue and user adoption for each." | docs/prd/11-monetization.md |
| **70\. Create a Burn Rate and Runway Analysis** | **Prompt:** "Based on your projected costs and available capital, create a burn rate and runway analysis. This should calculate your monthly expenses and determine how many months you can operate before needing additional funding." | docs/costs/66-costs-model.md |
| **71\. Perform a "Sanity Check" with Industry Benchmarks** | **Prompt:** "Compare your key financial projections (e.g., LTV/CAC ratio, conversion rates) against industry benchmarks for similar apps to ensure your assumptions are realistic." | docs/costs/66-costs-model_summary.md |
| **72\. Outline a CapEx vs. OpEx Breakdown** | **Prompt:** "Categorize your projected expenses into Capital Expenditures (CapEx) and Operating Expenditures (OpEx) for proper financial planning and accounting." | docs/costs/66-costs-model.md |
| **73\. Detect Cost Model Inconsistencies** | **Prompt:** "Parse all cost-related docs (`docs/costs/**/*.md`, spreadsheets) and validate assumptions against pricing templates in `pricing/` (or a bundled sample pricing CSV). Detect unrealistic assumptions (e.g., zero egress, 0% CPU utilization), mismatched currency/units, and missing risk buffers. Produce `reports/cost_inconsistencies.csv` with severity and suggested fixes (e.g., add P90/P99 scenarios, add RI recommendations). Add `tools/cost/assumption_validator.py`. Commit and open a PR creating issues for high-severity inconsistencies." | reports/cost_inconsistencies.csv |

### **Phase 8: Go-to-Market & Growth Strategy**

*With a clear plan for the app, this phase focuses on how you will launch it and get your first users.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **74\. Architect a Product-Led Growth Engine** | **Prompt:** "Design a sustainable Product-Led Growth (PLG) loop for the application. Detail how the natural use of the product will drive user acquisition, activation, and referral, creating a virtuous growth cycle." | docs/ux/58-marketing-and-seo.md |
| **75\. Develop a Go-to-Market (GTM) Strategy** | **Prompt:** "Outline a lean, phased Go-to-Market (GTM) strategy. Define the objectives and key activities for the pre-launch, launch, and post-launch phases, focusing on high-impact, low-cost tactics." | docs/ux/58-marketing-and-seo.md |
| **76\. Formulate an Acquisition Strategy** | **Prompt:** "Identify and prioritize the top 2-3 user acquisition channels for the initial launch. Provide a rationale for each choice based on the Ideal Customer Profile and estimated channel effectiveness." | docs/ux/58-marketing-and-seo.md |
| **77\. Design the "Aha\!" Moment and Activation Funnel** | **Prompt:** "Define the 'Aha\!' moment—the point at which a new user first understands the value of your product. Then, map the key steps in the activation funnel that lead them to this moment." | docs/ux/08-ux-onboarding.md |
| **78\. Develop a Content Marketing Strategy** | **Prompt:** "Outline a content marketing strategy to attract your target audience. What kind of content (e.g., blog posts, tutorials, social media) will you create to build awareness and establish credibility?" | docs/ux/58-marketing-and-seo.md |
| **79\. Outline a Phased Rollout Plan** | **Prompt:** "To mitigate risk, outline a phased rollout plan. Will you launch in a specific geographic region first? To a private beta group? Describe the stages of your launch." | docs/ops/25-release-management.md |
| **80\. Create a "First 100 Users" Acquisition Plan** | **Prompt:** "Get specific about early growth. Detail a hands-on, non-scalable plan to acquire your first 100 users through direct outreach, personal networks, and community engagement." | docs/ux/58-marketing-and-seo.md |
| **81\. Define the Onboarding Experience** | **Prompt:** "Design the new user onboarding experience. What are the first five screens or interactions a user will have? What is the one key action you want them to take to become activated?" | docs/ux/08-ux-onboarding.md |
| **82\. Develop a Referral Program** | **Prompt:** "Outline the mechanics of a simple referral program. What is the incentive for the referrer and the referred user? How will you make it easy for users to share?" | docs/ux/54-social-sharing.md |
| **83\. Define Key Messaging and Positioning** | **Prompt:** "Craft the core messaging and positioning statement for your product. It should clearly articulate what the product is, who it's for, and why it's different, in a way that resonates with your target audience." | docs/ux/58-marketing-and-seo.md |

### **Phase 9: Long-Term Planning & Risk Mitigation**

*This final phase focuses on preparing for the future, anticipating challenges, and ensuring your app's long-term health.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **84\. Conduct a Pre-Mortem Analysis** | **Prompt:** "Conduct a 'Pre-Mortem' analysis. Assuming the product has failed six months post-launch, brainstorm and detail at least 5 plausible causes. For the top two risks, develop specific, actionable mitigation plans." | docs/prd/21-risks.md |
| **85\. Establish a Product Lifecycle Policy** | **Prompt:** "Define a formal framework for feature lifecycle management. Establish the quantitative and qualitative criteria that will be used to evaluate features for deprecation to maintain product focus and reduce technical debt." | docs/ops/25-release-management.md |
| **86\. Implement a Continuous Feedback Loop** | **Prompt:** "Design a system for continuous user feedback and product discovery. Outline the methods for collecting, synthesizing, and prioritizing user insights to inform the ongoing product roadmap." | docs/ux/55-user-feedback-collection.md |
| **87\. Conduct a SWOT Analysis** | **Prompt:** "Conduct a formal SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for the product. This should be an honest assessment of both internal and external factors." | docs/prd/03-competitive-analysis.md |
| **88\. Develop a "Kill Switch" Criteria** | **Prompt:** "Define the specific, measurable criteria that would trigger a decision to pivot or sunset the product. This ensures that you make rational, data-driven decisions if the product is not gaining traction." | docs/prd/21-risks.md |
| **89\. Outline a Data Privacy and Compliance Roadmap** | **Prompt:** "Look ahead to future data privacy and compliance needs. What regulations (e.g., GDPR, CCPA) might apply as you grow, and what steps should you take now to prepare?" | docs/security/20-compliance-regulatory.md |
| **90\. Develop a Technical Debt Management Strategy** | **Prompt:** "Outline a proactive strategy for managing technical debt. How will you allocate a percentage of your development time to refactoring and infrastructure improvements to ensure long-term health?" | docs/architecture/06-technical-architecture.md |
| **91\. Map out the "Product Vision 2.0"** | **Prompt:** "Think beyond the MVP. What does the next major iteration of the product look like? Outline a high-level vision for 'Version 2.0' to guide your long-term roadmap." | docs/prd/45-future-enhancements.md |
| **92\. Define a Customer Support and Success Strategy** | **Prompt:** "Outline your strategy for customer support. What channels will you offer (e.g., email, FAQ)? What is your target response time? How will you proactively ensure user success?" | docs/ops/24-user-support.md |
| **93\. Perform a "Future-Proofing" Analysis** | **Prompt:** "Analyze potential future trends (e.g., new technologies, changing user behaviors) and assess how they might impact your product. How can you design your app to be adaptable to future changes?" | docs/prd/45-future-enhancements.md |
| **94\. Find Semantic Contradictions** | **Prompt:** "Use an LLM-based cross-document checker to detect *semantic contradictions* across PRD docs (e.g., SLA p99 = 200ms in one doc and p99 = 500ms in another; data retention 90 days vs 2 years; auth: OAuth required vs no auth). Produce `reports/semantic_contradictions.json` with each contradiction, confidence score, files/lines, and suggested reconciliations. Add `tools/analysis/semantic_checker.py` that can be re-run in CI. Commit results and open a PR that files issues for contradictions with confidence ≥ 0.7." | reports/semantic_contradictions.json |
| **95\. Generate an End-to-End QA Checklist** | **Prompt:** "Aggregate all previous checks (lint, RTM, semantic contradictions, API diffs, schema mismatches, NFR gaps, cost inconsistencies, analytics gaps, diagrams) into a single executive remediation report `reports/remediation/{repo_name}_remediation_plan.md`. Provide: prioritized issue list (severity, owner, ETA estimate in story points), quick wins (<=1 dev-day), and a recommended remediation sprint plan (3 sprints). Add `issues/prioritized_issues.csv` and open a draft PR that adds the remediation plan and files and creates GitHub issues/tickets for the top 20 items assigned to `{assignee}`." | reports/remediation/{repo_name}_remediation_plan.md |
