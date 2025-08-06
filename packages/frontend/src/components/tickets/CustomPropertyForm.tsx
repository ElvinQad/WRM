'use client';

import { useState } from 'react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Checkbox } from '../ui/Checkbox.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Trash2, Plus } from 'lucide-react';

export interface CustomFieldDefinition {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'date' | 'dropdown' | 'textarea';
  label?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: string[];
}

interface CustomPropertyFormProps {
  customFields: CustomFieldDefinition[];
  onFieldsChange: (fields: CustomFieldDefinition[]) => void;
  disabled?: boolean;
}

export const CustomPropertyForm = ({ customFields, onFieldsChange, disabled }: CustomPropertyFormProps) => {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldDefinition['type']>('text');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldDefaultValue, setNewFieldDefaultValue] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState<string[]>(['']);
  const [fieldError, setFieldError] = useState('');

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'textarea', label: 'Textarea' },
  ] as const;

  const validateFieldName = (name: string): string | null => {
    if (!name.trim()) return 'Field name is required';
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return 'Field name can only contain letters, numbers, and underscores';
    if (customFields.some(field => field.name === name)) return 'Field name must be unique';
    return null;
  };

  const handleAddField = () => {
    const trimmedName = newFieldName.trim();
    const validationError = validateFieldName(trimmedName);
    
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    if (newFieldType === 'dropdown' && newFieldOptions.filter(opt => opt.trim()).length === 0) {
      setFieldError('Dropdown fields must have at least one option');
      return;
    }

    const defaultValue = getDefaultValueForType(newFieldType, newFieldDefaultValue, newFieldOptions);

    const newField: CustomFieldDefinition = {
      name: trimmedName,
      type: newFieldType,
      label: newFieldLabel.trim() || trimmedName,
      required: newFieldRequired,
      defaultValue,
      ...(newFieldType === 'dropdown' && { options: newFieldOptions.filter(opt => opt.trim()) }),
    };

    onFieldsChange([...customFields, newField]);
    
    // Reset form
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldLabel('');
    setNewFieldRequired(false);
    setNewFieldDefaultValue('');
    setNewFieldOptions(['']);
    setFieldError('');
  };

  const getDefaultValueForType = (type: CustomFieldDefinition['type'], value: string, options: string[]): unknown => {
    switch (type) {
      case 'text':
      case 'textarea':
        return value;
      case 'number':
        return value ? parseFloat(value) || 0 : 0;
      case 'checkbox':
        return value === 'true';
      case 'date':
        return value || null;
      case 'dropdown':
        return value && options.includes(value) ? value : options.filter(opt => opt.trim())[0] || null;
      default:
        return null;
    }
  };

  const handleRemoveField = (index: number) => {
    const newFields = customFields.filter((_, i) => i !== index);
    onFieldsChange(newFields);
  };

  const handleAddOption = () => {
    setNewFieldOptions([...newFieldOptions, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newFieldOptions];
    newOptions[index] = value;
    setNewFieldOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (newFieldOptions.length > 1) {
      const newOptions = newFieldOptions.filter((_, i) => i !== index);
      setNewFieldOptions(newOptions);
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Custom Fields */}
      {customFields.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Custom Properties</h4>
          <div className="space-y-2">
            {customFields.map((field, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background border border-border rounded-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{field.label || field.name}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Field name: {field.name}
                    {field.defaultValue !== undefined && (
                      <span> • Default: {String(field.defaultValue)}</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveField(index)}
                  disabled={disabled}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Field Form */}
      <div className="border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">Add Custom Property</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Field Name *
            </label>
            <Input
              value={newFieldName}
              onChange={(e) => {
                setNewFieldName(e.target.value);
                setFieldError('');
              }}
              placeholder="field_name"
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Field Type *
            </label>
            <Select 
              value={newFieldType} 
              onChange={(value) => setNewFieldType(value as CustomFieldDefinition['type'])} 
              options={fieldTypes.map(type => ({ value: type.value, label: type.label }))}
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Display Label
            </label>
            <Input
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              placeholder="Field Label (optional)"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Value
            </label>
            {newFieldType === 'checkbox' ? (
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  checked={newFieldDefaultValue === 'true'}
                  onCheckedChange={(checked) => setNewFieldDefaultValue(checked ? 'true' : 'false')}
                  disabled={disabled}
                />
                <span className="text-sm">Default checked</span>
              </div>
            ) : newFieldType === 'textarea' ? (
              <Textarea
                value={newFieldDefaultValue}
                onChange={(e) => setNewFieldDefaultValue(e.target.value)}
                placeholder="Default value (optional)"
                disabled={disabled}
                rows={3}
              />
            ) : (
              <Input
                type={newFieldType === 'number' ? 'number' : newFieldType === 'date' ? 'date' : 'text'}
                value={newFieldDefaultValue}
                onChange={(e) => setNewFieldDefaultValue(e.target.value)}
                placeholder="Default value (optional)"
                disabled={disabled}
              />
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={newFieldRequired}
              onCheckedChange={setNewFieldRequired}
              disabled={disabled}
            />
            <span className="text-sm">Required field</span>
          </div>
        </div>

        {/* Dropdown Options */}
        {newFieldType === 'dropdown' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Dropdown Options *
            </label>
            <div className="space-y-2">
              {newFieldOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveOption(index)}
                    disabled={disabled || newFieldOptions.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddOption}
                disabled={disabled}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {fieldError && (
          <div className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
            {fieldError}
          </div>
        )}

        <div className="mt-4">
          <Button
            type="button"
            onClick={handleAddField}
            disabled={disabled || !newFieldName.trim() || !newFieldType}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>
    </div>
  );
};
