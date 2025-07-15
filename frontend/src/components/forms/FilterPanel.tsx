import React from 'react';
import { SearchForm } from './SearchForm';
import { Button } from '@/components/ui/Button';

interface FilterPanelProps {
  type: 'professionals' | 'events';
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: any) => void;
  onReset: () => void;
  activeFilters?: any;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  type,
  isOpen,
  onClose,
  onSearch,
  onReset,
  activeFilters
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          <SearchForm
            type={type}
            initialValues={activeFilters}
            onSearch={onSearch}
            onReset={onReset}
          />
        </div>
      </div>
    </>
  );
};
