import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Bell, GlobeIcon } from "lucide-react";
import { createProject } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [landArea, setLandArea] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [culturalStyle, setCulturalStyle] = useState("");
  const [description, setDescription] = useState("");

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  const handleCreateProject = async () => {
    if (!projectName || !landArea) {
      toast({
        title: "Missing required fields",
        description: "Please fill in at least the project name and land area.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await createProject({
        name: projectName,
        type: projectType,
        landArea: parseFloat(landArea),
        budget: budget ? parseInt(budget) : undefined,
        location,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        culturalStyle,
        description,
        status: "concept"
      });

      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      toast({
        title: "Project created",
        description: `"${projectName}" has been created successfully.`,
      });
      
      // Reset form and close dialog
      setProjectName("");
      setProjectType("");
      setLandArea("");
      setBudget("");
      setLocation("");
      setLatitude("");
      setLongitude("");
      setCulturalStyle("");
      setDescription("");
      setNewProjectOpen(false);
    } catch (error) {
      toast({
        title: "Failed to create project",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-white p-4 shadow-md flex items-center justify-between">
      <div className="flex items-center md:ml-6">
        <h2 className="text-xl font-semibold text-neutral-dark hidden md:block">{title}</h2>
        <div className="md:hidden flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <path d="M9 21V9"></path>
          </svg>
          <h1 className="font-bold text-primary text-lg">{t('dorryArchitect')}</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center px-3 py-1 border border-secondary text-secondary rounded-md hover:bg-secondary hover:text-white transition-colors">
              <Plus className="h-4 w-4 mr-1" />
              <span>{t('newProject')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{t('createProject')}</DialogTitle>
              <DialogDescription>
                Enter the details for your new architectural project.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">{t('projectName')}*</Label>
                  <Input 
                    id="name" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Al Andalus Villa" 
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="type">{t('projectType')}</Label>
                  <Input 
                    id="type" 
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    placeholder="Residential, Commercial, etc." 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="landArea">{t('landArea')}* (m²)</Label>
                  <Input 
                    id="landArea" 
                    type="number" 
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    placeholder="750" 
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="budget">{t('projectBudget')} (EGP)</Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="5200000" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="location">{t('projectLocation')}</Label>
                  <Input 
                    id="location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="New Cairo" 
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="latitude">{t('latitude')}</Label>
                  <Input 
                    id="latitude" 
                    type="number" 
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="30.0444" 
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="longitude">{t('longitude')}</Label>
                  <Input 
                    id="longitude" 
                    type="number" 
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="31.2357" 
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="style">{t('culturalStyle')}</Label>
                <Input 
                  id="style" 
                  value={culturalStyle}
                  onChange={(e) => setCulturalStyle(e.target.value)}
                  placeholder="Islamic, Modern, Coastal, etc." 
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">{t('projectDescription')}</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your project" 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline" 
                onClick={() => setNewProjectOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : t('createProject')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-neutral-medium transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center space-x-1 rounded-md hover:bg-neutral-medium p-1">
              <GlobeIcon className="h-5 w-5" />
              <span className="text-sm hidden sm:inline">
                {i18n.language === 'ar' ? 'العربية' : 'English'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-0">
            <button
              className="w-full text-left px-4 py-2 hover:bg-neutral-light transition-colors"
              onClick={() => changeLanguage('en')}
            >
              English
            </button>
            <button
              className="w-full text-right px-4 py-2 hover:bg-neutral-light transition-colors"
              onClick={() => changeLanguage('ar')}
            >
              العربية
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
