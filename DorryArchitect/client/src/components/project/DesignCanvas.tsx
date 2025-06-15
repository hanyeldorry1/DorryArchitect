import { useRef, useEffect, useState } from 'react';
import { Design, WeatherData, Room } from '@shared/schema';
import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface DesignCanvasProps {
  design: Design;
  environmentalData: WeatherData;
}

export default function DesignCanvas({ design, environmentalData }: DesignCanvasProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const designData = design.designData as any;
  const rooms = designData.rooms || [];

  // Zoom functionality
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleFitToScreen = () => {
    setScale(1);
  };

  // Helper function to get room color based on type
  const getRoomColor = (roomType: string) => {
    switch (roomType) {
      case 'living_room':
        return { bg: 'bg-blue-100', border: 'border-primary', text: 'text-primary' };
      case 'kitchen':
        return { bg: 'bg-green-100', border: 'border-green-600', text: 'text-green-600' };
      case 'bathroom':
        return { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-500' };
      case 'bedroom':
        return { bg: 'bg-purple-100', border: 'border-purple-600', text: 'text-purple-600' };
      default:
        return { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-700' };
    }
  };

  // Calculate wind direction arrow rotation
  const getWindDirectionRotation = (direction: string) => {
    const directions: Record<string, number> = {
      'North': 0,
      'North-East': 45,
      'East': 90,
      'South-East': 135,
      'South': 180,
      'South-West': 225,
      'West': 270,
      'North-West': 315
    };
    
    // Default to North if direction is not found
    return directions[direction] || 0;
  };

  return (
    <div className="design-canvas bg-white border border-neutral-medium rounded-lg h-[400px] overflow-hidden relative">
      {/* Canvas with grid background */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 p-2 bg-white"
        style={{
          backgroundSize: '20px 20px',
          backgroundImage: 'linear-gradient(to right, #f1f1f1 1px, transparent 1px), linear-gradient(to bottom, #f1f1f1 1px, transparent 1px)',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Render rooms */}
        {rooms.map((room: Room) => {
          const { bg, border, text } = getRoomColor(room.type);
          return (
            <div 
              key={room.id}
              className={`absolute ${bg} ${border} border rounded-sm`}
              style={{
                top: `${room.position.y}px`,
                left: `${room.position.x}px`,
                width: `${room.width}px`,
                height: `${room.height}px`,
                transform: room.rotation ? `rotate(${room.rotation}deg)` : 'none',
                transformOrigin: 'center'
              }}
            >
              {/* Room label */}
              <div 
                className={`absolute ${text} text-xs font-medium`}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {room.name}
              </div>
            </div>
          );
        })}

        {/* Wind direction indicator */}
        {environmentalData && (
          <div className="absolute top-4 right-4 flex items-center bg-white/80 px-2 py-1 rounded-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1 text-blue-500"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                transform: `rotate(${getWindDirectionRotation(environmentalData.windDirection)}deg)`
              }}
            >
              <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
              <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
              <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
            </svg>
            <span className="text-xs text-neutral-dark">
              {t('windDirection')}: {environmentalData.windDirection}
            </span>
          </div>
        )}
      </div>
      
      {/* Design Controls */}
      <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md flex p-1">
        <Button variant="ghost" size="icon" onClick={handleZoomIn} title={t('zoomIn')}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleZoomOut} title={t('zoomOut')}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleFitToScreen} title={t('fitToScreen')}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
