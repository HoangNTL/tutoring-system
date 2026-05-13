import { Navigate, useLocation } from 'react-router-dom';
import { useMeQuery } from '@/features/auth/services';
import PageLoader from '@/components/loading/PageLoader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading } = useMeQuery();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader label="Đang tải trang..." />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}