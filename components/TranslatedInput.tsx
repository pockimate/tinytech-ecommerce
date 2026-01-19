import React, { useMemo } from 'react';
import { useTranslatedText } from '../context/TranslationContext';

interface TranslatedInputProps {
  type: string;
  placeholderFallback: string;
  className: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  [key: string]: any; // Allow other props to be passed through
}

const TranslatedInput: React.FC<TranslatedInputProps> = ({ 
  type, 
  placeholderFallback, 
  className, 
  value, 
  onChange,
  onBlur,
  ...otherProps 
}) => {
  const translatedPlaceholder = useTranslatedText(placeholderFallback);
  
  // Memoize the onBlur handler to prevent recreation
  const handleBlur = useMemo(() => {
    return onBlur || undefined;
  }, [onBlur]);
  
  return (
    <input 
      type={type} 
      placeholder={translatedPlaceholder} 
      className={className}
      value={value}
      onChange={onChange}
      onBlur={handleBlur}
      {...otherProps}
    />
  );
};

export default TranslatedInput;