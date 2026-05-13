import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export type NavItemConfig = {
    label: string;
    path?: string;
    children?: NavItemConfig[];
};

type NavItemProps = {
    item: NavItemConfig;
};

export default function NavItem({ item }: NavItemProps) {
    const [open, setOpen] = useState(false);
    const hasChildren = Boolean(item.children?.length);

    if (!hasChildren && item.path) {
        return (
            <NavLink
                to={item.path}
                className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition ${isActive
                        ? 'bg-white/15 text-white'
                        : 'text-slate-100 hover:bg-white/10'
                    }`
                }
            >
                {item.label}
            </NavLink>
        );
    }

    return (
        <div
            className="group relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                aria-expanded={open}
            >
                {item.label}
            </button>

            <div
                className={`absolute left-0 top-full mt-2 min-w-[180px] rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur transition ${open ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-1'} group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto`}
            >
                {item.children?.map((child) => (
                    <NavLink
                        key={`${item.label}-${child.label}`}
                        to={child.path ?? '#'}
                        className={({ isActive }) =>
                            `block rounded-lg px-3 py-2 text-sm transition ${isActive
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`
                        }
                    >
                        {child.label}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}
