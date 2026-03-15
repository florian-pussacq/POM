'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Wallet,
  BarChart3,
  HelpCircle,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'manager', 'collaborateur'] },
  { href: '/projects', label: 'Projets', icon: FolderKanban, roles: ['admin', 'manager', 'collaborateur'] },
  { href: '/collaborators', label: 'Collaborateurs', icon: Users, roles: ['admin', 'manager'] },
  { href: '/budgets', label: 'Budgets', icon: Wallet, roles: ['admin'] },
  { href: '/statistics', label: 'Statistiques', icon: BarChart3, roles: ['admin', 'manager', 'collaborateur'] },
  { href: '/help', label: 'Aide', icon: HelpCircle, roles: ['admin', 'manager', 'collaborateur'] },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = session?.user?.role as string || 'collaborateur';
  const userName = session?.user?.prenom as string || 'Utilisateur';

  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-4 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-green-700">POM</h1>
        <p className="text-xs text-gray-500 mt-1">Plan, Organize & Manage</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 px-2 py-4 space-y-1">
        <Link
          href="/account"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === '/account'
              ? 'bg-green-50 text-green-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <User className="h-5 w-5" />
          {userName}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-lg p-2 shadow-md"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
