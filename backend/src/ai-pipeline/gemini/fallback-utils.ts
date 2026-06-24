/**
 * Helper utilities for fallback values and safe defaults
 */

/**
 * Recursively replaces empty strings, undefined, and null values with safe defaults
 */
export function applyFallbacks<T extends Record<string, unknown>>(
  data: T,
  schemaName: string,
): T {
  const result = { ...data };

  function processValue(value: unknown, key: string, path: string): unknown {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return getDefaultValue(key, path, schemaName);
    }

    // Handle empty strings
    if (typeof value === 'string' && value.trim() === '') {
      return getDefaultValue(key, path, schemaName, 'string');
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item, index) => 
        processValue(item, `${key}[${index}]`, `${path}.${key}[${index}]`)
      );
    }

    // Handle objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      const processed: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        processed[k] = processValue(v, k, `${path}.${key}`);
      }
      return processed;
    }

    return value;
  }

  for (const [key, value] of Object.entries(result)) {
    (result as Record<string, unknown>)[key] = processValue(value, key, key);
  }

  return result;
}

/**
 * Get a safe default value based on key name and context
 */
function getDefaultValue(
  key: string,
  path: string,
  schemaName: string,
  type: string = 'unknown',
): unknown {
  // Specific field defaults
  if (key === 'projectName' || key === 'name') {
    return 'Generated Project';
  }
  if (key === 'summary' || key === 'description') {
    return 'Auto-generated project summary';
  }
  if (key === 'title') {
    return 'Untitled';
  }
  if (key === 'type') {
    return 'string';
  }
  if (key === 'required') {
    return false;
  }
  if (key === 'unique') {
    return false;
  }
  if (key === 'priority') {
    return 'medium';
  }
  if (key === 'status') {
    return 'pending';
  }
  if (key === 'method') {
    return 'GET';
  }
  if (key === 'contentType') {
    return 'application/json';
  }
  if (key === 'authRequired') {
    return false;
  }
  if (key === 'layout') {
    return 'default';
  }
  if (key === 'primaryColor') {
    return '#3b82f6';
  }

  // Type-based defaults
  if (type === 'string') {
    return 'default';
  }
  if (type === 'number') {
    return 0;
  }
  if (type === 'boolean') {
    return false;
  }
  if (type === 'array') {
    return [];
  }
  if (type === 'object') {
    return {};
  }

  // Context-aware defaults based on schema
  if (schemaName === 'intent') {
    if (key === 'goals') return ['Default goal'];
    if (key === 'actors') return [{ name: 'User', description: 'Default user' }];
    if (key === 'features') return [{ name: 'Default feature', description: 'Basic feature', priority: 'medium' }];
    if (key === 'constraints') return [];
    if (key === 'nonFunctionalRequirements') return [];
  }

  if (schemaName === 'design') {
    if (key === 'architecture') return 'Monolithic';
    if (key === 'modules') return [];
    if (key === 'components') return [];
    if (key === 'dataFlows') return [];
    if (key === 'techStack') return { backend: 'Node.js', frontend: 'React', database: 'PostgreSQL' };
    if (key === 'securityConsiderations') return [];
  }

  if (schemaName === 'database') {
    if (key === 'databaseType') return 'postgresql';
    if (key === 'entities') return [];
    if (key === 'relationships') return [];
    if (key === 'migrations') return [];
  }

  if (schemaName === 'api') {
    if (key === 'basePath') return '/api';
    if (key === 'endpoints') return [];
    if (key === 'authentication') return { type: 'none' };
    if (key === 'errorResponses') return [];
  }

  if (schemaName === 'ui') {
    if (key === 'theme') return { primaryColor: '#3b82f6', layout: 'default' };
    if (key === 'pages') return [];
    if (key === 'navigation') return [];
    if (key === 'forms') return [];
  }

  // Generic fallback
  return 'default';
}

/**
 * Apply specific field defaults before validation
 */
export function applyPreValidationDefaults(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };

  // projectName defaults
  if (!result.projectName || (typeof result.projectName === 'string' && result.projectName.trim() === '')) {
    result.projectName = 'Generated Project';
  }

  // summary defaults
  if (!result.summary || (typeof result.summary === 'string' && result.summary.trim() === '')) {
    result.summary = 'Auto-generated project summary';
  }

  // name defaults (for other schemas)
  if (!result.name || (typeof result.name === 'string' && result.name.trim() === '')) {
    result.name = 'Generated Project';
  }

  // description defaults
  if (!result.description || (typeof result.description === 'string' && result.description.trim() === '')) {
    result.description = 'Auto-generated description';
  }

  return result;
}

/**
 * Logger for detailed Gemini service logging
 */
export class GeminiLogger {
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    this.logLevel = level;
  }

  static debug(message: string, data?: unknown) {
    if (this.logLevel === 'debug') {
      console.log(`[Gemini DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static info(message: string, data?: unknown) {
    if (this.logLevel === 'debug' || this.logLevel === 'info') {
      console.log(`[Gemini INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static warn(message: string, data?: unknown) {
    console.warn(`[Gemini WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static error(message: string, data?: unknown) {
    console.error(`[Gemini ERROR] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}
