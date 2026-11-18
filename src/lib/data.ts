export const company = {
  name: "Britech Solutions",
  legalName: "Britech Solutions Limited",
  tagline: "Driven by Innovation. Powered by Technology",
  positioning: "One Britech. Three practices. Integrated solutions.",
  summary: "Integrated expertise for infrastructure, organizations and digital ecosystems.",
  address: "3rd Floor, Ngorongoro Tourism Centre, Boma Road, Arusha, Tanzania",
  email: "info@britechsolutions.co.tz",
  phones: ["+255 763 981 298", "+255 795 005 903"],
  social: {
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
  },
};

export const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

/** Britech's three professional practices (company profile). */
export type PracticeSlug = "engineering" | "digital" | "business";
export type Practice = { slug: PracticeSlug; title: string; short: string; icon: string };

export const practices: Practice[] = [
  {
    slug: "engineering",
    title: "Engineering Consultancy",
    icon: "Building2",
    short:
      "Multidisciplinary design and technical advisory across civil, structural, electrical, renewable energy, mechanical/HVAC, wet services, ICT infrastructure and project coordination.",
  },
  {
    slug: "digital",
    title: "Digital Transformation & Technology",
    icon: "Cpu",
    short:
      "Enterprise software, web and mobile applications, ERP, systems integration, data and BI, GIS, cybersecurity, cloud infrastructure and AI-enabled transformation.",
  },
  {
    slug: "business",
    title: "Business & Management Consultancy",
    icon: "Briefcase",
    short:
      "Strategy, process optimization, feasibility studies, project and program management, governance, institutional strengthening and change management.",
  },
];

export type Service = {
  slug: string;
  practice: PracticeSlug;
  title: string;
  short: string;
  headline: string;
  intro: string[];
  features: { title: string; text: string }[];
  icon: string;
};

