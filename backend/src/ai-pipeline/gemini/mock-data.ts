/**
 * Mock data generators for fallback when Gemini is unavailable
 */

export interface MockDataGenerator {
  generateIntent(): Record<string, unknown>;
  generateDesign(): Record<string, unknown>;
  generateDatabase(): Record<string, unknown>;
  generateApi(): Record<string, unknown>;
  generateUi(): Record<string, unknown>;
}

export class MockDataGeneratorService implements MockDataGenerator {
  generateIntent(): Record<string, unknown> {
    return {
      projectName: 'Generated Project',
      summary: 'Auto-generated project summary from fallback',
      goals: [
        'Provide user authentication',
        'Enable data management',
        'Support reporting and analytics',
      ],
      actors: [
        { name: 'Administrator', description: 'System administrator with full access' },
        { name: 'User', description: 'Regular user with limited access' },
        { name: 'Guest', description: 'Unauthenticated visitor' },
      ],
      features: [
        { name: 'User Management', description: 'Create and manage user accounts', priority: 'high' },
        { name: 'Dashboard', description: 'Main dashboard with statistics', priority: 'high' },
        { name: 'Reports', description: 'Generate and view reports', priority: 'medium' },
        { name: 'Settings', description: 'Application settings', priority: 'low' },
      ],
      constraints: [
        'Must support at least 1000 concurrent users',
        'Data must be encrypted at rest',
        'API response time under 200ms',
      ],
      nonFunctionalRequirements: [
        'System availability 99.9%',
        'Support for mobile devices',
        'Accessible design (WCAG 2.1)',
      ],
    };
  }

  generateDesign(): Record<string, unknown> {
    return {
      architecture: 'Monolithic with modular design',
      modules: [
        { name: 'Auth Module', responsibility: 'Authentication and authorization', dependencies: ['Database Module'] },
        { name: 'User Module', responsibility: 'User management', dependencies: ['Auth Module', 'Database Module'] },
        { name: 'Dashboard Module', responsibility: 'Dashboard and analytics', dependencies: ['User Module', 'Database Module'] },
        { name: 'Report Module', responsibility: 'Report generation', dependencies: ['Database Module'] },
      ],
      components: [
        { type: 'service', name: 'AuthService', description: 'Handles authentication logic' },
        { type: 'service', name: 'UserService', description: 'Manages user data' },
        { type: 'controller', name: 'DashboardController', description: 'API endpoints for dashboard' },
        { type: 'repository', name: 'UserRepository', description: 'Database access for users' },
      ],
      dataFlows: [
        { description: 'User login request', from: 'Client', to: 'AuthService' },
        { description: 'User data fetch', from: 'UserService', to: 'Database' },
        { description: 'Dashboard data', from: 'DashboardService', to: 'Client' },
      ],
      techStack: {
        backend: 'Node.js with NestJS',
        frontend: 'React with TypeScript',
        database: 'PostgreSQL',
        caching: 'Redis',
        messageQueue: 'RabbitMQ',
      },
      securityConsiderations: [
        'JWT token authentication',
        'Input validation and sanitization',
        'SQL injection prevention',
        'XSS protection',
        'CSRF tokens',
      ],
    };
  }

  generateDatabase(): Record<string, unknown> {
    return {
      databaseType: 'postgresql',
      entities: [
        {
          name: 'User',
          description: 'User account information',
          tableName: 'users',
          fields: [
            { type: 'uuid', name: 'id', required: true, unique: true, relation: null },
            { type: 'string', name: 'email', required: true, unique: true, relation: null },
            { type: 'string', name: 'password', required: true, unique: false, relation: null },
            { type: 'string', name: 'name', required: true, unique: false, relation: null },
            { type: 'timestamp', name: 'createdAt', required: true, unique: false, relation: null },
            { type: 'timestamp', name: 'updatedAt', required: true, unique: false, relation: null },
          ],
          indexes: ['idx_users_email', 'idx_users_name'],
        },
        {
          name: 'Role',
          description: 'User roles and permissions',
          tableName: 'roles',
          fields: [
            { type: 'uuid', name: 'id', required: true, unique: true, relation: null },
            { type: 'string', name: 'name', required: true, unique: true, relation: null },
            { type: 'json', name: 'permissions', required: false, unique: false, relation: null },
          ],
          indexes: ['idx_roles_name'],
        },
        {
          name: 'Session',
          description: 'User session data',
          tableName: 'sessions',
          fields: [
            { type: 'uuid', name: 'id', required: true, unique: true, relation: null },
            { type: 'uuid', name: 'userId', required: true, unique: false, relation: 'User' },
            { type: 'string', name: 'token', required: true, unique: true, relation: null },
            { type: 'timestamp', name: 'expiresAt', required: true, unique: false, relation: null },
          ],
          indexes: ['idx_sessions_token', 'idx_sessions_userId'],
        },
      ],
      relationships: [
        {
          from: 'User',
          to: 'Role',
          type: 'many-to-many',
          foreignKey: 'userId',
          throughTable: 'user_roles',
        },
        {
          from: 'Session',
          to: 'User',
          type: 'many-to-one',
          foreignKey: 'userId',
        },
      ],
      migrations: [
        'Create users table',
        'Create roles table',
        'Create sessions table',
        'Create user_roles junction table',
        'Add indexes',
      ],
    };
  }

