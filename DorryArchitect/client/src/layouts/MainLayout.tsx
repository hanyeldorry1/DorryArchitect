import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import { useAuth } from "@/hooks/use-auth";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function MainLayout({ children, title = "Project Dashboard" }: MainLayoutProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return null; // If no user, don't render anything - ProtectedRoute will handle redirect
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-neutral-light">
        {/* Header */}
        <Header title={title} />
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="bg-white p-3 text-center text-sm text-neutral-gray border-t border-neutral-medium">
          <p>{t('copyright')}</p>
        </footer>
      </main>
    </div>
  );
}