export const services: Service[] = [
  {
    slug: "engineering-consultancy",
    practice: "engineering",
    icon: "Building2",
    title: "Engineering Consultancy",
    short:
      "Coordinated design and technical advisory for buildings, infrastructure and complex developments.",
    headline: "Coordinated engineering design for buildings, infrastructure and complex developments.",
    intro: [
      "Our engineering consultancy practice provides coordinated technical advisory and design services for buildings, infrastructure and complex developments, across civil, structural, electrical, renewable energy, mechanical/HVAC, wet services, ICT infrastructure and project coordination.",
      "Engineering assignments are undertaken in accordance with applicable Tanzanian statutory, regulatory and professional requirements, and through appropriately qualified and registered professionals where required.",
      "We coordinate across disciplines (architecture and structure, civil and wet services, civil and electrical, architecture and HVAC, architecture and ICT, electrical and solar/BESS, mechanical and structural) so that space, structure, utilities, energy, digital infrastructure and operational requirements are resolved as one system before implementation.",
    ],
    features: [
      { title: "Civil & Structural", text: "Site development, earthworks, roads, drainage, utility corridors, foundations, concrete and steel structures, roof systems, retaining structures and constructability." },
      { title: "Electrical & Energy", text: "Load assessment, distribution, substations, transformers, backup generation, lighting, earthing, solar PV, BESS, hybrid power and energy resilience." },
      { title: "Mechanical & Wet Services", text: "HVAC, ventilation, mechanical plant, water demand, storage, treatment, filtration, potable water, sewer reticulation and wastewater treatment." },
      { title: "ICT & Smart Infrastructure", text: "Fiber, structured cabling, data networks, Wi-Fi, communications infrastructure, ICT rooms, ELV coordination and smart infrastructure." },
      { title: "Digital Engineering", text: "CAD/BIM-enabled coordination, GIS, multidisciplinary interface management, engineering information control and coordinated technical documentation." },
      { title: "Project & Design Management", text: "Design coordination, program management, QA/QC, technical reviews, risk and issue management, change control and stakeholder interfaces." },
    ],
  },
  {
    slug: "business-management-consultancy",
    practice: "business",
    icon: "Briefcase",
    title: "Business & Management Consultancy",
    short:
      "Strategy, process optimization, feasibility studies, project and program management, governance and change management.",
    headline: "Aligning strategy, operations, technology and implementation.",
    intro: [
      "Britech works with enterprises, institutions and development programs to align strategy, operations, technology and implementation, translating recommendations into practical systems, processes and measurable improvement.",
      "Our consultants work in coordinated teams with Britech’s engineers, technology professionals, project specialists and data experts, so technical design, technology and operating requirements are considered together.",
    ],
    features: [
      { title: "Strategy & Transformation", text: "Corporate and digital strategy, operating models, transformation roadmaps, growth planning and organizational change." },
      { title: "Process & Operational Excellence", text: "Process mapping, business process re-engineering, workflow optimization, SOPs, requirements analysis and automation readiness." },
      { title: "Projects, Feasibility & Advisory", text: "Project and program management, PMO support, feasibility studies, market research, business cases, risk management and implementation assurance." },
    ],
  },
  {
    slug: "mobile-software-development",
    practice: "digital",
    icon: "Smartphone",
    title: "Mobile & Software Development",
    short:
      "High-quality web and mobile applications that keep your organization connected and efficient.",
    headline: "Digital solutions that are accessible anytime, anywhere.",
    intro: [
      "Today’s world demands digital solutions that are accessible anytime, anywhere. At Britech Solutions, we empower organizations to stay connected and efficient through high-quality web and mobile application development.",
      "With years of experience delivering full-cycle software development services, we specialize in building tailor-made applications that meet the unique needs of each client. Whether you’re launching a new digital service or transforming internal operations, our end-to-end approach ensures smooth, scalable, and secure user experiences.",
    ],
    features: [
      { title: "Native iOS & Android", text: "Apps optimized for specific platforms for the best performance and user experience." },
      { title: "Cross-platform Apps", text: "Run seamlessly across multiple devices using Flutter and React Native." },
      { title: "Web Applications", text: "Modern, responsive web platforms and portals built to scale." },
      { title: "Custom Software", text: "Tailor-made systems designed around your workflows and goals." },
      { title: "Full-cycle Delivery", text: "From discovery and UX design to deployment, maintenance and support." },
      { title: "Secure by Design", text: "Security and performance baked into every stage of development." },
    ],
  },
  {
    slug: "ai-powered-digital-transformation",
    practice: "digital",
    icon: "Sparkles",
    title: "AI-Powered Digital Transformation",
    short:
      "Integrate generative and agentic AI into your operations to optimize processes and accelerate growth.",
    headline: "Revolutionizing Operations. Creating New Value. Enhancing Experiences.",
    intro: [
      "At Britech Solutions, we empower organizations to transform their operations, unlock new revenue streams, and deliver exceptional customer experiences through cutting-edge digital solutions. Our end-to-end services span strategic consulting, platform development, industry-specific applications, infrastructure management, and value chain transformation.",
      "Our agentic AI capabilities go beyond innovation hype, integrating AI directly into enterprise operations to optimize processes, enhance decision-making, and accelerate growth. With Britech Solutions, you gain a trusted partner dedicated to helping you harness generative AI securely, responsibly, and strategically.",
    ],
    features: [
      { title: "AI Strategy & Consulting", text: "Identify where generative AI and emerging technologies deliver the greatest value." },
      { title: "Agentic AI Integration", text: "Embed AI agents directly into enterprise workflows and operations." },
      { title: "Model Selection & Architecture", text: "Choose the right models and design robust, scalable AI architectures." },
      { title: "Partnership Enablement", text: "Leverage our technology partner ecosystem to accelerate adoption." },
      { title: "Talent Development", text: "Upskill your teams to work confidently alongside AI." },
      { title: "Compliance & Risk", text: "Adopt AI responsibly with governance, compliance and risk management." },
    ],
  },
  {
    slug: "training-support-capacity-building",
    practice: "digital",
    icon: "GraduationCap",
    title: "Training, Support & Capacity Building",
    short:
      "We equip your teams with the skills, tools, and ongoing support needed to fully adopt and sustain digital systems.",
    headline: "Technology alone is not enough. People need the skills and confidence to use it.",
    intro: [
      "At Britech Solutions, we provide comprehensive training, technical support, and capacity-building services to ensure that our digital solutions are fully adopted, sustainable, and impactful.",
      "We work closely with clients to build internal capacity, reduce dependency on external support, and empower users at all levels to manage and maintain the systems we deliver, with bilingual delivery in English and Kiswahili where needed.",
    ],
    features: [
      { title: "User Training & Onboarding", text: "Tailored on-site or virtual sessions, from basic usage to advanced features." },
      { title: "Documentation & User Manuals", text: "Easy-to-follow guides, video tutorials, and SOPs for long-term knowledge retention." },
      { title: "Helpdesk & Technical Support", text: "Ongoing support via email, phone and ticketing to ensure uninterrupted performance." },
      { title: "Train-the-Trainer Programs", text: "Empower client-side trainers and IT teams to cascade knowledge internally." },
      { title: "Capacity Building Workshops", text: "Strengthen digital skills, data management practices, and change management." },
      { title: "Post-Deployment Support", text: "Maintenance contracts and SLA-driven support for continued optimization." },
    ],
  },
  {
    slug: "enterprise-software-erp-development",
    practice: "digital",
    icon: "Layers",
    title: "Enterprise Software & ERP Development",
    short:
      "Scalable ERP and enterprise solutions that streamline workflows and improve business efficiency.",
    headline: "ERP solutions that are intuitive, fully integrated, highly secure, and scalable.",
    intro: [
      "We specialize in building robust, scalable enterprise software tailored to complex operational needs. From custom business applications to full-scale ERP systems, our solutions streamline workflows, enhance decision-making, and improve organizational efficiency.",
      "We design ERP systems that integrate finance, inventory, procurement, HR, project management, and CRM into a single unified platform, centralizing operations, providing real-time data visibility, and supporting scalable growth.",
    ],
    features: [
      { title: "Unified ERP Platforms", text: "Finance, inventory, procurement, HR, projects and CRM in one system." },
      { title: "Process-driven Design", text: "Built on a deep understanding of business processes and operational challenges." },
      { title: "Seamless Integrations", text: "Connect payment gateways, APIs, GIS platforms and third-party systems." },
      { title: "Agile Delivery", text: "Rapid, adaptive development that responds to your changing needs." },
      { title: "Real-time Visibility", text: "Live dashboards and reporting across every department." },
      { title: "Local Support & Training", text: "On-the-ground support to drive user adoption." },
    ],
  },
  {
    slug: "business-intelligence-services",
    practice: "digital",
    icon: "BarChart3",
    title: "Business Intelligence Services",
    short:
      "Turn raw data into real-time insights with dashboards, analytics, and reporting tools for smarter decisions.",
    headline: "Transform raw data into meaningful, real-time insights.",
    intro: [
      "In a data-driven world, organizations that can quickly analyze and act on information gain a clear competitive advantage. We design and implement dynamic dashboards and BI solutions that transform raw data into meaningful, real-time insights.",
      "Our tools help organizations track KPIs, monitor program outcomes, and inform strategic decision-making across agriculture, health, education, conservation, and finance.",
    ],
    features: [
      { title: "Custom Dashboards", text: "Interactive dashboards in Power BI, Tableau and open-source tools." },
      { title: "Data Integration", text: "Unify ERP, CRM, GIS, mobile apps, Excel and SQL databases into one view." },
      { title: "KPIs & Performance", text: "Define and visualize KPIs for operations, donor reporting, or executive oversight." },
      { title: "Predictive Analytics", text: "Forecast outcomes and identify areas for strategic intervention." },
      { title: "Automated Reporting", text: "Auto-updating dashboards with exportable visuals for regular reviews." },
      { title: "GIS-Enabled Dashboards", text: "Combine spatial and statistical data for field monitoring and planning." },
    ],
  },
  {
    slug: "cybersecurity-it-audit",
    practice: "digital",
    icon: "ShieldCheck",
    title: "Cybersecurity & IT Audit Services",
    short:
      "End-to-end cybersecurity and IT audit services to stay secure, compliant, and resilient against evolving threats.",
    headline: "Safeguarding Digital Ecosystems. Building Trust. Ensuring Resilience.",
    intro: [
      "In today’s hyper-connected digital landscape, cybersecurity is no longer a peripheral IT concern. It is a critical business priority that demands strategic attention, technical expertise, and proactive action.",
      "We serve enterprises, government agencies, NGOs, and development partners across finance, health, agriculture, education, conservation, and governance. Our services meet local and international compliance standards, ensuring your systems are protected, audit-ready, and future-proof.",
    ],
    features: [
      { title: "Penetration Testing (VAPT)", text: "Controlled attack simulations that uncover weaknesses before they are exploited." },
      { title: "Information Security Audits", text: "Audits aligned to ISO 27001, NIST, COBIT and sector-specific requirements." },
      { title: "IT Risk & Compliance", text: "Risk mapping and mitigation aligned with TCRA, GDPR and HIPAA protocols." },
      { title: "Network & Endpoint Security", text: "Firewalls, IDS/IPS and advanced endpoint protection, continuously monitored." },
      { title: "Certified Experts", text: "Leadership certified in CISA, CISSP, PMP and ITIL." },
      { title: "Security Awareness", text: "Equip your people to recognize and respond to modern threats." },
    ],
  },
  {
    slug: "cloud-infrastructure",
    practice: "digital",
    icon: "Cloud",
    title: "Cloud & Infrastructure",
    short: "Cloud architecture and hosting, infrastructure and network planning, backup, resilience and deployment.",
    headline: "Reliable infrastructure for the systems your organization depends on.",
    intro: [
      "We design and run the cloud and on-premise infrastructure that business systems depend on, from architecture and hosting to networks, backup and deployment.",
      "As an accredited .tz domain registrar, Britech hosts domains and accounts on secure, high-performance infrastructure.",
    ],
    features: [
      { title: "Cloud Architecture & Hosting", text: "Cloud and hosted environments designed for the performance, security and cost your systems need." },
      { title: "Infrastructure Planning", text: "On-premise, cloud and hybrid infrastructure planned for scale, performance and resilience." },
      { title: "Backup & Resilience", text: "Backup, recovery and continuity arrangements that keep systems and data available." },
      { title: "Network Architecture", text: "Network design that connects sites, users and systems securely." },
      { title: "DevOps & Deployment", text: "Repeatable deployment and release practices that get software into production reliably." },
    ],
  },
  {
    slug: "digital-strategy-it-consulting",
    practice: "digital",
    icon: "Compass",
    title: "Digital Strategy & IT Consulting",
    short:
      "Align IT investments with business objectives to ensure maximum return and long-term value.",
    headline: "Align IT investments with business objectives for maximum return.",
    intro: [
      "We help organizations harness the power of technology to drive innovation, improve efficiency, and achieve strategic goals.",
      "Our Digital Strategy & IT Consulting services guide companies, institutions, and development partners through their digital transformation journeys, whether starting from scratch or scaling existing systems.",
    ],
    features: [
      { title: "Transformation Roadmaps", text: "Assess digital maturity and build actionable plans to modernize." },
      { title: "Infrastructure Planning", text: "Design on-prem or cloud infrastructure for scale, performance and resilience." },
      { title: "Enterprise Architecture", text: "Structure ecosystems for integration, data flow and scalability." },
      { title: "ERP Advisory & Selection", text: "Process mapping and system evaluation to pick the right ERP." },
      { title: "IT Governance & Policy", text: "Policies, SOPs and data protection frameworks for compliance." },
      { title: "Feasibility & Scoping", text: "Proposal development, ROI analysis and pilots for donor-funded or internal projects." },
    ],
  },
];

