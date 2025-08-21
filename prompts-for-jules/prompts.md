# **A Solo Developer's Guide to PRD Creation: Strategic Prompts**

**Version:** 1.5 | **Last Updated:** August 21, 2025

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
| **1\. Select a PRD Template** | **Prompt:** "Propose three distinct PRD templates suitable for a solo developer (e.g., a lean one-pager, a standard template, a PR-FAQ model). For each, analyze the pros and cons to help me select the most effective format for this project." | \_templates/prd\_template.md |
| **2\. Define Documentation Scope** | **Prompt:** "Define the essential documentation required for this project beyond the PRD (e.g., a concise design spec, a high-level technical architecture overview, a changelog). Justify the inclusion of each artifact to ensure a lean but comprehensive documentation suite." | README.md |
| **3\. Establish a Single Source of Truth (SSoT)** | **Prompt:** "Outline a strategy for establishing a 'Single Source of Truth' (SSoT) for all project information. Recommend a primary tool (e.g., Notion, a Git repository) and justify its selection based on accessibility, versioning, and integration capabilities." | README.md |
| **4\. Generate a PRD Table of Contents** | **Prompt:** "Based on the selected template, generate a detailed Table of Contents for the PRD. This will serve as the foundational structure and checklist for the entire document." | 02\_product\_definition/PRD\_MAIN.md |
| **5\. Define a Version Control Strategy** | **Prompt:** "Define a simple yet robust version control strategy for the PRD and other key documents. Outline the process for managing updates, revisions, and historical tracking to ensure clarity on the latest version." | README.md |
| **6\. Structure the 'Out of Scope' Section** | **Prompt:** "Draft a template for the 'Out of Scope' section of the PRD. What key areas and features should be explicitly excluded to maintain focus on the MVP and prevent scope creep?" | 02\_product\_definition/PRD\_MAIN.md |
| **7\. Create a Project Glossary Framework** | **Prompt:** "Create a structure for a project glossary. List the key technical and business terms that should be defined upfront to ensure clarity and consistency throughout all documentation." | 02\_product\_definition/PRD\_MAIN.md |
| **8\. Plan for Visual Documentation** | **Prompt:** "Outline a plan for incorporating visual documentation. Specify the essential diagrams (e.g., user flows, architecture diagrams, wireframes) and recommend tools for their creation and integration." | \_assets/README.md |
| **9\. Define a Document Review Process** | **Prompt:** "Outline a self-review checklist for the PRD. What key questions should I ask myself before finalizing a version to ensure it is complete, clear, and actionable?" | README.md |
| **10\. Draft a Documentation Maintenance Plan** | **Prompt:** "Draft a simple maintenance plan for the project documentation. Define the cadence and triggers for reviewing and updating documents to ensure they remain relevant as the project evolves." | README.md |

### **Phase 1: Strategic Framing & Vision**

