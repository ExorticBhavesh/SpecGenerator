import { z } from 'zod';

const nonEmptyString = z.string().min(1);
const unknownRecord = z.record(z.unknown());

export const intentSchema = z.object({
  projectName: nonEmptyString,
  summary: nonEmptyString,
  goals: z.array(nonEmptyString),
  actors: z.array(
    z.object({
      name: nonEmptyString,
      description: nonEmptyString,
    }),
  ),
  features: z.array(
    z.object({
      name: nonEmptyString,
      description: nonEmptyString,
      priority: z.enum(['high', 'medium', 'low']),
    }),
  ),
  constraints: z.array(nonEmptyString),
  nonFunctionalRequirements: z.array(nonEmptyString),
});

export const designSchema = z.object({
  architecture: nonEmptyString,
  modules: z.array(
    z.object({
      name: nonEmptyString,
      responsibility: nonEmptyString,
      dependencies: z.array(nonEmptyString),
    }),
  ),
  components: z.array(
    z.object({
      name: nonEmptyString,
      type: nonEmptyString,
      description: nonEmptyString,
    }),
  ),
  dataFlows: z.array(
    z.object({
      from: nonEmptyString,
      to: nonEmptyString,
      description: nonEmptyString,
    }),
  ),
  techStack: z.object({
    frontend: z.array(nonEmptyString),
    backend: z.array(nonEmptyString),
    infrastructure: z.array(nonEmptyString),
  }),
  securityConsiderations: z.array(nonEmptyString),
});

export const databaseSchema = z.object({
  databaseType: nonEmptyString,
  entities: z.array(
    z.object({
      name: nonEmptyString,
      tableName: nonEmptyString,
      description: nonEmptyString,
      fields: z.array(
        z.object({
          name: nonEmptyString,
          type: nonEmptyString,
          required: z.boolean(),
          unique: z.boolean(),
          relation: z.string().nullable(),
        }),
      ),
      indexes: z.array(nonEmptyString),
    }),
  ),
  relationships: z.array(
    z.object({
      from: nonEmptyString,
      to: nonEmptyString,
      type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
      description: nonEmptyString,
    }),
  ),
  migrations: z.array(nonEmptyString),
});

export const apiSchema = z.object({
  basePath: nonEmptyString,
  endpoints: z.array(
    z.object({
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      path: nonEmptyString,
      summary: nonEmptyString,
      requestBody: z
        .object({
          contentType: nonEmptyString,
          schema: unknownRecord,
        })
        .nullable(),
      responseBody: z.object({
        statusCode: z.number().int(),
        schema: unknownRecord,
      }),
      authRequired: z.boolean(),
    }),
  ),
  authentication: z.object({
    type: z.enum(['jwt', 'api-key', 'none']),
    description: nonEmptyString,
  }),
  errorResponses: z.array(
    z.object({
      statusCode: z.number().int(),
      description: nonEmptyString,
    }),
  ),
});

export const uiSchema = z.object({
  theme: z.object({
    primaryColor: nonEmptyString,
    layout: nonEmptyString,
  }),
  pages: z.array(
    z.object({
      name: nonEmptyString,
      route: nonEmptyString,
      description: nonEmptyString,
      components: z.array(
        z.object({
          name: nonEmptyString,
          type: nonEmptyString,
          props: unknownRecord,
          apiBindings: z.array(nonEmptyString),
        }),
      ),
      actions: z.array(
        z.object({
          label: nonEmptyString,
          type: z.enum(['button', 'link', 'form-submit']),
          endpoint: nonEmptyString,
        }),
      ),
    }),
  ),
  navigation: z.array(
    z.object({
      label: nonEmptyString,
      route: nonEmptyString,
    }),
  ),
  forms: z.array(
    z.object({
      name: nonEmptyString,
      fields: z.array(
        z.object({
          name: nonEmptyString,
          type: nonEmptyString,
          required: z.boolean(),
        }),
      ),
    }),
  ),
});

export type IntentOutput = z.infer<typeof intentSchema>;
export type DesignOutput = z.infer<typeof designSchema>;
export type DatabaseOutput = z.infer<typeof databaseSchema>;
export type ApiOutput = z.infer<typeof apiSchema>;
export type UiOutput = z.infer<typeof uiSchema>;
