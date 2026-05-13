import type { PropsWithChildren } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NavBar from '@/components/navigation/NavBar';
import type { NavItemConfig } from '@/components/navigation/NavItem';
import { logoutApi } from '@/api/auth.api';
import axiosInstance from '@/api/axiosInstance';
import { clearUser } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

type MainLayoutProps = PropsWithChildren<{
    showFooter?: boolean;
}>;

export default function MainLayout({
    children,
    showFooter = true,
}: MainLayoutProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userName = useAppSelector((state) => state.auth.user?.username);
    const navItems: NavItemConfig[] = [
        { label: 'Dashboard', path: '/' },
        {
            label: 'Management',
            children: [
                { label: 'Users', path: '/users' },
                { label: 'Roles', path: '/roles' },
            ],
        },
        { label: 'Reports', path: '/reports' },
    ];

    const logoutMutation = useMutation({
        mutationFn: logoutApi,
    });

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('token');
            delete axiosInstance.defaults.headers.common.Authorization;
            queryClient.clear();
            dispatch(clearUser());
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <NavBar
                items={navItems}
                userName={userName}
                onLogout={handleLogout}
                isLoggingOut={logoutMutation.isPending}
            />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
            {showFooter ? <Footer /> : null}
        </div>
    );
}