  generateApi(): Record<string, unknown> {
    return {
      basePath: '/api/v1',
      endpoints: [
        {
          summary: 'User authentication',
          path: '/auth/login',
          method: 'POST',
          requestBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                password: { type: 'string' },
              },
              required: ['email', 'password'],
            },
          },
          responseBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { type: 'object' },
              },
            },
          },
          authRequired: false,
        },
        {
          summary: 'Get current user',
          path: '/users/me',
          method: 'GET',
          requestBody: null,
          responseBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
          authRequired: true,
        },
        {
          summary: 'Get dashboard data',
          path: '/dashboard',
          method: 'GET',
          requestBody: null,
          responseBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                stats: { type: 'object' },
                recentActivity: { type: 'array' },
              },
            },
          },
          authRequired: true,
        },
      ],
      authentication: {
        type: 'JWT',
        headerName: 'Authorization',
        tokenPrefix: 'Bearer',
        expiresIn: '24h',
      },
      errorResponses: [
        {
          statusCode: 401,
          message: 'Unauthorized - Invalid or missing token',
        },
        {
          statusCode: 403,
          message: 'Forbidden - Insufficient permissions',
        },
        {
          statusCode: 404,
          message: 'Not Found - Resource does not exist',
        },
        {
          statusCode: 500,
          message: 'Internal Server Error',
        },
      ],
    };
  }

  generateUi(): Record<string, unknown> {
    return {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        accentColor: '#f59e0b',
        layout: 'sidebar',
        darkMode: true,
      },
      pages: [
        {
          name: 'Dashboard',
          description: 'Main dashboard with statistics and recent activity',
          components: [
            {
              type: 'StatCard',
              name: 'UserCount',
              props: { title: 'Total Users', value: '0', icon: 'users' },
              apiBindings: ['/api/v1/users/count'],
            },
            {
              type: 'StatCard',
              name: 'ActiveSessions',
              props: { title: 'Active Sessions', value: '0', icon: 'activity' },
              apiBindings: ['/api/v1/sessions/active'],
            },
            {
              type: 'Chart',
              name: 'ActivityChart',
              props: { type: 'line', data: [] },
              apiBindings: ['/api/v1/analytics/activity'],
            },
          ],
          route: '/dashboard',
          actions: [
            { type: 'refresh', label: 'Refresh Data' },
            { type: 'export', label: 'Export Report' },
          ],
        },
        {
          name: 'Users',
          description: 'User management page',
          components: [
            {
              type: 'Table',
              name: 'UsersTable',
              props: { columns: ['name', 'email', 'role', 'status'], sortable: true },
              apiBindings: ['/api/v1/users'],
            },
            {
              type: 'Button',
              name: 'AddUser',
              props: { label: 'Add User', variant: 'primary' },
              apiBindings: [],
            },
          ],
          route: '/users',
          actions: [
            { type: 'create', label: 'Add User' },
            { type: 'filter', label: 'Filter' },
          ],
        },
        {
          name: 'Settings',
          description: 'Application settings',
          components: [
            {
              type: 'Form',
              name: 'SettingsForm',
              props: { fields: ['theme', 'language', 'notifications'] },
              apiBindings: ['/api/v1/settings'],
            },
          ],
          route: '/settings',
          actions: [
            { type: 'save', label: 'Save Settings' },
          ],
        },
      ],
      navigation: [
        { label: 'Dashboard', path: '/dashboard', icon: 'home' },
        { label: 'Users', path: '/users', icon: 'users' },
        { label: 'Reports', path: '/reports', icon: 'chart' },
        { label: 'Settings', path: '/settings', icon: 'settings' },
      ],
      forms: [
        {
          name: 'LoginForm',
          fields: [
            { name: 'email', type: 'email', required: true, label: 'Email' },
            { name: 'password', type: 'password', required: true, label: 'Password' },
          ],
        },
        {
          name: 'UserForm',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Name' },
            { name: 'email', type: 'email', required: true, label: 'Email' },
            { name: 'role', type: 'select', required: true, label: 'Role', options: ['admin', 'user'] },
          ],
        },
      ],
    };
  }
}
