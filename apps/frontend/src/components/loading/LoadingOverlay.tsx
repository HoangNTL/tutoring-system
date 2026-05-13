import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

type LoadingOverlayProps = {
    className?: string;
};

export default function LoadingOverlay({ className }: LoadingOverlayProps) {
    const activeRequests = useAppSelector(
        (state) => state.loading.activeRequests
    );

    if (activeRequests <= 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm',
                className
            )}
        >
            <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/90 px-5 py-3 text-sm font-medium text-slate-700 shadow-lg">
                <Spinner size="md" />
                <span>Đang xử lý yêu cầu...</span>
            </div>
        </div>
    );
}
