import NavItem, { type NavItemConfig } from './NavItem';
import UserMenu from './UserMenu';

type NavBarProps = {
    items: NavItemConfig[];
    userName?: string;
    onLogout?: () => void;
    isLoggingOut?: boolean;
};

export default function NavBar({
    items,
    userName,
    onLogout,
    isLoggingOut,
}: NavBarProps) {
    return (
        <div className="border-b border-[#0b3e6a] bg-[#0f4c81]">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <nav className="flex flex-wrap items-center gap-2">
                    {items.map((item) => (
                        <NavItem key={item.label} item={item} />
                    ))}
                </nav>

                <UserMenu
                    userName={userName}
                    onLogout={onLogout}
                    isLoggingOut={isLoggingOut}
                />
            </div>
        </div>
    );
}
