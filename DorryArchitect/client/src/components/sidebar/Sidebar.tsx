import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";

import {
  PanelsTopLeft,
  FolderOpen,
  AppWindow,
  Receipt,
  Wind,
  Ruler,
  Palette,
  User as UserIcon,
  Settings,
  LogOut
} from "lucide-react";

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { logoutMutation } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // Sidebar links configuration
  const mainLinks = [
    { path: "/", label: t('dashboard'), icon: <PanelsTopLeft className="h-5 w-5 mr-3" /> },
    { path: "/projects", label: t('projects'), icon: <FolderOpen className="h-5 w-5 mr-3" /> },
    { path: "/templates", label: t('templates'), icon: <AppWindow className="h-5 w-5 mr-3" /> },
    { path: "/boq-library", label: t('boqLibrary'), icon: <Receipt className="h-5 w-5 mr-3" /> },
  ];

  const toolsLinks = [
    { path: "/environmental", label: t('environmentalAnalysis'), icon: <Wind className="h-5 w-5 mr-3" /> },
    { path: "/neufert", label: t('neufertStandards'), icon: <Ruler className="h-5 w-5 mr-3" /> },
    { path: "/cultural", label: t('culturalElements'), icon: <Palette className="h-5 w-5 mr-3" /> },
  ];

  const settingsLinks = [
    { path: "/profile", label: t('profile'), icon: <UserIcon className="h-5 w-5 mr-3" /> },
    { path: "/settings", label: t('settings'), icon: <Settings className="h-5 w-5 mr-3" /> },
  ];

  // Mobile nav toggle
  const MobileToggle = () => (
    <div className="md:hidden absolute top-4 left-4 z-50">
      <button 
        className="p-2 rounded-md bg-white shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );

  // Sidebar link component
  const SidebarLink = ({ path, label, icon, isActive }: { path: string; label: string; icon: JSX.Element; isActive: boolean }) => (
    <Link 
      href={path}
      onClick={closeMobileMenu}
      className={`flex items-center px-4 py-2 ${
        isActive 
          ? "text-primary bg-blue-50 border-r-4 border-primary" 
          : "text-neutral-dark hover:bg-blue-50 hover:text-primary"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      <MobileToggle />
      
      <aside className={`${mobileOpen ? 'fixed inset-0 z-40' : 'hidden'} md:flex md:relative md:inset-auto md:z-auto flex-col w-64 bg-white shadow-md`}>
        <div className="p-4 border-b border-neutral-medium flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <path d="M9 21V9"></path>
          </svg>
          <h1 className="font-bold text-primary text-xl">{t('dorryArchitect')}</h1>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-2 text-sm text-neutral-gray font-medium uppercase">{t('main')}</div>
          {mainLinks.map(link => (
            <SidebarLink 
              key={link.path} 
              path={link.path} 
              label={link.label} 
              icon={link.icon}
              isActive={location === link.path}
            />
          ))}
          
          <div className="px-4 mt-6 mb-2 text-sm text-neutral-gray font-medium uppercase">{t('tools')}</div>
          {toolsLinks.map(link => (
            <SidebarLink 
              key={link.path} 
              path={link.path} 
              label={link.label} 
              icon={link.icon}
              isActive={location === link.path}
            />
          ))}
          
          <div className="px-4 mt-6 mb-2 text-sm text-neutral-gray font-medium uppercase">{t('settings')}</div>
          {settingsLinks.map(link => (
            <SidebarLink 
              key={link.path} 
              path={link.path} 
              label={link.label} 
              icon={link.icon}
              isActive={location === link.path}
            />
          ))}
        </nav>
        
        <div className="p-4 border-t border-neutral-medium">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
              {user.fullName ? user.fullName[0].toUpperCase() : user.username[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium">{user.fullName || user.username}</div>
              <div className="text-xs text-neutral-gray">{user.role}</div>
            </div>
            <button 
              className="ml-auto text-neutral-gray hover:text-primary"
              onClick={handleLogout}
              title={t('logout')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
