import { z } from 'zod'

export const workflowStepSchema = z.object({
  name: z.string().min(1, 'Informe o nome da etapa').max(255),
  responsible_role_id: z.number().int().nullable().optional(),
  responsible_user_id: z.number().int().nullable().optional(),
})

export const workflowActionSchema = z.object({
  notes: z.string().max(1000).nullable().optional(),
})

export type WorkflowStepFormData = z.infer<typeof workflowStepSchema>
