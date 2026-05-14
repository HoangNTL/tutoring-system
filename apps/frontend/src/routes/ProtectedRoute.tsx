import { Navigate, useLocation } from 'react-router-dom';
import PageLoader from '@/components/loading/PageLoader';
import { useAppSelector } from '@/store/hooks';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isCheckingAuth, hasCheckedAuth } = useAppSelector(
        (state) => state.auth
    );
    const location = useLocation();

    if (isCheckingAuth || !hasCheckedAuth) {
        return <PageLoader label="Đang tải trang..." />;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