export const stats = [
  { value: "8+", label: "Years of growth & innovation" },
  { value: "50+", label: "Clients served" },
  { value: "10+", label: "Engineering projects delivered" },
  { value: "3", label: "Integrated professional practices" },
];

export const highlights = [
  { title: "Three Integrated Practices", text: "Engineers, technology professionals, project specialists, data experts and business consultants working in coordinated teams.", icon: "Layers" },
  { title: "Engineering Delivery", text: "10+ engineering projects delivered, through appropriately qualified and registered professionals where required.", icon: "Building2" },
  { title: "Own Digital Products", text: "HESABU, Foresta360, Shamba BI and the Britech Universal DDI Product Suite, alongside platforms such as RASIFlow and Resulynx.", icon: "Package" },
  { title: "Compliance & Integrity", text: "We operate in full compliance with Tanzanian laws and ICT regulations, upholding integrity, transparency, and accountability.", icon: "Scale" },
  { title: "Domain Registrar & Hosting", text: "Accredited .tz domain registrar with nearly 200 domains and hosted accounts on secure, high-performance infrastructure.", icon: "Globe" },
  { title: "Custom Mobile Applications", text: "10+ custom iOS and Android apps built with Flutter and React Native for agriculture, health, and finance.", icon: "Smartphone" },
  { title: "Professional Expertise", text: "Leadership certified in PMP, CISA, ITIL, and CISSP, bringing global best practice in delivery, security and governance.", icon: "BadgeCheck" },
  { title: "Client Base", text: "More than 50 clients served, with long-term partnerships across the public sector, development programs and business.", icon: "Users" },
  { title: "Bilingual Training & Support", text: "Human-centered training and helpdesk support delivered in English and Kiswahili, matched to each user’s role.", icon: "GraduationCap" },
];

