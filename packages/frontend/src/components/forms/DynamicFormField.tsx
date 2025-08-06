'use client';

import { useState, useEffect } from 'react';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Checkbox } from '../ui/Checkbox.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { CustomFieldDefinition } from '../tickets/CustomPropertyForm.tsx';

interface DynamicFormFieldProps {
  field: CustomFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string;
}

export const DynamicFormField = ({ field, value, onChange, disabled, error }: DynamicFormFieldProps) => {
  const [localValue, setLocalValue] = useState<string>('');

  // Convert value to string for input fields
  useEffect(() => {
    if (value === undefined || value === null) {
      setLocalValue('');
    } else if (field.type === 'checkbox') {
      // Don't set localValue for checkbox
    } else {
      setLocalValue(String(value));
    }
  }, [value, field.type]);

  const handleInputChange = (inputValue: string) => {
    setLocalValue(inputValue);
    
    // Convert string back to appropriate type
    switch (field.type) {
      case 'number': {
        const numValue = parseFloat(inputValue);
        onChange(isNaN(numValue) ? 0 : numValue);
        break;
      }
      case 'text':
      case 'textarea':
      case 'date':
      case 'dropdown':
        onChange(inputValue);
        break;
      default:
        onChange(inputValue);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    onChange(checked);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={localValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.defaultValue ? String(field.defaultValue) : ''}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={localValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.defaultValue ? String(field.defaultValue) : '0'}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={localValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.defaultValue ? String(field.defaultValue) : ''}
            disabled={disabled}
            rows={3}
            className={error ? 'border-destructive' : ''}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={localValue}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={handleCheckboxChange}
              disabled={disabled}
            />
            <span className="text-sm">{field.label || field.name}</span>
          </div>
        );

      case 'dropdown':
        if (!field.options || field.options.length === 0) {
          return (
            <div className="text-sm text-muted-foreground italic">
              No options configured for this dropdown
            </div>
          );
        }
        
        return (
          <Select
            value={localValue}
            onChange={handleInputChange}
            options={field.options.map((option: string) => ({ value: option, label: option }))}
            placeholder={field.defaultValue ? String(field.defaultValue) : 'Select an option...'}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
          />
        );

      default:
        return (
          <div className="text-sm text-muted-foreground italic">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <label className="block text-sm font-medium text-foreground">
          {field.label || field.name}
          {field.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </label>
      )}
      
      {renderField()}
      
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};
