export type GroupId = 'programming' | 'security' | 'ai' | 'network' | 'cloud' | 'data' | 'systems' | 'engineering' | 'backend' | 'design';
export type Level = 'Entry' | 'Intermediate' | 'Senior';
export type Stage = 'Foundational' | 'Intermediate' | 'Advanced' | 'Specialized';
export type SourceKey = keyof typeof sources;
export const curriculumVersion = '2026.11.1';
export const sources = {
  internet: ['MDN · How the web works', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works'],
  dns: ['Cloudflare · What is DNS?', 'https://www.cloudflare.com/learning/dns/what-is-dns/'],
  http: ['MDN · Overview of HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview'],
  status: ['MDN · HTTP response status codes', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status'],
  api: ['MDN · Introduction to web APIs', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Introduction'],
  retry: ['RFC 9110 · Idempotent methods', 'https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods'],
  memory: ['Kingston · Memory and storage', 'https://www.kingston.com/en/blog/pc-performance/difference-between-memory-storage'],
  shell: ['Linux manual · Working directory', 'https://man7.org/linux/man-pages/man1/pwd.1.html'],
  python: ['Python · An informal introduction', 'https://docs.python.org/3/tutorial/introduction.html'],
  branch: ['Python · Control flow', 'https://docs.python.org/3/tutorial/controlflow.html'],
  maps: ['Python · Dictionary implementation', 'https://docs.python.org/3/faq/design.html#how-are-dictionaries-implemented-in-cpython'],
  search: ['Harvard CS50 · Algorithms', 'https://cs50.harvard.edu/x/notes/3/'],
  sql: ['SQLite · SELECT', 'https://www.sqlite.org/lang_select.html'],
  joins: ['PostgreSQL · Joins between tables', 'https://www.postgresql.org/docs/current/tutorial-join.html'],
  auth: ['OWASP · Authentication guidance', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'],
  access: ['OWASP · Authorization guidance', 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html'],
  git: ['Pro Git · Recording changes', 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository'],
  tests: ['Python · Unit testing', 'https://docs.python.org/3/library/unittest.html'],
  backup: ['AWS Well-Architected · Test recovery', 'https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_backing_up_data_periodic_recovery_testing_data.html'],
  monitor: ['Google SRE · Monitoring distributed systems', 'https://sre.google/sre-book/monitoring-distributed-systems/'],
  split: ['Google ML Crash Course · Dividing datasets', 'https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets'],
  metrics: ['Google ML Crash Course · Precision and recall', 'https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall'],
  caches: ['MDN · HTTP caching', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching'],
  transactions: ['PostgreSQL · Transactions', 'https://www.postgresql.org/docs/current/tutorial-transactions.html'],
  indexes: ['PostgreSQL · Introduction to indexes', 'https://www.postgresql.org/docs/current/indexes-intro.html'],
  collections: ['Python · Data structures', 'https://docs.python.org/3/tutorial/datastructures.html'],
  graphs: ['Princeton Algorithms · Undirected graphs', 'https://algs4.cs.princeton.edu/41graph/'],
  delivery: ['GitHub Docs · Understanding workflows', 'https://docs.github.com/en/actions/get-started/understand-github-actions'],
  rag: ['Microsoft Learn · Retrieval-augmented generation', 'https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview'],
  queueing: ['Azure Architecture Center · Queue-based load leveling', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling'],
  bigo: ['Harvard CS50 · Algorithms and runtime', 'https://cs50.harvard.edu/x/notes/3/'],
  oop: ['Python · Classes and inheritance', 'https://docs.python.org/3/tutorial/classes.html'],
  methods: ['MDN · HTTP request methods', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods'],
  passwords: ['OWASP · Password storage', 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],
  injection: ['OWASP · SQL injection prevention', 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'],
  containers: ['Docker · What is a container?', 'https://docs.docker.com/learn/content/what-is-a-container/'],
  slo: ['Google SRE · Service level objectives', 'https://sre.google/sre-book/service-level-objectives/'],
  scale: ['AWS Well-Architected · Use automated scaling', 'https://docs.aws.amazon.com/wellarchitected/latest/framework/perf_process_culture_automated_resource_management.html'],
  promptSecurity: ['OWASP · Prompt injection', 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/'],
  threatModel: ['OWASP · Threat modeling', 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html'],
  sqlTransactions: ['PostgreSQL · Transaction isolation', 'https://www.postgresql.org/docs/current/transaction-iso.html'],
  osProcesses: ['Linux man-pages · Processes and threads', 'https://man7.org/linux/man-pages/man7/pthreads.7.html'],
  tls: ['MDN · Transport Layer Security', 'https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security'],
  algorithms: ['Princeton Algorithms · Course materials', 'https://algs4.cs.princeton.edu/home/'],
  asyncJS: ['MDN · JavaScript execution model', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model'],
  webCurriculum: ['MDN · Front-end curriculum', 'https://developer.mozilla.org/en-US/curriculum/'],
  systemsDesign: ['Microsoft · Cloud design patterns', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/'],
  offline: ['Android Developers · Offline-first architecture', 'https://developer.android.com/topic/architecture/data-layer/offline-first'],
  lifecycle: ['Android Developers · Activity lifecycle', 'https://developer.android.com/guide/components/activities/activity-lifecycle'],
  webVitals: ['web.dev · Web Vitals', 'https://web.dev/articles/vitals'],
  validation: ['OWASP · Input validation', 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html'],
  secrets: ['OWASP · Secrets management', 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'],
  provenance: ['SLSA · Build provenance', 'https://slsa.dev/spec/v1.2/provenance'],
  incidents: ['NIST · Incident response recommendations', 'https://csrc.nist.gov/pubs/sp/800/61/r3/final'],
  privacy: ['NIST · Privacy Framework', 'https://www.nist.gov/privacy-framework'],
  nice: ['NIST · NICE Workforce Framework', 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center'],
  cidr: ['RFC 4632 · Classless Inter-domain Routing', 'https://www.rfc-editor.org/rfc/rfc4632'],
  transport: ['RFC 9293 · Transmission Control Protocol', 'https://www.rfc-editor.org/rfc/rfc9293'],
  dhcp: ['RFC 2131 · Dynamic Host Configuration Protocol', 'https://www.rfc-editor.org/rfc/rfc2131'],
  vm: ['Red Hat · Virtualization', 'https://www.redhat.com/en/topics/virtualization/what-is-virtualization'],
  kube: ['Kubernetes · Deployments', 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/'],
  iac: ['HashiCorp · Terraform fundamentals', 'https://developer.hashicorp.com/terraform/intro'],
  canary: ['Google SRE Workbook · Canarying releases', 'https://sre.google/workbook/canarying-releases/'],
  sreBook: ['Google · Site Reliability Engineering', 'https://sre.google/sre-book/table-of-contents/'],
  mlCourse: ['Google · Machine Learning Crash Course', 'https://developers.google.com/machine-learning/crash-course'],
  mlOps: ['Google · Rules of machine learning', 'https://developers.google.com/machine-learning/guides/rules-of-ml'],
  aiRisk: ['NIST · AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework'],
  pytorch: ['PyTorch · Automatic differentiation', 'https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html'],
  transformer: ['Google · Introduction to large language models', 'https://developers.google.com/machine-learning/crash-course/llm'],
  stats: ['NIST · Engineering Statistics Handbook', 'https://www.itl.nist.gov/div898/handbook/'],
  windows: ['PostgreSQL · Window functions', 'https://www.postgresql.org/docs/current/tutorial-window.html'],
  constraints: ['PostgreSQL · Constraints', 'https://www.postgresql.org/docs/current/ddl-constraints.html'],
  replication: ['PostgreSQL · High availability and replication', 'https://www.postgresql.org/docs/current/high-availability.html'],
  warehouse: ['Microsoft · Star schema design', 'https://learn.microsoft.com/en-us/power-bi/guidance/star-schema'],
  stream: ['Apache Beam · Programming guide', 'https://beam.apache.org/documentation/programming-guide/'],
  research: ['GOV.UK · User research', 'https://www.gov.uk/service-manual/user-research'],
  product: ['GOV.UK · Measuring success', 'https://www.gov.uk/service-manual/measuring-success'],
  scrum: ['Scrum Guides · Scrum Guide', 'https://scrumguides.org/scrum-guide.html'],
  wcag: ['W3C · Web Accessibility Tutorials', 'https://www.w3.org/WAI/tutorials/'],
  softwarePractice: ['Google · Engineering practices', 'https://google.github.io/eng-practices/review/'],
  identity: ['Microsoft · Identity lifecycle management', 'https://learn.microsoft.com/en-us/entra/id-governance/what-is-identity-lifecycle-management'],
  standards: ['ACM, IEEE-CS and AAAI · CS2023 knowledge areas', 'https://csed.acm.org/knowledge-areas/'],
  endpoint: ['NIST · Enterprise patch management planning', 'https://csrc.nist.gov/pubs/sp/800/40/r4/final'],
  finops: ['FinOps Foundation · Unit economics', 'https://www.finops.org/framework/capabilities/unit-economics/'],
  ethics: ['ACM · Code of Ethics', 'https://www.acm.org/code-of-ethics'],
  labels: ['W3C WAI · Labeling controls', 'https://www.w3.org/WAI/tutorials/forms/labels/'],
  pageStructure: ['W3C WAI · Page structure', 'https://www.w3.org/WAI/tutorials/page-structure/'],
  cssCascade: ['MDN · CSS cascade layers', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers'],
  dialog: ['W3C APG · Modal dialog pattern', 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'],
  reactRender: ['React · Render and commit', 'https://react.dev/learn/render-and-commit'],
  webassembly: ['WebAssembly · High-level goals', 'https://webassembly.org/docs/high-level-goals/'],
  serviceDesign: ['GOV.UK · Design System', 'https://design-system.service.gov.uk/'],
  garbageCollection: ['Python · Garbage collector interface', 'https://docs.python.org/3/library/gc.html'],
  traces: ['OpenTelemetry · Traces', 'https://opentelemetry.io/docs/concepts/signals/traces/'],
  cloudResponsibility: ['AWS · Shared Responsibility Model', 'https://aws.amazon.com/compliance/shared-responsibility-model/'],
  oidc: ['OpenID Foundation · OpenID Connect Core', 'https://openid.net/specs/openid-connect-core-1_0.html'],
  sessions: ['OWASP · Session management', 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html'],
  webDefense: ['OWASP · Cross-site scripting prevention', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'],
  partitions: ['PostgreSQL · Table partitioning', 'https://www.postgresql.org/docs/current/ddl-partitioning.html'],
  failureIsolation: ['AWS Well-Architected · Fault isolation', 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/use-fault-isolation-to-protect-your-workload.html'],
  cors: ['W3C · CORS for Developers', 'https://w3c.github.io/webappsec-cors-for-developers/'],
  permissions: ['Android Developers · Request runtime permissions', 'https://developer.android.com/training/permissions/requesting'],
  storageModels: ['Azure Architecture Center · Data store models', 'https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/data-store-overview'],
} as const;

export interface Exercise {
  kind: 'choice' | 'input' | 'order';
  prompt: string;
  options: string[];
  answer: string[];
  hint: string;
  explanation: string;
  fixture?: string;
}
export function choice(prompt: string, options: string[], correct: number, hint: string, explanation: string, fixture?: string): Exercise {
  return {kind: 'choice', prompt, options, answer: [options[correct]], hint, explanation, fixture};
}
export function fill(prompt: string, answers: string[], hint: string, explanation: string, fixture?: string): Exercise {
  return {kind: 'input', prompt, options: [], answer: answers, hint, explanation, fixture};
}
export function order(prompt: string, options: string[], sequence: number[], hint: string, explanation: string): Exercise {
  return {kind: 'order', prompt, options, answer: sequence.map(i => options[i]), hint, explanation};
}
export type QA = [question: string, workedAnswer: string];
export interface Interview { Entry: QA; Intermediate: QA; Senior: QA; rubric: string[] }
export function interview(entry: QA, mid: QA, senior: QA, rubric: string[]): Interview {
  return {Entry: entry, Intermediate: mid, Senior: senior, rubric};
}
export interface Lesson {
  id: string; group: GroupId; term: string; title: string; minutes: number; stage: Stage;
  prerequisites: string[]; related: string[]; refs: SourceKey[]; aliases: string[];
  simple: string; technical: string; why: string; analogy: string; example: string;
  mistake: string; practice: string; tradeoff: string; security: string;
  code?: [language: string, snippet: string]; alternateCode?: [language: string, snippet: string];
  diagram?: 'internet' | 'dns' | 'http' | 'api';
  checks: [Exercise, Exercise, Exercise]; interview: Interview;
  editorial?: { status: 'expert-reviewed'; reviewer: string; reviewedOn: string; version: string };
}
export function isPublished(lesson: Lesson): boolean {
  const review = lesson.editorial;
  return !!review && review.status === 'expert-reviewed' && !!review.reviewer.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(review.reviewedOn) && review.version === curriculumVersion;
}
export interface Domain { id: GroupId; name: string; color: string; tint: string; icon: string; topics: string[] }
export const domains: Domain[] = [
  {id:'programming',name:'Programming',color:'#6043CA',tint:'#EDE8FF',icon:'code',topics:['Programming fundamentals','Programming languages','Computer science','Algorithms and data structures']},
  {id:'security',name:'Cybersecurity',color:'#087858',tint:'#DFF5EA',icon:'shield',topics:['Cybersecurity','Secure software development','Authentication and authorization','Technology governance and privacy']},
  {id:'ai',name:'Artificial Intelligence',color:'#A82F70',tint:'#FCE5F1',icon:'brain',topics:['Artificial intelligence','Machine learning','Deep learning','Generative AI','Large language models','AI agents and automation','Prompt engineering','AI-assisted software development','MLOps and AI evaluation']},
  {id:'network',name:'IT & Networking',color:'#275BBC',tint:'#E4EEFF',icon:'network',topics:['Networking and internet infrastructure','Web architecture','Enterprise IT infrastructure']},
  {id:'cloud',name:'Cloud & DevOps',color:'#007286',tint:'#DBF4F4',icon:'cloud',topics:['Cloud computing','Virtualization','Containers and orchestration','DevOps','Site reliability engineering','CI/CD','Distributed systems']},
  {id:'data',name:'Databases & Data',color:'#96600E',tint:'#FFF0CB',icon:'database',topics:['Databases and data modeling','Data analytics','Data science','Data engineering']},
  {id:'systems',name:'Computer Foundations',color:'#385D80',tint:'#E2EFF5',icon:'monitor',topics:['Computer literacy and hardware','Operating systems','Linux and terminal commands','IT support']},
  {id:'engineering',name:'Software Engineering',color:'#A04A29',tint:'#FCE7DD',icon:'branch',topics:['Software engineering','Software quality assurance','System design','Mobile application development']},
  {id:'backend',name:'Back-end & APIs',color:'#5540A8',tint:'#ECE7FC',icon:'server',topics:['Back-end development','APIs and integrations','Full-stack development']},
  {id:'design',name:'Design & Product',color:'#8A441D',tint:'#FBEAD8',icon:'layout',topics:['UI/UX design','Accessibility','Front-end development','Product management','Technical project management','Emerging technologies']},
];
export const groupFor = (id: GroupId) => domains.find(d => d.id === id)!;