export const values = [
  { title: "Quality", text: "We combine creativity and innovation to deliver solutions that provide real, lasting value: simple yet impactful." },
  { title: "People", text: "We attract top talent, invest in their growth, and recognize their contributions. Our team is our greatest asset." },
  { title: "Teamwork", text: "We believe in the power of collaboration. By leveraging our collective strengths, we achieve excellence together." },
  { title: "Customers", text: "Our clients are at the heart of our business. We build lasting relationships through responsive, personalized service." },
  { title: "Integrity", text: "We act with honesty, transparency, and accountability. Doing the right thing is non-negotiable." },
];

export const partners = [
  { name: "Microsoft", file: "microsoft" },
  { name: "Google", file: "google" },
  { name: "AWS", file: "aws" },
  { name: "Fortinet", file: "fortinet" },
  { name: "Sophos", file: "sophos" },
  { name: "Hewlett Packard Enterprise", file: "hpe" },
  { name: "VMware", file: "vmware" },
  { name: "SAP", file: "sap" },
  { name: "Sage", file: "sage" },
  { name: "Yealink", file: "yealink" },
  { name: "Lenovo", file: "lenovo" },
  { name: "Yas (formerly Tigo)", file: "yas" },
];


/* ------------------------------------------------------------------ */
/* Content adapted from the Figma template (reviewed — methodology    */
/* only; no client names, figures or unverified claims).              */
/* ------------------------------------------------------------------ */

