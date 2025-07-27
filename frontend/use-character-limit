import { useState, useCallback } from 'react';

interface UseCharacterLimitProps {
  maxLength: number;
  initialValue?: string;
}

export function useCharacterLimit({ maxLength, initialValue = '' }: UseCharacterLimitProps) {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
    }
  }, [maxLength]);

  return {
    value,
    setValue,
    handleChange,
    characterCount: value.length,
    maxLength,
    isAtLimit: value.length >= maxLength
  };
}

