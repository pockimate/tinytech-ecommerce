import React from 'react';
import { useTranslatedText } from '../context/TranslationContext';

interface TranslatedInputProps {
  type: string;
  placeholderFallback: string;
  className: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any; // Allow other props to be passed through
}

const TranslatedInput: React.FC<TranslatedInputProps> = ({ 
  type, 
  placeholderFallback, 
  className, 
  value, 
  onChange, 
  ...otherProps 
}) => {
  const translatedPlaceholder = useTranslatedText(placeholderFallback);
  
  return (
    <input 
      type={type} 
      placeholder={translatedPlaceholder} 
      className={className}
      value={value}
      onChange={onChange}
      {...otherProps}
    />
  );
};

export default TranslatedInput;