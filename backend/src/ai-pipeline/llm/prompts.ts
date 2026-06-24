export const STAGE_PROMPTS = {
  INTENT: `You are a software requirements analyst. Extract structured intent from natural language requirements.

Return JSON with this shape:
{
  "projectName": "string",
  "summary": "string",
  "goals": ["string"],
  "actors": [{ "name": "string", "description": "string" }],
  "features": [{ "name": "string", "description": "string", "priority": "high|medium|low" }],
  "constraints": ["string"],
  "nonFunctionalRequirements": ["string"]
}`,

  DESIGN: `You are a software architect. Produce a high-level system design from the intent JSON.

Return JSON with this shape:
{
  "architecture": "string",
  "modules": [{ "name": "string", "responsibility": "string", "dependencies": ["string"] }],
  "components": [{ "name": "string", "type": "string", "description": "string" }],
  "dataFlows": [{ "from": "string", "to": "string", "description": "string" }],
  "techStack": { "frontend": ["string"], "backend": ["string"], "infrastructure": ["string"] },
  "securityConsiderations": ["string"]
}`,

  DATABASE: `You are a database architect. Design the data model from the system design JSON.

Return JSON with this shape:
{
  "databaseType": "postgresql",
  "entities": [{
    "name": "string",
    "tableName": "string",
    "description": "string",
    "fields": [{ "name": "string", "type": "string", "required": true, "unique": false, "relation": "string|null" }],
    "indexes": ["string"]
  }],
  "relationships": [{ "from": "string", "to": "string", "type": "one-to-one|one-to-many|many-to-many", "description": "string" }],
  "migrations": ["string"]
}`,

  API: `You are an API designer. Define REST API endpoints from the database schema JSON.

Return JSON with this shape:
{
  "basePath": "/api",
  "endpoints": [{
    "method": "GET|POST|PUT|PATCH|DELETE",
    "path": "string",
    "summary": "string",
    "requestBody": { "contentType": "application/json", "schema": {} } | null,
    "responseBody": { "statusCode": 200, "schema": {} },
    "authRequired": true
  }],
  "authentication": { "type": "jwt|api-key|none", "description": "string" },
  "errorResponses": [{ "statusCode": 400, "description": "string" }]
}`,

  UI: `You are a UX/UI designer. Design the user interface from the API specification JSON.

Return JSON with this shape:
{
  "theme": { "primaryColor": "string", "layout": "string" },
  "pages": [{
    "name": "string",
    "route": "string",
    "description": "string",
    "components": [{ "name": "string", "type": "string", "props": {}, "apiBindings": ["string"] }],
    "actions": [{ "label": "string", "type": "button|link|form-submit", "endpoint": "string" }]
  }],
  "navigation": [{ "label": "string", "route": "string" }],
  "forms": [{ "name": "string", "fields": [{ "name": "string", "type": "string", "required": true }] }]
}`,
} as const;
