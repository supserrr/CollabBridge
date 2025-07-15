import React, { forwardRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import { clsx } from 'clsx';
import { Input } from './Input';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  label?: string;
  error?: string;
  hint?: string;
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  showTimeSelect?: boolean;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  className?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ 
    label, 
    error, 
    hint, 
    selected, 
    onChange, 
    placeholder = "Select date",
    showTimeSelect = false,
    dateFormat = showTimeSelect ? "MMM dd, yyyy h:mm aa" : "MMM dd, yyyy",
    minDate,
    maxDate,
    required,
    className 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick }, inputRef) => (
      <Input
        ref={inputRef}
        label={label}
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        error={error}
        hint={hint}
        required={required}
        readOnly
        className={className}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
    ));

    CustomInput.displayName = 'CustomInput';

    return (
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        customInput={<CustomInput />}
        popperClassName="z-50"
        popperPlacement="bottom-start"
        open={isOpen}
        onClickOutside={() => setIsOpen(false)}
        onSelect={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';
