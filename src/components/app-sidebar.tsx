'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { navItems } from '@/config/nav';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-sidebar-border"
    >
      <SidebarHeader className="h-16 justify-center p-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-sidebar-primary" />
          <span className="font-headline text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Talkeasy
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              {item.external ? (
                 <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <SidebarMenuButton
                    isActive={false} // External links are never active
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </a>
              ) : (
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        {/* Placeholder for footer items like theme toggle */}
      </SidebarFooter>
    </Sidebar>
  );
}
