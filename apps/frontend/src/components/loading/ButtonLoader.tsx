import { cn } from '@/lib/utils';
import Spinner from './Spinner';

type ButtonLoaderProps = {
    label?: string;
    className?: string;
};

export default function ButtonLoader({
    label = 'Đang xử lý...',
    className,
}: ButtonLoaderProps) {
    return (
        <span className={cn('inline-flex items-center gap-2', className)}>
            <Spinner size="sm" className="border-white/50 border-t-white" />
            <span>{label}</span>
        </span>
    );
}
