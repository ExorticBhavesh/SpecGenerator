import { StageName } from '@prisma/client';

export interface PipelineContext {
  intent?: Record<string, unknown>;
  design?: Record<string, unknown>;
  database?: Record<string, unknown>;
  api?: Record<string, unknown>;
  ui?: Record<string, unknown>;
  auth?: Record<string, unknown>;
  businessRules?: Record<string, unknown>;
}

type StageOutputsInput =
  | Map<StageName, Record<string, unknown>>
  | Record<string, Record<string, unknown>>;

function getStageOutput(
  stageOutputs: StageOutputsInput,
  name: StageName,
): Record<string, unknown> | undefined {
  if (stageOutputs instanceof Map) {
    return stageOutputs.get(name);
  }
  return stageOutputs[name];
}

export function buildPipelineContext(
  stageOutputs: StageOutputsInput,
): PipelineContext {
  const intent = getStageOutput(stageOutputs, StageName.INTENT);
  const design = getStageOutput(stageOutputs, StageName.DESIGN);
  const database = getStageOutput(stageOutputs, StageName.DATABASE);
  const api = getStageOutput(stageOutputs, StageName.API);
  const ui = getStageOutput(stageOutputs, StageName.UI);

  return {
    intent,
    design,
    database,
    api,
    ui,
    auth: extractAuth(api, design),
    businessRules: extractBusinessRules(intent, design),
  };
}

function extractAuth(
  api?: Record<string, unknown>,
  design?: Record<string, unknown>,
): Record<string, unknown> {
  const roles: Array<{ name: string; description?: string }> = [];
  const permissions: Array<{
    name: string;
    roles: string[];
    resource: string;
    action: string;
  }> = [];

  if (api?.authentication) {
    const auth = api.authentication as Record<string, unknown>;
    if (auth.type && auth.type !== 'none') {
      roles.push({ name: 'admin', description: 'Administrator' });
      roles.push({ name: 'user', description: 'Standard user' });
      permissions.push({
        name: 'authenticated_access',
        roles: ['admin', 'user'],
        resource: '*',
        action: 'read',
      });
    }
  }

  const modules = (design?.modules as Array<Record<string, unknown>>) ?? [];
  for (const mod of modules) {
    const name = String(mod.name ?? '').toLowerCase();
    if (name.includes('auth') || name.includes('security')) {
      roles.push({
        name: String(mod.name),
        description: String(mod.responsibility ?? ''),
      });
    }
  }

  return { roles, permissions };
}

function extractBusinessRules(
  intent?: Record<string, unknown>,
  design?: Record<string, unknown>,
): Record<string, unknown> {
  const rules: Array<{
    name: string;
    entity: string;
    condition: string;
    action: string;
  }> = [];

  const features = (intent?.features as Array<Record<string, unknown>>) ?? [];
  for (const feature of features) {
    rules.push({
      name: String(feature.name),
      entity: String(feature.name).replace(/\s+/g, '_').toLowerCase(),
      condition: String(feature.description ?? ''),
      action: 'enforce',
    });
  }

  const modules = (design?.modules as Array<Record<string, unknown>>) ?? [];
  for (const mod of modules) {
    rules.push({
      name: String(mod.name),
      entity: String(mod.name),
      condition: String(mod.responsibility ?? ''),
      action: 'process',
    });
  }

  return { rules };
}
