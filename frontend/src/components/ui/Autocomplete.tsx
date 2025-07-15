import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Input } from './Input';

interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

interface AutocompleteProps {
  label?: string;
  error?: string;
  hint?: string;
  options: AutocompleteOption[];
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  loadingMessage?: string;
  noOptionsMessage?: string;
  minSearchLength?: number;
}

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  ({ 
    label,
    error,
    hint,
    options,
    value = '',
    onChange,
    onSelect,
    placeholder,
    required,
    className,
    loadingMessage = 'Loading...',
    noOptionsMessage = 'No options found',
    minSearchLength = 1
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
      setSearchTerm(value);
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchTerm(newValue);
      onChange?.(newValue);
      setIsOpen(newValue.length >= minSearchLength);
      setHighlightedIndex(-1);
    };

    const handleOptionClick = (option: AutocompleteOption) => {
      setSearchTerm(option.label);
      onChange?.(option.value);
      onSelect?.(option);
      setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionClick(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    return (
      <div ref={containerRef} className={clsx('relative w-full', className)}>
        <Input
          ref={ref}
          label={label}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= minSearchLength && setIsOpen(true)}
          placeholder={placeholder}
          error={error}
          hint={hint}
          required={required}
          autoComplete="off"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                {searchTerm.length < minSearchLength ? 
                  `Type at least ${minSearchLength} character${minSearchLength > 1 ? 's' : ''} to search` :
                  noOptionsMessage
                }
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={clsx(
                    'w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                    index === highlightedIndex && 'bg-gray-100'
                  )}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-500">{option.description}</div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
);

Autocomplete.displayName = 'Autocomplete';
