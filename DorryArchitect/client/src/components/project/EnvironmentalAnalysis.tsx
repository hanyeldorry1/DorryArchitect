import { WeatherData } from '@shared/schema';
import { useTranslation } from "react-i18next";
import { Wind, Sun } from 'lucide-react';

interface EnvironmentalAnalysisProps {
  environmentalData: WeatherData;
}

export default function EnvironmentalAnalysis({ environmentalData }: EnvironmentalAnalysisProps) {
  const { t } = useTranslation();
  
  // Calculate rotation for wind direction visualization
  const getWindDirectionDegrees = (direction: string) => {
    const directions: Record<string, number> = {
      'North': 0,
      'North-Northeast': 22.5,
      'Northeast': 45,
      'East-Northeast': 67.5,
      'East': 90,
      'East-Southeast': 112.5,
      'Southeast': 135,
      'South-Southeast': 157.5,
      'South': 180,
      'South-Southwest': 202.5,
      'Southwest': 225,
      'West-Southwest': 247.5,
      'West': 270,
      'West-Northwest': 292.5,
      'Northwest': 315,
      'North-Northwest': 337.5
    };
    
    return directions[direction] || 0;
  };
  
  // Format the timestamp
  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('updatedToday');
    } else if (diffDays === 1) {
      return t('updatedYesterday');
    } else {
      return t('updatedDaysAgo', { days: diffDays });
    }
  };

  return (
    <div>
      <h4 className="font-medium mb-3">{t('environmentalAnalysis')}</h4>
      
      {/* Wind Analysis */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{t('windDirection')}</span>
          <span className="text-xs text-neutral-gray">
            {environmentalData.timestamp ? formatTimestamp(environmentalData.timestamp) : t('updatedToday')}
          </span>
        </div>
        <div className="bg-neutral-light p-3 rounded-md">
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <Wind className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm">{environmentalData.windDirection}</span>
            </div>
            <span className="text-sm">{environmentalData.windSpeed} km/h</span>
          </div>
          <div className="h-24 bg-white rounded border border-neutral-medium p-2 flex justify-center items-center">
            {/* Wind rose diagram */}
            <div className="relative w-16 h-16 rounded-full border border-neutral-gray flex justify-center items-center">
              {/* Compass lines */}
              <div className="absolute w-1 h-16 bg-neutral-gray/20"></div>
              <div className="absolute w-16 h-1 bg-neutral-gray/20"></div>
              <div className="absolute w-1 h-16 bg-neutral-gray/20 rotate-45"></div>
              <div className="absolute w-1 h-16 bg-neutral-gray/20 -rotate-45"></div>
              
              {/* Wind direction indicator */}
              <div 
                className="absolute bg-blue-500 w-2 h-10 rounded-full" 
                style={{ 
                  transformOrigin: 'bottom center',
                  transform: `rotate(${getWindDirectionDegrees(environmentalData.windDirection)}deg) translateY(-4px)`
                }}
              ></div>
              
              {/* Direction labels */}
              <span className="absolute text-[8px] -top-4 left-1/2 transform -translate-x-1/2">N</span>
              <span className="absolute text-[8px] -bottom-4 left-1/2 transform -translate-x-1/2">S</span>
              <span className="absolute text-[8px] top-1/2 -right-4 transform -translate-y-1/2">E</span>
              <span className="absolute text-[8px] top-1/2 -left-4 transform -translate-y-1/2">W</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-gray">
            {t('wetAreasPositioning')}
          </div>
        </div>
      </div>
      
      {/* Light Analysis */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{t('solarIrradiance')}</span>
          <span className="text-xs text-neutral-gray">
            {environmentalData.timestamp ? formatTimestamp(environmentalData.timestamp) : t('updatedToday')}
          </span>
        </div>
        <div className="bg-neutral-light p-3 rounded-md">
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <Sun className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm">{t('southWestMax')}</span>
            </div>
            <span className="text-sm">{environmentalData.solarIrradiance} kWh/m²</span>
          </div>
          <div className="h-24 bg-gradient-to-r from-blue-100 via-yellow-100 to-orange-100 rounded border border-neutral-medium flex items-end p-1">
            <div className="h-1/3 w-1/6 bg-blue-200 mx-0.5"></div>
            <div className="h-1/2 w-1/6 bg-blue-300 mx-0.5"></div>
            <div className="h-2/3 w-1/6 bg-yellow-300 mx-0.5"></div>
            <div className="h-4/5 w-1/6 bg-yellow-400 mx-0.5"></div>
            <div className="h-full w-1/6 bg-orange-400 mx-0.5"></div>
            <div className="h-3/4 w-1/6 bg-orange-300 mx-0.5"></div>
          </div>
          <div className="mt-2 text-xs text-neutral-gray">
            {t('livingAreasOptimized')}
          </div>
        </div>
      </div>
      
      {/* Temperature and Humidity */}
      {(environmentalData.temperature !== undefined || environmentalData.humidity !== undefined) && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">{t('climate')}</span>
          </div>
          <div className="bg-neutral-light p-3 rounded-md">
            <div className="grid grid-cols-2 gap-2">
              {environmentalData.temperature !== undefined && (
                <div className="bg-white p-2 rounded border border-neutral-medium">
                  <div className="text-xs text-neutral-gray mb-1">{t('temperature')}</div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{environmentalData.temperature}°C</span>
                  </div>
                </div>
              )}
              
              {environmentalData.humidity !== undefined && (
                <div className="bg-white p-2 rounded border border-neutral-medium">
                  <div className="text-xs text-neutral-gray mb-1">{t('humidity')}</div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium">{environmentalData.humidity}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
