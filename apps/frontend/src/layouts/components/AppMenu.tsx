import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import type { Role } from '@/features/auth/types'
import {
  getTopNavigationItemsForRole,
  type NavigationLinkItem,
  type TopNavigationItem,
} from '@/shared/config/navigation.config'
import { cn } from '@/shared/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/shared/ui/navigation-menu'

interface AppMenuProps {
  role?: Role | null
}

const topLevelLinkClassName = (isActive: boolean) =>
  cn(
    navigationMenuTriggerStyle(),
    'h-10 rounded-lg border border-transparent px-4 text-sm font-medium whitespace-nowrap transition-all duration-150',
    isActive
      ? 'border-slate-200 bg-slate-100 text-slate-950 shadow-sm after:absolute after:right-3 after:bottom-1.5 after:left-3 after:h-0.5 after:rounded-full after:bg-[#0f4c81]'
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
  )

const submenuLinkClassName = (isActive: boolean) =>
  cn(
    'flex min-w-[14rem] flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-all duration-150',
    isActive
      ? 'border-[#0f4c81]/20 bg-[#0f4c81]/8 text-slate-950 shadow-sm'
      : 'border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950'
  )

function NavigationLeafLink({
  item,
  className,
  descriptionClassName,
}: {
  item: NavigationLinkItem
  className: (isActive: boolean) => string
  descriptionClassName?: string
}) {
  return (
    <NavigationMenuLink asChild>
      <NavLink to={item.path} className={({ isActive }) => className(isActive)}>
        <span className="text-sm font-medium">{item.title}</span>
        {descriptionClassName ? (
          <span className={descriptionClassName}>{item.description}</span>
        ) : null}
      </NavLink>
    </NavigationMenuLink>
  )
}

function NavigationGroup({
  item,
  isActive,
}: {
  item: Extract<TopNavigationItem, { type: 'group' }>
  isActive: boolean
}) {
  return (
    <NavigationMenuItem>
        <NavigationMenuTrigger
          className={cn(
          'h-10 rounded-lg border border-transparent px-4 text-sm font-medium whitespace-nowrap transition-all duration-150',
          isActive
            ? 'border-slate-200 bg-slate-100 text-slate-950 shadow-sm'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
        )}
      >
        {item.title}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="w-[min(92vw,31rem)] p-3">
        <div className="mb-2 px-1">
          <p className="text-sm font-medium text-slate-900">{item.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {item.items.map((child) => (
            <NavigationLeafLink
              key={child.path}
              item={child}
              className={submenuLinkClassName}
              descriptionClassName="max-w-full truncate text-xs text-slate-500"
            />
          ))}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

export default function AppMenu({ role }: AppMenuProps) {
  const location = useLocation()
  const items = useMemo(() => getTopNavigationItemsForRole(role), [role])

  return (
    <div className="min-w-0 flex-1 overflow-visible pb-1 lg:pb-0">
      <NavigationMenu
        viewport={false}
        aria-label="Main navigation"
        className="w-full max-w-full justify-start"
      >
        <NavigationMenuList className="flex-wrap justify-start gap-1.5 lg:flex-nowrap">
          {items.map((item) =>
            item.type === 'link' ? (
              <NavigationMenuItem key={item.item.path}>
                <NavigationLeafLink
                  item={item.item}
                  className={topLevelLinkClassName}
                />
              </NavigationMenuItem>
            ) : (
              <NavigationGroup
                key={item.title}
                item={item}
                isActive={item.items.some(
                  (child) => child.path === location.pathname
                )}
              />
            )
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