/** How each service is delivered. ERP has no entry yet, so its page omits the section. */
export const serviceProcess: Record<string, { approach: string[]; deliverables: string[] }> = {
  "digital-strategy-it-consulting": {
    approach: [
      "Institutional assessment and stakeholder consultation",
      "Current-state analysis and benchmarking",
      "Future-state design and priority setting",
      "Roadmap development and implementation planning",
    ],
    deliverables: ["Digital transformation strategy", "Technology roadmap", "Implementation plan", "IT governance framework"],
  },
  "mobile-software-development": {
    approach: [
      "Requirements gathering and process mapping",
      "User-centered design and prototyping",
      "Agile development with regular stakeholder reviews",
      "Testing, deployment, and handover",
    ],
    deliverables: [
      "Custom web and mobile applications",
      "API development and integration",
      "System architecture documentation",
      "User training materials",
    ],
  },
  "cybersecurity-it-audit": {
    approach: [
      "Security assessment and vulnerability scanning",
      "Risk identification and prioritization",
      "Remediation planning and implementation support",
      "Continuous monitoring and improvement",
    ],
    deliverables: ["Security assessment report", "Risk mitigation plan", "Security policy framework", "Incident response procedures"],
  },
  "business-intelligence-services": {
    approach: [
      "Data source mapping and quality assessment",
      "Analytics architecture design",
      "Dashboard development and visualization",
      "User training and adoption support",
    ],
    deliverables: ["Interactive BI dashboards", "Predictive analytics models", "Automated reporting", "Data governance framework"],
  },
  "ai-powered-digital-transformation": {
    approach: [
      "Process analysis and automation opportunity identification",
      "Model selection and solution design",
      "Integration with existing systems",
      "Performance monitoring and refinement",
    ],
    deliverables: ["Automation workflows", "AI models and integrations", "Integration APIs", "Model performance reports"],
  },
  "training-support-capacity-building": {
    approach: [
      "Training needs assessment",
      "Curriculum development and materials preparation",
      "Workshop delivery and hands-on practice",
      "Post-training evaluation and follow-up",
    ],
    deliverables: ["Training curriculum", "Workshop materials", "User manuals and guides", "Training evaluation report"],
  },
};

/** Britech's integrated delivery model (company profile), used on the home and About pages. */
export const engagementProcess = [
  { title: "Strategy", text: "Business goals and outcomes." },
  { title: "Assess", text: "Technical, digital and operational needs." },
  { title: "Design", text: "Engineering, systems and processes." },
  { title: "Implement", text: "Deployment and delivery." },
  { title: "Assure", text: "Quality assurance, security and optimization." },
];

/** Sectors Britech supports (company profile). */
export const sectors = [
  "Hospitality & Tourism",
  "Real Estate",
  "Agriculture & Agribusiness",
  "Development Programs",
  "Financial Services",
  "Government & Public Sector",
  "Education",
  "Healthcare",
  "Logistics & Trade",
  "Environment & Natural Resources",
  "SMEs & Corporate Enterprises",
];