*This phase is about defining the "why" behind your app and ensuring your idea is built on a solid foundation.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **11\. Craft a Strategic Narrative and Vision** | **Prompt:** "Act as a strategic advisor. For a new mobile application, '\[App Name\]', draft a 'Strategic Narrative'. This document should include a market opportunity analysis, the product's unique value proposition, and a compelling 'North Star' vision statement to guide the product development and investment thesis." | 00\_strategy\_and\_vision/01\_strategic\_narrative.md |
| **12\. Draft a 'Press Release (PR-FAQ)'** | **Prompt:** "Draft a future-dated internal Press Release for the launch of '\[App Name\]'. This document should articulate the customer benefits and market impact as if the launch were successful. Then, generate an accompanying FAQ to address critical questions from potential investors or stakeholders." | 00\_strategy\_and\_vision/02\_pr\_faq.md |
| **13\. Analyze Your Competitive Advantage** | **Prompt:** "Conduct a competitive analysis for the target market. Identify 2-3 key competitors and evaluate their strengths and weaknesses. Define the product's unique value proposition and articulate its defensible moat, considering the advantages of a solo, agile development approach." | 00\_strategy\_and\_vision/03\_competitive\_analysis.md |
| **14\. Draft a 'Working Backwards' Document** | **Prompt:** "Synthesize the product vision into a 'Working Backwards' document. The document must originate from the ideal customer experience and deconstruct it to define the Minimum Viable Product (MVP) required to deliver that experience." | 02\_product\_definition/PRD\_MAIN.md |
| **15\. Define Product Tenets** | **Prompt:** "Establish a set of 3-5 core product tenets. These should be memorable, actionable principles that will guide every product decision and trade-off (e.g., 'Simplicity over Complexity,' 'Privacy by Design')." | 00\_strategy\_and\_vision/01\_strategic\_narrative.md |
| **16\. Map the Value Chain** | **Prompt:** "Analyze the value chain for the target market. Identify where my product fits, what upstream and downstream dependencies exist, and where the greatest value can be captured." | 00\_strategy\_and\_vision/03\_competitive\_analysis.md |
| **17\. Formulate the Investment Thesis** | **Prompt:** "Articulate the investment thesis for this product in one paragraph. It should answer: Why this product? Why now? Why me? What is the expected return on the investment of my time and capital?" | 00\_strategy\_and\_vision/01\_strategic\_narrative.md |
| **18\. Conduct a PESTLE Analysis** | **Prompt:** "Conduct a PESTLE (Political, Economic, Social, Technological, Legal, Environmental) analysis to identify macro-environmental factors that could impact the product's success." | 00\_strategy\_and\_vision/03\_competitive\_analysis.md |
| **19\. Define the 'Anti-Product'** | **Prompt:** "Clearly define the 'Anti-Product'. What features, user segments, or business models will I explicitly avoid to maintain focus and strategic clarity?" | 02\_product\_definition/PRD\_MAIN.md |
| **20\. Outline the Core Business Model** | **Prompt:** "Detail the core business model. How will the product create, deliver, and capture value? (e.g., Subscription, Freemium, Transactional). Be specific about the value metric." | 06\_financials/monetization\_strategy.md |
| **21\. Draft the Elevator Pitch** | **Prompt:** "Draft a 30-second elevator pitch that clearly and concisely explains the product, the problem it solves, and its target audience." | 07\_go\_to\_market/01\_gtm\_strategy.md |
| **22\. Identify Strategic Differentiators** | **Prompt:** "Go beyond features to identify the strategic differentiators. What unique assets, data, or community effects will create a long-term, defensible advantage?" | 00\_strategy\_and\_vision/03\_competitive\_analysis.md |
| **23\. Set the North Star Metric** | **Prompt:** "Define the single North Star Metric that best represents the core value being delivered to users. This metric should be the primary measure of the product's success." | 02\_product\_definition/PRD\_MAIN.md |
| **24\. Create a Stakeholder Map** | **Prompt:** "Even as a solo developer, create a stakeholder map. Identify key external partners, advisors, or potential investors and outline a communication and engagement strategy for each." | 05\_project\_management/stakeholder\_map.md |

### **Phase 2: Market & User Discovery**

