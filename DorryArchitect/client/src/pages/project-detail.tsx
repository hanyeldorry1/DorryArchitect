import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import MainLayout from "@/layouts/MainLayout";
import { getQueryFn } from "@/lib/queryClient";
import { Project, Design, BOQ, ChatMessage, WeatherData } from "@shared/schema";
import { generateDesign, getProjectBOQ, getLatestDesign, getChatHistory } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Download,
  Save,
  Edit,
  Share,
  MoreVertical,
  House,
  MapPin,
  DollarSign
} from "lucide-react";
import DesignCanvas from "@/components/project/DesignCanvas";
import EnvironmentalAnalysis from "@/components/project/EnvironmentalAnalysis";
import BOQSummary from "@/components/project/BOQSummary";
import ChatInterface from "@/components/chat/ChatInterface";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id);
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("design");
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);

  // Fetch project details
  const { 
    data: project, 
    isLoading: isLoadingProject, 
    error: projectError 
  } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Fetch latest design
  const {
    data: design,
    isLoading: isLoadingDesign,
    error: designError,
    refetch: refetchDesign
  } = useQuery<Design>({
    queryKey: [`/api/projects/${projectId}/designs/latest`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!projectId,
    retry: false
  });

  // Fetch BOQ
  const {
    data: boqData,
    isLoading: isLoadingBOQ,
    error: boqError,
    refetch: refetchBOQ
  } = useQuery<{ boq: BOQ; categorySummary: Record<string, number>; budgetWarning: any }>({
    queryKey: [`/api/projects/${projectId}/boq`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!projectId,
    retry: false
  });

  // Fetch chat history
  const {
    data: chatMessages,
    isLoading: isLoadingChat,
    error: chatError,
    refetch: refetchChat
  } = useQuery<ChatMessage[]>({
    queryKey: [`/api/projects/${projectId}/chat`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!projectId
  });

  // Generate initial design
  const handleGenerateDesign = async () => {
    if (!project || !project.landArea || !project.latitude || !project.longitude) {
      toast({
        title: t('missingProjectData'),
        description: t('missingProjectDataDesc'),
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingDesign(true);
    try {
      await generateDesign(projectId);
      // Refetch data after generation
      await Promise.all([
        refetchDesign(),
        refetchBOQ(),
        refetchChat()
      ]);
      toast({
        title: t('designGenerated'),
        description: t('designGeneratedDesc')
      });
    } catch (error) {
      toast({
        title: t('designGenerationFailed'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDesign(false);
    }
  };

  // Export to IFC
  const handleExportIFC = () => {
    toast({
      title: t('exportingIFC'),
      description: t('exportingIFCDesc')
    });
    // In a full implementation, this would trigger an API call to generate and download an IFC file
  };

  // Save design changes
  const handleSaveDesign = () => {
    toast({
      title: t('designSaved'),
      description: t('designSavedDesc')
    });
    // In a full implementation, this would save the current state of the design
  };

  return (
    <MainLayout title={project?.name || t('projectDetails')}>
      {isLoadingProject ? (
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      ) : projectError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-red-600 font-medium text-lg mb-2">{t('errorLoadingProject')}</h3>
          <p>{projectError.message}</p>
        </div>
      ) : project ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 border-b border-neutral-medium">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold font-cairo">{project.name}</h3>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" aria-label={t('edit')}>
                  <Edit className="h-5 w-5 text-neutral-gray" />
                </Button>
                <Button variant="ghost" size="icon" aria-label={t('share')}>
                  <Share className="h-5 w-5 text-neutral-gray" />
                </Button>
                <Button variant="ghost" size="icon" aria-label={t('more')}>
                  <MoreVertical className="h-5 w-5 text-neutral-gray" />
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.culturalStyle && (
                <Badge variant="outline" className="bg-blue-100 text-primary border-blue-200">
                  <House className="h-3.5 w-3.5 mr-1" />
                  {project.culturalStyle}
                </Badge>
              )}
              {project.location && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {project.location}
                </Badge>
              )}
              {project.budget && (
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  {t('budget')}: {new Intl.NumberFormat('en-EG', { style: 'decimal' }).format(project.budget)} EGP
                </Badge>
              )}
            </div>
          </div>
          
          {/* Project Details & Visualization */}
          <div className="flex flex-col md:flex-row">
            {/* Design Canvas */}
            <div className="flex-1 p-4 order-2 md:order-1">
              {!design && !isLoadingDesign ? (
                <div className="design-canvas bg-white border border-neutral-medium rounded-lg h-[400px] flex items-center justify-center">
                  <div className="text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-neutral-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h4 className="text-lg font-medium mb-2">{t('noDesignYet')}</h4>
                    <p className="text-neutral-gray mb-4">{t('generateDesignPrompt')}</p>
                    <Button 
                      onClick={handleGenerateDesign}
                      disabled={isGeneratingDesign}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isGeneratingDesign ? t('generatingDesign') : t('generateDesign')}
                    </Button>
                  </div>
                </div>
              ) : isLoadingDesign || isGeneratingDesign ? (
                <div className="design-canvas bg-white border border-neutral-medium rounded-lg h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>{isGeneratingDesign ? t('generatingDesign') : t('loadingDesign')}</p>
                  </div>
                </div>
              ) : design ? (
                <DesignCanvas 
                  design={design}
                  environmentalData={design.environmentalData as unknown as WeatherData} 
                />
              ) : null}
              
              <div className="flex justify-end mt-3 space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportIFC}
                  disabled={!design}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('exportIFC')}
                </Button>
                <Button 
                  onClick={handleSaveDesign}
                  disabled={!design}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {t('saveDesign')}
                </Button>
              </div>
            </div>
            
            {/* Project Analysis */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-neutral-medium p-4 order-1 md:order-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="design" className="flex-1">{t('design')}</TabsTrigger>
                  <TabsTrigger value="boq" className="flex-1">{t('boq')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="design">
                  {design?.environmentalData ? (
                    <EnvironmentalAnalysis 
                      environmentalData={design.environmentalData as unknown as WeatherData} 
                    />
                  ) : (
                    <div className="bg-neutral-light p-4 rounded-md text-center">
                      <p className="text-neutral-gray">{t('noEnvironmentalData')}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="boq">
                  {boqData?.boq ? (
                    <BOQSummary 
                      boq={boqData.boq} 
                      categorySummary={boqData.categorySummary} 
                      budgetWarning={boqData.budgetWarning}
                      budget={project.budget}
                    />
                  ) : isLoadingBOQ ? (
                    <div className="bg-neutral-light p-4 rounded-md">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-16 w-full mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="bg-neutral-light p-4 rounded-md text-center">
                      <p className="text-neutral-gray">{t('noBOQData')}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Design Chat Interface */}
      <ChatInterface 
        projectId={projectId}
        messages={chatMessages || []}
        isLoading={isLoadingChat}
        onMessageSent={() => {
          refetchChat();
          refetchDesign();
          refetchBOQ();
        }}
      />
    </MainLayout>
  );
}