/** Britech's positioning (company profile), used on the About page. */
export const positioning = [
  "Physical infrastructure, digital infrastructure and business infrastructure. Modern projects rarely fit within one discipline. Britech’s operating model brings engineers, technology professionals, project specialists, data experts and business consultants into coordinated teams, so that technical design, technology and operating requirements are considered together.",
  "Our leadership includes professionals with credentials in project management, cybersecurity, service management and information systems assurance, including PMP, CISA, CISSP and ITIL. Britech’s established digital portfolio spans enterprise systems, mobile applications, data platforms and sector-specific solutions.",
];

export type Industry = {
  slug: string;
  icon: string;
  title: string;
  short: string;
  intro: string;
  challenges: string[];
  /** Only capabilities backed by Britech's services/products. */
  help: string[];
  related: string[]; // service slugs
};

export const industries: Industry[] = [
  {
    slug: "government-public-sector",
    icon: "Landmark",
    title: "Government & Public Sector",
    short: "Digital governance, service delivery, and institutional systems.",
    intro:
      "We work with public institutions to modernize service delivery, strengthen institutional capacity, and improve transparency, in full compliance with Tanzanian laws and ICT regulations.",
    challenges: [
      "Legacy systems and fragmented data",
      "Limited technical capacity and budget constraints",
      "Complex stakeholder coordination",
      "Pressure for better service delivery and transparency",
    ],
    help: [
      "Digital portals, workflows, and records systems",
      "Performance monitoring and reporting dashboards",
      "IT audits, cybersecurity, and governance frameworks",
      "Digital transformation roadmaps and IT policy development",
    ],
    related: ["digital-strategy-it-consulting", "cybersecurity-it-audit", "business-intelligence-services"],
  },
  {
    slug: "ngos-development-partners",
    icon: "HeartHandshake",
    title: "NGOs & Development Partners",
    short: "Data collection, M&E dashboards, and donor reporting.",
    intro:
      "We support NGOs and donor-funded programmes with technology that improves programme effectiveness, simplifies reporting, and turns field data into evidence.",
    challenges: [
      "Complex reporting requirements across multiple donors",
      "Difficulty tracking results and measuring impact",
      "Fragmented data across implementing partners",
      "Need for real-time visibility into programme performance",
    ],
    help: [
      "Mobile data collection tools",
      "Monitoring & evaluation dashboards and KPI tracking",
      "Data integration and automated donor reporting",
      "Feasibility studies and digital project scoping",
    ],
    related: ["business-intelligence-services", "mobile-software-development", "digital-strategy-it-consulting"],
  },
  {
    slug: "agriculture-natural-resources",
    icon: "Sprout",
    title: "Agriculture & Natural Resources",
    short: "Field apps, traceability, and resource monitoring.",
    intro:
      "We build digital tools for agricultural organizations and natural-resource institutions to improve productivity, traceability, and data-driven decision-making.",
    challenges: [
      "Limited access to timely market and field information",
      "Inefficient supply chains and weak traceability",
      "Climate impacts and resource degradation",
      "Need for data-driven decision making",
    ],
    help: [
      "Mobile apps for field officers and farmer engagement",
      "Supply-chain traceability systems",
      "GIS-enabled monitoring of natural resources",
      "Dashboards for programme and production data",
    ],
    related: ["mobile-software-development", "business-intelligence-services", "enterprise-software-erp-development"],
  },
  {
    slug: "financial-services",
    icon: "Banknote",
    title: "Financial Services",
    short: "Secure digital channels, integrations, and compliance.",
    intro:
      "We help financial institutions build secure, scalable digital services and stay compliant in the face of evolving threats.",
    challenges: [
      "High cost of serving remote and rural customers",
      "Legacy systems that slow down innovation",
      "Strict regulatory and security requirements",
      "Competition from mobile money and digital-first players",
    ],
    help: [
      "Secure web and mobile applications",
      "Payment gateway and third-party API integration",
      "Penetration testing, IT audits, and compliance",
      "BI dashboards for portfolio and performance tracking",
    ],
    related: ["cybersecurity-it-audit", "mobile-software-development", "business-intelligence-services"],
  },
  {
    slug: "healthcare",
    icon: "Stethoscope",
    title: "Healthcare",
    short: "Electronic medical records and health data systems.",
    intro:
      "We develop digital health solutions that improve patient record-keeping, strengthen health data, and support evidence-based planning.",
    challenges: [
      "Fragmented patient records and data silos",
      "Limited access to care in remote areas",
      "Need for timely, reliable health data",
    ],
    help: [
      "Electronic medical records (EMR)",
      "Mobile health applications",
      "Health data dashboards and reporting",
      "Security and data protection for sensitive records",
    ],
    related: ["mobile-software-development", "business-intelligence-services", "cybersecurity-it-audit"],
  },
  {
    slug: "education",
    icon: "GraduationCap",
    title: "Education",
    short: "E-learning platforms and institution management.",
    intro:
      "We support educational institutions with technology that improves administration, expands access to learning, and builds digital skills.",
    challenges: [
      "Limited access to quality learning resources",
      "Inefficient administration and data management",
      "Need for distance and blended learning",
    ],
    help: [
      "E-learning platforms",
      "Institution management and ERP systems",
      "Digital skills and capacity-building programmes",
      "Reporting dashboards for administrators",
    ],
    related: ["mobile-software-development", "enterprise-software-erp-development", "training-support-capacity-building"],
  },
  {
    slug: "environment-conservation",
    icon: "TreePine",
    title: "Environment & Conservation",
    short: "GIS monitoring and conservation data.",
    intro:
      "We build GIS-enabled tools that help governments, conservation agencies, and research institutions map assets, monitor resources, and act on reliable data.",
    challenges: [
      "Limited real-time environmental data",
      "Difficulty proving the origin of natural products",
      "Coordinating field teams across large areas",
    ],
    help: [
      "GIS-enabled monitoring of natural resources",
      "GIS-enabled dashboards for field activities",
      "Mobile data collection for field teams",
      "Conservation programme reporting",
    ],
    related: ["business-intelligence-services", "mobile-software-development", "ai-powered-digital-transformation"],
  },
];