*This phase focuses on deeply understanding your target users to ensure you're building something people actually want.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **25\. Define Your Target User and 'Ideal Customer Profile' (ICP)** | **Prompt:** "Generate a detailed 'Ideal Customer Profile' (ICP) for the application's primary user segment. Include demographic, psychographic, and behavioral data, as well as their core problems and the 'Job to Be Done' they would 'hire' the product for." | 01\_research\_and\_validation/user\_persona\_icp.md |
| **26\. Draft a Hypothesis-Driven Validation Plan** | **Prompt:** "Draft a 'Lean Validation Plan'. Identify the three highest-risk assumptions underlying the business case. For each, formulate a falsifiable hypothesis and design a lean experiment to validate or invalidate it with measurable success and failure criteria." | 01\_research\_and\_validation/validation\_plan.md |
| **27\. Draft a UX Research and Usability Testing Plan** | **Prompt:** "Draft a formal UX Research and Usability Testing Plan for the MVP. The plan must include research objectives, participant criteria, the selected methodology, and a test script with key tasks to evaluate the core user flow." | 01\_research\_and\_validation/ux\_research\_plan.md |
| **28\. Develop a "Day in the Life" Scenario** | **Prompt:** "Write a short narrative describing a 'Day in the Life' of my ideal user, highlighting their current pain points and showing how my app would fit into their routine to solve a problem." | 01\_research\_and\_validation/user\_persona\_icp.md |
| **29\. Conduct a "Switch" Interview Analysis** | **Prompt:** "Outline a script for a 'switch' interview. The goal is to understand the forces (push, pull, anxiety, habit) that would make a user switch from their current solution to my product." | 01\_research\_and\_validation/qualitative\_feedback/user\_interview\_notes/switch\_interview\_script.md |
| **30\. Map the Customer Journey** | **Prompt:** "Create a customer journey map that visualizes the user's experience from awareness and consideration to onboarding, engagement, and advocacy. Identify key touchpoints and moments of friction." | 03\_design\_and\_ux/02\_user\_flows.md |
| **31\. Perform a Jobs-to-be-Done (JTBD) Analysis** | **Prompt:** "Frame the user's need using the Jobs-to-be-Done framework. What is the underlying 'job' the user is trying to accomplish? What are the functional, social, and emotional dimensions of this job?" | 01\_research\_and\_validation/user\_persona\_icp.md |
| **32\. Create an Empathy Map** | **Prompt:** "Based on my user persona, create a detailed empathy map. What does the user see, hear, think, feel, say, and do? What are their pains and gains?" | 01\_research\_and\_validation/user\_persona\_icp.md |
| **33\. Segment the Total Addressable Market (TAM)** | **Prompt:** "Break down the Total Addressable Market (TAM) into Serviceable Addressable Market (SAM) and Serviceable Obtainable Market (SOM) to create a realistic and actionable market entry strategy." | 00\_strategy\_and\_vision/01\_strategic\_narrative.md |
| **34\. Analyze Analogous Markets** | **Prompt:** "Identify and analyze an analogous market. What can I learn from a successful product that solved a similar problem for a different user base or in a different industry?" | 01\_research\_and\_validation/market\_research/analogous\_markets.md |
| **35\. Identify User "Watering Holes"** | **Prompt:** "Identify the top 3-5 online 'watering holes' where my target audience congregates (e.g., specific subreddits, forums, newsletters, influencers). This will inform my GTM strategy." | 07\_go\_to\_market/01\_gtm\_strategy.md |
| **36\. Draft a Persona "Anti-Pattern"** | **Prompt:** "To sharpen my focus, create a persona 'anti-pattern'. This should describe a user who might seem like a good fit but is explicitly *not* my target customer, and explain why." | 01\_research\_and\_validation/user\_persona\_icp.md |
| **37\. Run a "Fake Door" Demand Test** | **Prompt:** "Outline a plan for a 'fake door' demand test. This involves creating a simple landing page that describes the product and measuring interest via email sign-ups before building the full app." | 01\_research\_and\_validation/validation\_plan.md |

### **Phase 3: Solution Definition & Prioritization**

*Here, you translate your vision and user insights into a concrete set of features and a prioritized plan.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **38\. Conduct a Kano Model Analysis** | **Prompt:** "For the proposed product, generate a list of 10 potential features. Categorize these features using the Kano Model (Basic, Performance, Excitement) to inform the prioritization strategy and ensure the MVP delivers a satisfying user experience." | 02\_product\_definition/PRD\_MAIN.md |
| **39\. Develop a Themed Product Roadmap** | **Prompt:** "Structure the product plan as a 'Themed Roadmap' instead of a feature list. Define three strategic themes for the initial release (e.g., 'User Acquisition & Onboarding', 'Core Value Proposition', 'Engagement & Retention')." | 02\_product\_definition/PRD\_MAIN.md |
| **40\. Prioritize Features with the RICE Scoring Model** | **Prompt:** "Evaluate the top 10 potential features using the RICE scoring model (Reach, Impact, Confidence, Effort). Generate a table with these calculations to create a data-informed, prioritized product backlog." | 02\_product\_definition/PRD\_MAIN.md |
| **41\. Create a Comprehensive User Story Map** | **Prompt:** "Generate a user story map for the MVP. The map must visualize the end-to-end user journey, structured by user activities and tasks, to serve as a comprehensive blueprint for development sprints." | 02\_product\_definition/01\_user\_story\_map.md |
| **42\. Draft Detailed Functional and Non-Functional Requirements** | **Prompt:** "Deconstruct the top 3 user stories from the story map into detailed functional (what the system does) and non-functional (how the system performs) requirements. This should be an unambiguous specification for implementation." | 02\_product\_definition/02\_requirements\_functional.md |
| **43\. Define Feature-Level Success Metrics** | **Prompt:** "For the three core MVP features, define specific Key Performance Indicators (KPIs). Include both leading and lagging indicators to measure user adoption and value delivery effectively." | 02\_product\_definition/PRD\_MAIN.md |

