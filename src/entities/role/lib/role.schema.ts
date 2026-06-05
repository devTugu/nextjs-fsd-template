import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  permissionIds: z.array(z.number()),
});

export const updateRoleSchema = z.object({
  description: z.string().optional(),
  permissionIds: z.array(z.number()),
});

export const assignRoleSchema = z.object({
  userId: z.number().min(1),
  roleId: z.number().min(1),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;
export type AssignRoleFormValues = z.infer<typeof assignRoleSchema>;
