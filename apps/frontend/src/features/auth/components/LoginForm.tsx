import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, User } from 'lucide-react'

import { useLoginMutation } from '@/features/auth/hooks/useLoginMutation'
import { loginSchema, type LoginSchema } from '@/features/auth/schema/login.schema'
import { getApiErrorMessage } from '@/shared/api/errors'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import ButtonLoader from '@/shared/ui/loading/button-loader'
import { useLocation, useNavigate } from 'react-router-dom'

export default function LoginForm() {
  const loginMutation = useLoginMutation()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (
      location.state as
        | {
            from?: {
              pathname?: string
              search?: string
              hash?: string
            }
          }
        | undefined
    )?.from ?? null

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginSchema) => {
    clearErrors('root')

    try {
      await loginMutation.mutateAsync(data)

      navigate(
        redirectTo
          ? `${redirectTo.pathname ?? ''}${redirectTo.search ?? ''}${redirectTo.hash ?? ''}`
          : '/',
        { replace: true }
      )
    } catch (error) {
      setError('root', {
        type: 'server',
        message: getApiErrorMessage(error, 'Đăng nhập thất bại. Vui lòng thử lại.'),
      })
    }
  }

  return (
    <Card className="w-full rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="space-y-1 px-6 pt-6 pb-0 text-left">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            Đăng nhập
          </CardTitle>

          <CardDescription className="text-sm text-slate-500">
            Sử dụng tài khoản do nhà trường cấp.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2.5">
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder="Nhập mã số sinh viên hoặc tài khoản"
                {...register('username')}
                disabled={loginMutation.isPending}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-4 pl-11 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#0f4c81] focus-visible:ring-[#0f4c81]/15"
              />
            </div>

            {errors.username ? (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            ) : null}
          </div>

          <div className="space-y-2.5">
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

              <Input
                type="password"
                placeholder="Nhập mật khẩu"
                {...register('password')}
                disabled={loginMutation.isPending}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-4 pl-11 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#0f4c81] focus-visible:ring-[#0f4c81]/15"
              />
            </div>

            {errors.password ? (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            ) : null}
          </div>

          {errors.root?.message ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.root.message}
            </div>
          ) : null}

          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#0f4c81] text-sm font-semibold text-white hover:bg-[#0c3f6a]"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ButtonLoader label="Đang đăng nhập..." />
            ) : (
              'Đăng nhập'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
