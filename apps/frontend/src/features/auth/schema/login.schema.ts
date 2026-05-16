import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
})

export type LoginSchema = z.infer<typeof loginSchema>
