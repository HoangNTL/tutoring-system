import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/services';
import PageLoader from '@/components/loading/PageLoader';
import { useAppDispatch } from '@/store/hooks';
import { setUser, clearUser } from '@/features/auth/authSlice';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { data: user, isLoading, isError } = useCurrentUser();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            dispatch(setUser(user));
        }

        if (isError) {
            dispatch(clearUser());
        }
    }, [user, isError, dispatch]);

    if (isLoading) {
        return <PageLoader label="Đang tải trang..." />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}