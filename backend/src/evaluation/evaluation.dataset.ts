export interface EvaluationPrompt {
  id: string;
  category: 'product' | 'edge_case';
  subcategory: string;
  prompt: string;
}

export const PRODUCT_PROMPTS: EvaluationPrompt[] = [
  {
    id: 'crm',
    category: 'product',
    subcategory: 'CRM',
    prompt:
      'Build a CRM system for a sales team with lead management, contact tracking, deal pipeline, activity logging, and sales reporting dashboards.',
  },
  {
    id: 'erp',
    category: 'product',
    subcategory: 'ERP',
    prompt:
      'Design an ERP system for a manufacturing company with inventory management, procurement, production planning, accounting, and HR modules.',
  },
  {
    id: 'hospital',
    category: 'product',
    subcategory: 'Hospital',
    prompt:
      'Create a hospital management system with patient registration, appointment scheduling, doctor management, pharmacy inventory, and billing.',
  },
  {
    id: 'school',
    category: 'product',
    subcategory: 'School',
    prompt:
      'Build a school management system with student enrollment, class scheduling, grade management, attendance tracking, and parent communication.',
  },
  {
    id: 'inventory',
    category: 'product',
    subcategory: 'Inventory',
    prompt:
      'Design an inventory management system with warehouse tracking, stock alerts, supplier management, order processing, and barcode scanning.',
  },
  {
    id: 'marketplace',
    category: 'product',
    subcategory: 'Marketplace',
    prompt:
      'Create an online marketplace with vendor registration, product listings, shopping cart, payment processing, and order fulfillment.',
  },
  {
    id: 'hrms',
    category: 'product',
    subcategory: 'HRMS',
    prompt:
      'Build an HRMS with employee onboarding, leave management, payroll processing, performance reviews, and organizational hierarchy.',
  },
  {
    id: 'lms',
    category: 'product',
    subcategory: 'LMS',
    prompt:
      'Design a learning management system with course creation, student enrollment, video lectures, quizzes, and progress tracking.',
  },
  {
    id: 'finance',
    category: 'product',
    subcategory: 'Finance',
    prompt:
      'Create a personal finance app with expense tracking, budget planning, investment portfolio management, and financial goal setting.',
  },
  {
    id: 'helpdesk',
    category: 'product',
    subcategory: 'Helpdesk',
    prompt:
      'Build a helpdesk ticketing system with ticket creation, agent assignment, SLA tracking, knowledge base, and customer satisfaction surveys.',
  },
];

export const EDGE_CASE_PROMPTS: EvaluationPrompt[] = [
  {
    id: 'vague',
    category: 'edge_case',
    subcategory: 'Vague',
    prompt: 'Make me an app.',
  },
  {
    id: 'conflicting',
    category: 'edge_case',
    subcategory: 'Conflicting',
    prompt:
      'Build a system that requires no authentication but also has strict role-based access control with admin-only endpoints.',
  },
  {
    id: 'incomplete',
    category: 'edge_case',
    subcategory: 'Incomplete',
    prompt: 'I need a system for managing things.',
  },
  {
    id: 'impossible',
    category: 'edge_case',
    subcategory: 'Impossible',
    prompt:
      'Create an app that predicts stock prices with 100% accuracy and auto-trades without any user input or data storage.',
  },
  {
    id: 'vague_features',
    category: 'edge_case',
    subcategory: 'Vague',
    prompt: 'Build something cool for my startup.',
  },
  {
    id: 'conflicting_data',
    category: 'edge_case',
    subcategory: 'Conflicting',
    prompt:
      'Design a database with no tables but 50 API endpoints that all require persistent storage.',
  },
  {
    id: 'incomplete_users',
    category: 'edge_case',
    subcategory: 'Incomplete',
    prompt: 'App for users.',
  },
  {
    id: 'impossible_scale',
    category: 'edge_case',
    subcategory: 'Impossible',
    prompt:
      'Build a social network that handles 10 billion concurrent users on a single SQLite database with zero latency.',
  },
  {
    id: 'vague_ui',
    category: 'edge_case',
    subcategory: 'Vague',
    prompt: 'Nice looking app with good UX.',
  },
  {
    id: 'conflicting_ui_api',
    category: 'edge_case',
    subcategory: 'Conflicting',
    prompt:
      'Create a REST API with no endpoints but a full UI with 20 pages that all make API calls.',
  },
];

export const EVALUATION_DATASET: EvaluationPrompt[] = [
  ...PRODUCT_PROMPTS,
  ...EDGE_CASE_PROMPTS,
];
