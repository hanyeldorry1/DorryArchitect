import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import MainLayout from "@/layouts/MainLayout";
import ProjectCard from "@/components/project/ProjectCard";
import { Project } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { t } = useTranslation();
  
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Format time difference for "updated" text
  const getUpdatedText = (updatedAt: Date | null) => {
    if (!updatedAt) return t('unknown');
    
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('today');
    } else if (diffDays === 1) {
      return t('yesterday');
    } else if (diffDays < 7) {
      return `${diffDays} ${t('daysAgo')}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? t('weekAgo') : t('weeksAgo')}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? t('monthAgo') : t('monthsAgo')}`;
    }
  };

  return (
    <MainLayout title={t('dashboard')}>
      {/* Recent Projects Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold font-cairo">{t('recentProjects')}</h3>
          <Link 
            href="/projects"
            className="text-primary text-sm flex items-center"
          >
              {t('viewAll')}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-3 border-b border-neutral-medium">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="p-3">
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))
          )}
          
          {error && (
            <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              <p>Error loading projects: {error.message}</p>
            </div>
          )}
          
          {!isLoading && projects && projects.length === 0 && (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-neutral-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h4 className="text-lg font-medium mb-2">{t('noProjectsYet')}</h4>
              <p className="text-neutral-gray mb-4">{t('createYourFirstProject')}</p>
            </div>
          )}
          
          {!isLoading && projects && projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              updatedText={getUpdatedText(project.updatedAt)}
            />
          ))}
        </div>
      </section>
      
      {/* Quick Start Guide */}
      <section className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 border-b border-neutral-medium">
          <h3 className="text-lg font-semibold font-cairo">{t('quickStartGuide')}</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-light/20 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">{t('createProject')}</h4>
              <p className="text-sm text-neutral-gray">{t('createProjectDesc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-light/20 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">{t('generateDesign')}</h4>
              <p className="text-sm text-neutral-gray">{t('generateDesignDesc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-light/20 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">{t('refineWithChat')}</h4>
              <p className="text-sm text-neutral-gray">{t('refineWithChatDesc')}</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features and Capabilities */}
      <section className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-neutral-medium">
          <h3 className="text-lg font-semibold font-cairo">{t('featuresCapabilities')}</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex">
              <div className="mr-4 bg-blue-100 p-2 rounded-md h-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">{t('environmentalAnalysis')}</h4>
                <p className="text-sm text-neutral-gray">{t('environmentalAnalysisDesc')}</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 bg-green-100 p-2 rounded-md h-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">{t('realTimeModifications')}</h4>
                <p className="text-sm text-neutral-gray">{t('realTimeModificationsDesc')}</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 bg-purple-100 p-2 rounded-md h-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">{t('culturalStyleIntegration')}</h4>
                <p className="text-sm text-neutral-gray">{t('culturalStyleIntegrationDesc')}</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 bg-orange-100 p-2 rounded-md h-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">{t('detailedBOQ')}</h4>
                <p className="text-sm text-neutral-gray">{t('detailedBOQDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
