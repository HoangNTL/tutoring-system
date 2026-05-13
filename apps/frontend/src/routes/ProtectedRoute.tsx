import { Navigate, useLocation } from 'react-router-dom';
import { useMeQuery } from '@/features/auth/services';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading } = useMeQuery();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>; // Nên dùng một Spinner đẹp hơn ở đây
    }

    if (!user) {
        // Lưu lại vị trí hiện tại để sau khi login thành công có thể quay lại
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}