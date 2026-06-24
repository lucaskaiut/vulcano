import { z } from 'zod'

export const userCreateSchema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  role_ids: z.array(z.number()),
})

export const userEditSchema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, {
      message: 'A senha deve ter no mínimo 8 caracteres.',
    }),
  role_ids: z.array(z.number()),
})

export type UserCreateFormValues = z.infer<typeof userCreateSchema>
export type UserEditFormValues = z.infer<typeof userEditSchema>

export const roleSchema = z.object({
  name: z.string().min(1, 'Informe o nome do perfil.'),
  description: z.string().optional(),
  permission_ids: z.array(z.number()),
})

export type RoleFormValues = z.infer<typeof roleSchema>
