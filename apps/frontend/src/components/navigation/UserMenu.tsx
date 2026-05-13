import Spinner from '@/components/loading/Spinner';

type UserMenuProps = {
    userName?: string;
    onLogout?: () => void;
    isLoggingOut?: boolean;
};

export default function UserMenu({
    userName,
    onLogout,
    isLoggingOut = false,
}: UserMenuProps) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className="text-right">
                <p className="font-semibold text-white">
                    {userName ?? 'User'}
                </p>
                <p className="text-xs text-slate-200">Signed in</p>
            </div>

            <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="rounded-md border border-white/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
                <span className="inline-flex items-center gap-2">
                    {isLoggingOut ? (
                        <Spinner
                            size="sm"
                            className="border-white/40 border-t-white"
                        />
                    ) : null}
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                </span>
            </button>
        </div>
    );
}
