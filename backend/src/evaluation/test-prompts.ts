export const TEST_PROMPTS = {
  real: [
    {
      id: 'crm-basic',
      prompt: 'Build a CRM with login, contacts, dashboard, role-based access, analytics and premium subscription.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'ecommerce',
      prompt: 'Create an e-commerce platform with product catalog, shopping cart, user authentication, payment integration, and order management.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'blog',
      prompt: 'Build a blog platform with user registration, post creation, comments, categories, and admin dashboard.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'task-manager',
      prompt: 'Create a task management application with project boards, task assignments, due dates, file attachments, and team collaboration.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'inventory',
      prompt: 'Build an inventory management system with product tracking, stock alerts, supplier management, and reporting.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'social-media',
      prompt: 'Create a social media platform with user profiles, posts, likes, comments, followers, and direct messaging.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'booking',
      prompt: 'Build a booking system for appointments with calendar integration, reminders, customer management, and payment processing.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'forum',
      prompt: 'Create a discussion forum with topic categories, threads, replies, user reputation, and moderation tools.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'file-manager',
      prompt: 'Build a file management system with folder organization, file upload/download, sharing permissions, and version history.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'analytics',
      prompt: 'Create an analytics dashboard with data visualization, custom reports, real-time metrics, and export functionality.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
  ],
  edgeCases: [
    {
      id: 'minimal',
      prompt: 'Build a simple todo list.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'complex',
      prompt: 'Build a comprehensive enterprise resource planning (ERP) system with modules for finance, HR, supply chain, manufacturing, sales, CRM, project management, reporting, analytics, workflow automation, document management, compliance tracking, and multi-tenant architecture with role-based access control across all modules.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'ambiguous',
      prompt: 'Make something cool.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'technical',
      prompt: 'Build a microservices architecture with Kubernetes deployment, service mesh, API gateway, distributed tracing, circuit breakers, and event-driven communication using Kafka.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'security-focused',
      prompt: 'Create a banking application with multi-factor authentication, end-to-end encryption, audit logging, fraud detection, compliance with PCI-DSS, and secure key management.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'realtime',
      prompt: 'Build a real-time collaborative document editor with WebSocket connections, operational transformation, conflict resolution, presence indicators, and version history.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'mobile-first',
      prompt: 'Create a mobile-first fitness tracking app with GPS tracking, workout planning, nutrition logging, social features, and offline support.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'ai-integration',
      prompt: 'Build an AI-powered customer support chatbot with natural language processing, sentiment analysis, knowledge base integration, escalation workflows, and learning from interactions.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'iot-platform',
      prompt: 'Create an IoT platform with device management, data ingestion, real-time monitoring, alerting, firmware updates, and analytics dashboards.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
    {
      id: 'multi-language',
      prompt: 'Build a multi-language e-commerce platform with internationalization, currency conversion, localized payment methods, and region-specific content.',
      expectedStages: ['INTENT', 'DESIGN', 'DATABASE', 'API', 'UI'],
    },
  ],
};

export interface TestResult {
  promptId: string;
  prompt: string;
  success: boolean;
  error?: string;
  durationMs: number;
  stagesCompleted: string[];
  stagesFailed: string[];
  latencyPerStage: Record<string, number>;
}