### **Phase 4: Design & User Experience**

*This phase covers the user-facing design, brand identity, and responsible product principles.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **44\. Outline Your Design Principles and Brand Voice** | **Prompt:** "Outline the core design principles and a 'Voice and Tone' guide for '\[App Name\]'. Define the brand's personality and provide examples to ensure consistency across all user-facing copy and interactions." | 03\_design\_and\_ux/01\_design\_principles.md |
| **45\. Create User Flow Diagrams and Wireframes** | **Prompt:** "For the primary user journey, create a user flow diagram. Based on this flow, generate low-fidelity wireframes for the key screens, focusing on layout, information hierarchy, and core user interactions." | 03\_design\_and\_ux/02\_user\_flows.md |
| **46\. Conduct an Ethical Design Review** | **Prompt:** "Conduct an ethical design and risk assessment for the product's core functionality. Identify potential negative consequences (e.g., data privacy vulnerabilities, addictive usage patterns) and propose mitigation strategies or design principles." | 03\_design\_and\_ux/ethical\_design\_review.md |

### **Phase 5: Technical Planning**

*This phase focuses on creating a robust, scalable, and secure technical blueprint for the application.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **47\. Justify the Technology Stack** | **Prompt:** "Justify the proposed technology stack (frontend, backend, database, cloud provider). The rationale should be based on a trade-off analysis considering factors like performance requirements, development velocity, and total cost of ownership." | 04\_technical\_architecture/adrs/001\_stack\_choice.md |
| **48\. Propose the System Architecture** | **Prompt:** "Propose a high-level system architecture (e.g., serverless, monolith, microservices). Create a simple diagram and justify the chosen pattern based on the product's requirements for scale, cost, and maintainability." | 04\_technical\_architecture/01\_architecture\_overview.md |
| **49\. Conduct a 'Build vs. Buy' Analysis** | **Prompt:** "For a critical system component, such as '\[e.g., user authentication or payment processing\]', conduct a formal 'Build vs. Buy' analysis. Compare the options based on total cost of ownership, time to market, and long-term maintenance." | 04\_technical\_architecture/adrs/002\_build\_vs\_buy.md |
| **50\. Design the Data Schema** | **Prompt:** "Draft a high-level data schema for the core entities of the application. The design should consider data relationships, integrity constraints, and future scalability requirements." | 04\_technical\_architecture/data\_schema.md |
| **51\. Define the API Contract** | **Prompt:** "Define the API contract for the primary services using a standard like OpenAPI. Specify key endpoints, request/response payloads, and authentication methods to ensure a clear separation of concerns between client and server." | 04\_technical\_architecture/api\_contracts/v1\_api\_spec.md |
| **52\. Conduct a Security Threat Model** | **Prompt:** "Conduct a security threat modeling exercise for the application architecture using the STRIDE methodology. Identify potential threats (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) and propose specific design-level mitigations." | 04\_technical\_architecture/security/threat\_model.md |

### **Phase 6: Project Structure & Execution Planning**

*This phase focuses on defining your personal workflow and processes to stay organized and productive.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **53\. Establish a Development Framework** | **Prompt:** "Outline a suitable agile development framework (e.g., Personal Kanban, 1-week Scrum sprints) for a solo developer. Define the key ceremonies and routines required to maintain momentum and ensure consistent progress." | 05\_project\_management/development\_framework.md |
| **54\. Define the Product Operations Toolchain** | **Prompt:** "Propose a cost-effective and scalable toolchain for product operations. Recommend specific tools for version control, task management, CI/CD, documentation, and design collaboration, with a justification for each." | 05\_project\_management/toolchain.md |
| **55\. Draft a Release Plan and 'Definition of Done'** | **Prompt:** "Draft a comprehensive release plan for the MVP. Define a strict 'Definition of Done' for user stories, sprints, and the final release to ensure quality and completeness." | 05\_project\_management/01\_release\_plan.md |

### **Phase 7: Financial Modeling & Business Viability**

