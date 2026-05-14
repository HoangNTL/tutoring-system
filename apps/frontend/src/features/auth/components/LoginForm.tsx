import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Lock, ShieldCheck, User } from 'lucide-react';

import { useLoginMutation } from '../services';
import { storeAuthUser } from '../storage';
import { setUser } from '../authSlice';
import { useAppDispatch } from '@/store/hooks';

import { loginSchema, type LoginSchema } from '../schema/login.schema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BaseResponse } from '@/types/common';
import ButtonLoader from '@/components/loading/ButtonLoader';

const getLoginErrorMessage = (error: unknown) => {
    if (isAxiosError<BaseResponse<never>>(error)) {
        const responseData = error.response?.data;
        const validationErrors = responseData?.errors;

        if (
            validationErrors &&
            typeof validationErrors === 'object' &&
            !Array.isArray(validationErrors)
        ) {
            const firstError = Object.values(validationErrors)
                .flatMap((value) =>
                    Array.isArray(value) ? value : [String(value)]
                )
                .find(Boolean);

            if (firstError) {
                return firstError;
            }
        }

        if (responseData?.message) {
            return responseData.message;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Đăng nhập thất bại. Vui lòng thử lại.';
};

export default function LoginForm() {
    const dispatch = useAppDispatch();
    const loginMutation = useLoginMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const redirectTo =
        (
            location.state as
            | {
                from?: {
                    pathname?: string;
                    search?: string;
                    hash?: string;
                };
            }
            | undefined
        )?.from ?? null;

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
    });

    const onSubmit = async (data: LoginSchema) => {
        clearErrors('root');
        setIsSubmitting(true);

        try {
            const response = await loginMutation.mutateAsync(data);

            storeAuthUser(response.data.user);
            dispatch(setUser(response.data.user));

            navigate(
                redirectTo
                    ? `${redirectTo.pathname ?? ''}${redirectTo.search ?? ''}${redirectTo.hash ?? ''}`
                    : '/',
                { replace: true }
            );
        } catch (error) {
            setError('root', {
                type: 'server',
                message: getLoginErrorMessage(error),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md gap-6 border-none bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-4 px-0 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-[#0f4c81] shadow-inner">
                    <ShieldCheck className="size-8" />
                </div>

                <div className="space-y-2">
                    <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900">
                        Đăng nhập
                    </CardTitle>

                    <CardDescription className="text-sm leading-6 text-slate-500">
                        Nhập tài khoản được cấp để truy cập hệ thống đăng ký học phụ đạo.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="px-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2.5">
                        {/* <Label className="text-sm font-medium text-slate-700">
                            Username
                        </Label> */}

                        <div className="relative">
                            <User className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

                            <Input
                                placeholder="Nhập mã số sinh viên hoặc tài khoản"
                                {...register('username')}
                                disabled={isSubmitting}
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pr-4 pl-11 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#0f4c81] focus-visible:ring-[#0f4c81]/15"
                            />
                        </div>

                        {errors.username && (
                            <p className="text-sm text-red-500">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2.5">
                        {/* <Label className="text-sm font-medium text-slate-700">
                            Password
                        </Label> */}

                        <div className="relative">
                            <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

                            <Input
                                type="password"
                                placeholder="Nhập mật khẩu"
                                {...register('password')}
                                disabled={isSubmitting}
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pr-4 pl-11 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#0f4c81] focus-visible:ring-[#0f4c81]/15"
                            />
                        </div>

                        {errors.password && (
                            <p className="text-sm text-red-500">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {errors.root?.message && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {errors.root.message}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="h-12 w-full rounded-2xl bg-[#0f4c81] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,76,129,0.25)] hover:bg-[#0c3f6a]"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ButtonLoader label="Đang đăng nhập..." />
                        ) : (
                            'Đăng nhập'
                        )}
                    </Button>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                        <p className="font-medium text-slate-700">Lưu ý</p>
                        <p className="mt-1">
                            Sử dụng tài khoản do nhà trường cấp. Nếu không thể đăng nhập, vui lòng liên hệ bộ phận phụ trách để xác minh thông tin tài khoản.
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
