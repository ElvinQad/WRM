import { useState } from 'react';
import { Button } from '../ui/Button.tsx';
import { Select } from '../ui/Select.tsx';
import { Input } from '../ui/Input.tsx';
import { cn } from '../../lib/utils.ts';

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface RecurrencePatternConfig {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: Date;
  maxOccurrences?: number;
  skipDates?: Date[];
}

interface RecurrenceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pattern: RecurrencePatternConfig) => void;
  initialPattern?: RecurrencePatternConfig;
  ticketTitle?: string;
}

export function RecurrenceConfigModal({
  isOpen,
  onClose,
  onSave,
  initialPattern,
  ticketTitle = 'ticket'
}: RecurrenceConfigModalProps) {
  const [pattern, setPattern] = useState<RecurrencePatternConfig>({
    frequency: 'DAILY',
    interval: 1,
    ...initialPattern
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(pattern);
    onClose();
  };

  const handleFrequencyChange = (value: string) => {
    const frequency = value as RecurrenceFrequency;
    setPattern((prev: RecurrencePatternConfig) => ({
      ...prev,
      frequency,
      interval: frequency === 'DAILY' ? 1 : frequency === 'WEEKLY' ? 1 : 1
    }));
  };

  const getIntervalLabel = () => {
    switch (pattern.frequency) {
      case 'DAILY': return 'day(s)';
      case 'WEEKLY': return 'week(s)';
      case 'MONTHLY': return 'month(s)';
      case 'CUSTOM': return 'day(s)';
      default: return 'interval(s)';
    }
  };

  const getRecurrenceDescription = () => {
    const { frequency, interval } = pattern;
    if (frequency === 'DAILY') {
      return interval === 1 ? 'Every day' : `Every ${interval} days`;
    } else if (frequency === 'WEEKLY') {
      return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
    } else if (frequency === 'MONTHLY') {
      return interval === 1 ? 'Every month' : `Every ${interval} months`;
    } else if (frequency === 'CUSTOM') {
      return `Every ${interval} days`;
    }
    return '';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cn(
        "bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl",
        "max-w-md w-full mx-4 transform transition-all duration-300",
        "border border-border/50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground">Set Up Recurring {ticketTitle}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Frequency Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Repeat</label>
            <Select
              value={pattern.frequency}
              onChange={handleFrequencyChange}
              options={[
                { value: 'DAILY', label: 'Daily' },
                { value: 'WEEKLY', label: 'Weekly' },
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'CUSTOM', label: 'Custom' }
              ]}
            />
          </div>

          {/* Interval */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Every {getIntervalLabel()}
            </label>
            <Input
              type="number"
              min={1}
              max={365}
              value={pattern.interval.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPattern((prev: RecurrencePatternConfig) => ({
                ...prev,
                interval: Math.max(1, parseInt(e.target.value) || 1)
              }))}
              className="w-24"
            />
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <div className="text-sm text-foreground">
              <strong>Preview:</strong> {getRecurrenceDescription()}
            </div>
          </div>

          {/* End Conditions */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">End Condition (Optional)</label>
            
            {/* End Date */}
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="end-date"
                name="endCondition"
                checked={!!pattern.endDate}
                onChange={() => setPattern((prev: RecurrencePatternConfig) => ({
                  ...prev,
                  endDate: prev.endDate || new Date(),
                  maxOccurrences: undefined
                }))}
                className="text-primary focus:ring-primary"
              />
              <label htmlFor="end-date" className="flex items-center space-x-2 cursor-pointer text-foreground">
                <span>End on</span>
                <Input
                  type="date"
                  value={pattern.endDate ? pattern.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPattern((prev: RecurrencePatternConfig) => ({
                    ...prev,
                    endDate: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                  disabled={!pattern.endDate}
                  className={cn(
                    "w-40",
                    !pattern.endDate && "opacity-50"
                  )}
                />
              </label>
            </div>

            {/* Max Occurrences */}
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="max-occurrences"
                name="endCondition"
                checked={!!pattern.maxOccurrences}
                onChange={() => setPattern((prev: RecurrencePatternConfig) => ({
                  ...prev,
                  maxOccurrences: prev.maxOccurrences || 10,
                  endDate: undefined
                }))}
                className="text-primary focus:ring-primary"
              />
              <label htmlFor="max-occurrences" className="flex items-center space-x-2 cursor-pointer text-foreground">
                <span>After</span>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={pattern.maxOccurrences?.toString() || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPattern((prev: RecurrencePatternConfig) => ({
                    ...prev,
                    maxOccurrences: parseInt(e.target.value) || undefined
                  }))}
                  className={cn(
                    "w-20",
                    !pattern.maxOccurrences && "opacity-50"
                  )}
                  disabled={!pattern.maxOccurrences}
                />
                <span>occurrences</span>
              </label>
            </div>

            {/* No End */}
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="no-end"
                name="endCondition"
                checked={!pattern.endDate && !pattern.maxOccurrences}
                onChange={() => setPattern((prev: RecurrencePatternConfig) => ({
                  ...prev,
                  endDate: undefined,
                  maxOccurrences: undefined
                }))}
                className="text-primary focus:ring-primary"
              />
              <label htmlFor="no-end" className="cursor-pointer text-foreground">
                Never end
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-6 border-t border-border/50 bg-card/50">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Recurrence
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
