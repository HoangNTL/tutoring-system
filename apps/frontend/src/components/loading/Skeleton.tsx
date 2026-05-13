import { cn } from '@/lib/utils';

type SkeletonProps = {
    className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-slate-200/80', className)}
        />
    );
}
