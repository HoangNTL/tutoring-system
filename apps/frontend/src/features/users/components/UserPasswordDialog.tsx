import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Spinner } from '@/shared/ui/spinner'
import type { UserListItem } from '@/features/users/types/user.types'

const userPasswordSchema = z
  .object({
    password: z.string().min(6, 'Mật khẩu phải có tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type UserPasswordFormValues = z.infer<typeof userPasswordSchema>

interface UserPasswordDialogProps {
  open: boolean
  user: UserListItem | null
  isSubmitting: boolean
  submitError?: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (password: string) => Promise<void>
}

export function UserPasswordDialog({
  open,
  user,
  isSubmitting,
  submitError,
  onOpenChange,
  onSubmit,
}: UserPasswordDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserPasswordFormValues>({
    resolver: zodResolver(userPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        password: '',
        confirmPassword: '',
      })
    }
  }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-xl">
        <form
          className="flex min-h-0 flex-col"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values.password)
          })}
        >
          <DialogHeader className="gap-1 border-b border-slate-200 px-6 pb-4 pt-6">
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
              Đổi mật khẩu
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              {user ? (
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  Tài khoản: <span className="font-semibold text-slate-900">{user.username}</span>
                </div>
              ) : null}

              {submitError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600"
                >
                  {submitError}
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label
                  htmlFor="user-new-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Mật khẩu mới
                </Label>
                <Input
                  id="user-new-password"
                  type="password"
                  placeholder="Nhập mật khẩu mới từ 6 ký tự"
                  disabled={isSubmitting}
                  className="h-11 rounded-xl border-slate-200 bg-white px-3 text-slate-900 shadow-none placeholder:text-slate-400"
                  {...register('password')}
                />
                {errors.password ? (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="user-confirm-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Xác nhận mật khẩu mới
                </Label>
                <Input
                  id="user-confirm-password"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={isSubmitting}
                  className="h-11 rounded-xl border-slate-200 bg-white px-3 text-slate-900 shadow-none placeholder:text-slate-400"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword ? (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                ) : null}
              </div>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 mt-auto shrink-0 justify-end rounded-none border-t border-slate-200 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="min-w-[100px] rounded-xl border-slate-200 bg-white px-4 shadow-none"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px] rounded-xl bg-[#0f4c81] px-5 text-white shadow-none hover:bg-[#0c3d68]"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
