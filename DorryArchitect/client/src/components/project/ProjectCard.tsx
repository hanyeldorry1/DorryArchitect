import { Link } from "wouter";
import { Project } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
  updatedText: string;
}

export default function ProjectCard({ project, updatedText }: ProjectCardProps) {
  const { t } = useTranslation();
  
  // Default thumbnail if not provided
  const defaultThumbnail = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600&h=320";
  
  // Status indicator color based on project status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concept':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-green-500';
      case 'review':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-purple-500';
      default:
        return 'bg-neutral-gray';
    }
  };
  
  // Translate status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concept':
        return t('concept');
      case 'in_progress':
        return t('inProgress');
      case 'review':
        return t('review');
      case 'completed':
        return t('completed');
      default:
        return status;
    }
  };

  return (
    <Link 
      href={`/projects/${project.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group block"
    >
      <div className="relative h-40 bg-neutral-medium overflow-hidden">
        <img 
          src={project.thumbnailUrl || defaultThumbnail} 
          alt={project.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h4 className="text-white font-medium">{project.name}</h4>
          <p className="text-white/80 text-sm">{project.type || t('project')}</p>
        </div>
      </div>
      <div className="p-3 border-b border-neutral-medium">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-gray">{t('landArea')}:</span>
          <span>{project.landArea ? `${project.landArea} m²` : '-'}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-neutral-gray">{t('updated')}:</span>
          <span>{updatedText}</span>
        </div>
      </div>
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className={`inline-block w-2 h-2 ${getStatusColor(project.status || 'concept')} rounded-full mr-1`}></span>
          <span className="text-sm">{getStatusLabel(project.status || 'concept')}</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4 text-neutral-gray" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => e.preventDefault()}>
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.preventDefault()}>
              {t('share')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => e.preventDefault()}
              className="text-red-500 focus:text-red-500"
            >
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}