*This phase ensures your app makes financial sense by modeling costs and potential revenue.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **56\. Develop a TCO and ROI Model** | **Prompt:** "Create a 1-year Total Cost of Ownership (TCO) model, including all anticipated expenses (development, infrastructure, marketing, etc.). Subsequently, develop a Return on Investment (ROI) model based on the proposed monetization strategy." | 06\_financials/01\_tco\_model.md |
| **57\. Formulate a Monetization Strategy** | **Prompt:** "Develop a comprehensive monetization model. Define the pricing strategy and tiers, and conduct a break-even analysis to determine the number of users or transactions required to achieve profitability." | 06\_financials/monetization\_strategy.md |
| **58\. Model Unit Economics (LTV/CAC)** | **Prompt:** "Create a model to estimate the Lifetime Value (LTV) of a customer and the Customer Acquisition Cost (CAC). Define the key variables for each and calculate the LTV/CAC ratio needed for a sustainable business." | 06\_financials/unit\_economics.md |
| **59\. Conduct a Sensitivity Analysis** | **Prompt:** "Conduct a sensitivity analysis on your financial model. Show how a \+/- 25% change in key assumptions (e.g., conversion rate, churn, user growth) impacts your revenue and profitability projections." | 06\_financials/sensitivity\_analysis.md |
| **60\. Develop a Multi-Year Financial Forecast** | **Prompt:** "Develop a 3-year financial forecast that includes projected revenue, costs, and profit/loss. This should be based on your user growth and monetization assumptions." | 06\_financials/financial\_forecast.md |
| **61\. Analyze the Bill of Materials (BOM)** | **Prompt:** "Create a detailed Bill of Materials (BOM) that lists every third-party service, API, and software license required, along with its associated monthly or annual cost." | 06\_financials/bill\_of\_materials.md |
| **62\. Model Different Pricing Strategies** | **Prompt:** "Model the financial impact of three different pricing strategies (e.g., a low-cost entry tier, a premium tier, and a usage-based model). Compare the projected revenue and user adoption for each." | 06\_financials/pricing\_strategy\_model.md |
| **63\. Create a Burn Rate and Runway Analysis** | **Prompt:** "Based on your projected costs and available capital, create a burn rate and runway analysis. This should calculate your monthly expenses and determine how many months you can operate before needing additional funding." | 06\_financials/runway\_analysis.md |
| **64\. Perform a "Sanity Check" with Industry Benchmarks** | **Prompt:** "Compare your key financial projections (e.g., LTV/CAC ratio, conversion rates) against industry benchmarks for similar apps to ensure your assumptions are realistic." | 06\_financials/benchmark\_analysis.md |
| **65\. Outline a CapEx vs. OpEx Breakdown** | **Prompt:** "Categorize your projected expenses into Capital Expenditures (CapEx) and Operating Expenditures (OpEx) for proper financial planning and accounting." | 06\_financials/capex\_opex.md |

### **Phase 8: Go-to-Market & Growth Strategy**

*With a clear plan for the app, this phase focuses on how you will launch it and get your first users.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **66\. Architect a Product-Led Growth Engine** | **Prompt:** "Design a sustainable Product-Led Growth (PLG) loop for the application. Detail how the natural use of the product will drive user acquisition, activation, and referral, creating a virtuous growth cycle." | 07\_go\_to\_market/growth\_strategy.md |
| **67\. Develop a Go-to-Market (GTM) Strategy** | **Prompt:** "Outline a lean, phased Go-to-Market (GTM) strategy. Define the objectives and key activities for the pre-launch, launch, and post-launch phases, focusing on high-impact, low-cost tactics." | 07\_go\_to\_market/01\_gtm\_strategy.md |
| **68\. Formulate an Acquisition Strategy** | **Prompt:** "Identify and prioritize the top 2-3 user acquisition channels for the initial launch. Provide a rationale for each choice based on the Ideal Customer Profile and estimated channel effectiveness." | 07\_go\_to\_market/acquisition\_strategy.md |
| **69\. Design the "Aha\!" Moment and Activation Funnel** | **Prompt:** "Define the 'Aha\!' moment—the point at which a new user first understands the value of your product. Then, map the key steps in the activation funnel that lead them to this moment." | 07\_go\_to\_market/activation\_funnel.md |
| **70\. Develop a Content Marketing Strategy** | **Prompt:** "Outline a content marketing strategy to attract your target audience. What kind of content (e.g., blog posts, tutorials, social media) will you create to build awareness and establish credibility?" | 07\_go\_to\_market/content\_strategy.md |
| **71\. Outline a Phased Rollout Plan** | **Prompt:** "To mitigate risk, outline a phased rollout plan. Will you launch in a specific geographic region first? To a private beta group? Describe the stages of your launch." | 07\_go\_to\_market/02\_launch\_plan.md |
| **72\. Create a "First 100 Users" Acquisition Plan** | **Prompt:** "Get specific about early growth. Detail a hands-on, non-scalable plan to acquire your first 100 users through direct outreach, personal networks, and community engagement." | 07\_go\_to\_market/first\_100\_users\_plan.md |
| **73\. Define the Onboarding Experience** | **Prompt:** "Design the new user onboarding experience. What are the first five screens or interactions a user will have? What is the one key action you want them to take to become activated?" | 03\_design\_and\_ux/onboarding\_experience.md |
| **74\. Develop a Referral Program** | **Prompt:** "Outline the mechanics of a simple referral program. What is the incentive for the referrer and the referred user? How will you make it easy for users to share?" | 07\_go\_to\_market/referral\_program.md |
| **75\. Define Key Messaging and Positioning** | **Prompt:** "Craft the core messaging and positioning statement for your product. It should clearly articulate what the product is, who it's for, and why it's different, in a way that resonates with your target audience." | 07\_go\_to\_market/messaging\_and\_positioning.md |

