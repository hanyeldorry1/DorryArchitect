import { BOQ, BOQItem } from '@shared/schema';
import { useTranslation } from "react-i18next";
import { AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface BOQSummaryProps {
  boq: BOQ;
  categorySummary: Record<string, number>;
  budgetWarning: { message: string; difference: number } | null;
  budget?: number;
}

export default function BOQSummary({ boq, categorySummary, budgetWarning, budget }: BOQSummaryProps) {
  const { t } = useTranslation();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate budget usage percentage
  const getBudgetPercentage = () => {
    if (!budget || budget <= 0) return 100;
    const percentage = (boq.totalCost / budget) * 100;
    return Math.min(percentage, 100); // Cap at 100% for the progress bar
  };
  
  // Get color for budget status
  const getBudgetStatusColor = () => {
    if (!budget) return 'text-neutral-gray';
    if (boq.totalCost > budget) return 'text-red-600';
    if (boq.totalCost > budget * 0.9) return 'text-orange-600';
    return 'text-green-600';
  };
  
  // Get progress bar color
  const getProgressColor = () => {
    if (!budget) return 'bg-blue-500';
    if (boq.totalCost > budget) return 'bg-red-500';
    if (boq.totalCost > budget * 0.9) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{t('boqSummary')}</span>
        <a href="#" className="text-primary text-xs hover:underline">{t('viewFullBOQ')}</a>
      </div>
      <div className="bg-neutral-light p-3 rounded-md">
        <div className="flex justify-between mb-1 text-sm">
          <span>{t('estimatedCost')}:</span>
          <span className="font-medium">{formatCurrency(boq.totalCost)} EGP</span>
        </div>
        
        {budget && (
          <div className="flex justify-between mb-1 text-xs">
            <span className="text-neutral-gray">{t('vsBudget')}:</span>
            <span className={getBudgetStatusColor()}>
              {boq.totalCost <= budget ? '-' : '+'}{formatCurrency(Math.abs(boq.totalCost - budget))} EGP
            </span>
          </div>
        )}
        
        <div className="mt-2 mb-2">
          <Progress value={getBudgetPercentage()} className="h-2" indicatorClassName={getProgressColor()} />
        </div>
        
        {budgetWarning && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-red-700">{budgetWarning.message}</span>
          </div>
        )}
        
        <div className="mt-3 space-y-1">
          {Object.entries(categorySummary).map(([category, amount]) => (
            <div key={category} className="flex justify-between text-xs">
              <span>{t(category.toLowerCase().replace(/\s+/g, '')) || category}</span>
              <span>{formatCurrency(amount)} EGP</span>
            </div>
          ))}
        </div>
        
        {/* Top items by cost */}
        {boq.items && boq.items.length > 0 && (
          <div className="mt-4 pt-3 border-t border-neutral-medium">
            <h5 className="text-xs font-medium mb-2">{t('topCostItems')}</h5>
            <div className="space-y-2">
              {(boq.items as BOQItem[])
                .sort((a, b) => b.totalPrice - a.totalPrice)
                .slice(0, 3)
                .map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="truncate max-w-[70%]">{item.name}</span>
                    <span>{formatCurrency(item.totalPrice)} EGP</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
