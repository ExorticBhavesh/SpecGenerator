import { z } from 'zod';

const nonEmptyString = z.string().min(1);

export const authConfigSchema = z.object({
  roles: z.array(
    z.object({
      name: nonEmptyString,
      description: z.string().optional(),
    }),
  ),
  permissions: z.array(
    z.object({
      name: nonEmptyString,
      roles: z.array(nonEmptyString),
      resource: nonEmptyString,
      action: nonEmptyString,
    }),
  ),
});

export const businessRulesSchema = z.object({
  rules: z.array(
    z.object({
      name: nonEmptyString,
      entity: nonEmptyString,
      condition: nonEmptyString,
      action: nonEmptyString,
    }),
  ),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;
export type BusinessRules = z.infer<typeof businessRulesSchema>;