### **Phase 9: Long-Term Planning & Risk Mitigation**

*This final phase focuses on preparing for the future, anticipating challenges, and ensuring your app's long-term health.*

| Prompt Title & Number | Description & Prompt | Path to PRD File |
| :---- | :---- | :---- |
| **76\. Conduct a Pre-Mortem Analysis** | **Prompt:** "Conduct a 'Pre-Mortem' analysis. Assuming the product has failed six months post-launch, brainstorm and detail at least 5 plausible causes. For the top two risks, develop specific, actionable mitigation plans." | 00\_strategy\_and\_vision/risk\_analysis.md |
| **77\. Establish a Product Lifecycle Policy** | **Prompt:** "Define a formal framework for feature lifecycle management. Establish the quantitative and qualitative criteria that will be used to evaluate features for deprecation to maintain product focus and reduce technical debt." | 02\_product\_definition/product\_lifecycle.md |
| **78\. Implement a Continuous Feedback Loop** | **Prompt:** "Design a system for continuous user feedback and product discovery. Outline the methods for collecting, synthesizing, and prioritizing user insights to inform the ongoing product roadmap." | 05\_project\_management/feedback\_process.md |
| **79\. Conduct a SWOT Analysis** | **Prompt:** "Conduct a formal SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for the product. This should be an honest assessment of both internal and external factors." | 00\_strategy\_and\_vision/swot\_analysis.md |
| **80\. Develop a "Kill Switch" Criteria** | **Prompt:** "Define the specific, measurable criteria that would trigger a decision to pivot or sunset the product. This ensures that you make rational, data-driven decisions if the product is not gaining traction." | 00\_strategy\_and\_vision/kill\_switch\_criteria.md |
| **81\. Outline a Data Privacy and Compliance Roadmap** | **Prompt:** "Look ahead to future data privacy and compliance needs. What regulations (e.g., GDPR, CCPA) might apply as you grow, and what steps should you take now to prepare?" | 04\_technical\_architecture/security/compliance\_roadmap.md |
| **82\. Develop a Technical Debt Management Strategy** | **Prompt:** "Outline a proactive strategy for managing technical debt. How will you allocate a percentage of your development time to refactoring and infrastructure improvements to ensure long-term health?" | 05\_project\_management/technical\_debt\_strategy.md |
| **83\. Map out the "Product Vision 2.0"** | **Prompt:** "Think beyond the MVP. What does the next major iteration of the product look like? Outline a high-level vision for 'Version 2.0' to guide your long-term roadmap." | 00\_strategy\_and\_vision/vision\_v2.md |
| **84\. Define a Customer Support and Success Strategy** | **Prompt:** "Outline your strategy for customer support. What channels will you offer (e.g., email, FAQ)? What is your target response time? How will you proactively ensure user success?" | 07\_go\_to\_market/customer\_support\_strategy.md |
| **85\. Perform a "Future-Proofing" Analysis** | **Prompt:** "Analyze potential future trends (e.g., new technologies, changing user behaviors) and assess how they might impact your product. How can you design your app to be adaptable to future changes?" | 00\_strategy\_and\_vision/future\_proofing.md |