/** Options for the contact form “How can we help you?” field. */
export const INQUIRY_SERVICES = [
  "Engineering Consultancy",
  "Business & Management Consultancy",
  "Mobile & Software Development",
  "AI-Powered Digital Transformation",
  "Enterprise Software & ERP",
  "Business Intelligence",
  "Cybersecurity & IT Audit",
  "Digital Strategy & IT Consulting",
  "Cloud & Infrastructure",
  "Training & Support",
  "Bulk SMS (Njiwa)",
  "Product demo",
  "Domain & Hosting",
  "Other",
] as const;

type InquiryService = (typeof INQUIRY_SERVICES)[number];

const SERVICE_FOR_SOLUTION: Record<string, InquiryService> = {
  "engineering-consultancy": "Engineering Consultancy",
  "business-management-consultancy": "Business & Management Consultancy",
  "cloud-infrastructure": "Cloud & Infrastructure",
  "mobile-software-development": "Mobile & Software Development",
  "ai-powered-digital-transformation": "AI-Powered Digital Transformation",
  "training-support-capacity-building": "Training & Support",
  "enterprise-software-erp-development": "Enterprise Software & ERP",
  "business-intelligence-services": "Business Intelligence",
  "cybersecurity-it-audit": "Cybersecurity & IT Audit",
  "digital-strategy-it-consulting": "Digital Strategy & IT Consulting",
};

/** Link to the contact form with the “How can we help?” option (and optionally a message) pre-filled. */
export function contactHref({ service, message }: { service?: InquiryService; message?: string } = {}) {
  const q = new URLSearchParams();
  if (service) q.set("service", service);
  if (message) q.set("message", message);
  const s = q.toString();
  return s ? `/contact?${s}#form` : "/contact#form";
}

export const contactForSolution = (slug: string) => contactHref({ service: SERVICE_FOR_SOLUTION[slug] });

export const contactForProduct = (p: { slug: string; name: string }) =>
  p.slug === "njiwa"
    ? contactHref({ service: "Bulk SMS (Njiwa)", message: "I’d like to learn more about Njiwa bulk SMS." })
    : contactHref({ service: "Product demo", message: `I’d like a demo of ${p.name}.` });

export const isInquiryService = (v: string | undefined): v is InquiryService =>
  (INQUIRY_SERVICES as readonly string[]).includes(v ?? "");

export const servicesIn = (practice: PracticeSlug) => services.filter((s) => s.practice === practice);
