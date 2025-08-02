'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store.ts';
import { fetchTicketTypes, createTicketType, updateTicketType } from '../../store/thunks/ticketTypeThunks.ts';
import { clearError } from '../../store/slices/ticketTypesSlice.ts';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';

export const TicketTypesSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { ticketTypes, isLoading, error } = useSelector((state: RootState) => state.ticketTypes);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#3B82F6');
  const [formError, setFormError] = useState('');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticTicketTypes, setOptimisticTicketTypes] = useState<typeof ticketTypes>([]);

  useEffect(() => {
    dispatch(fetchTicketTypes());
  }, [dispatch]);

  // Keep track of displayed ticket types (with optimistic updates)
  useEffect(() => {
    setOptimisticTicketTypes(ticketTypes);
  }, [ticketTypes]);

  const validateTypeName = (name: string): string | null => {
    if (name.length < 3) return 'Name must be at least 3 characters long';
    if (name.length > 50) return 'Name must be no more than 50 characters long';
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) return 'Name can only contain letters, numbers, and spaces';
    if (optimisticTicketTypes.some(type => type.name.toLowerCase() === name.toLowerCase())) {
      return 'A ticket type with this name already exists';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newTypeName.trim();
    const validationError = validateTypeName(trimmedName);
    
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    // Optimistic update - add immediately to UI
    const optimisticType: typeof ticketTypes[0] = {
      id: `temp-${Date.now()}`,
      name: trimmedName,
      description: undefined,
      propertiesSchema: {},
      defaultDuration: undefined,
      color: newTypeColor,
      userId: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOptimisticTicketTypes(prev => [...prev, optimisticType]);
    setNewTypeName(''); // Clear form immediately
    setNewTypeColor('#3B82F6'); // Reset color to default

    try {
      const result = await dispatch(createTicketType({ 
        name: trimmedName, 
        color: newTypeColor 
      })).unwrap();
      // Replace optimistic entry with real data
      setOptimisticTicketTypes(prev => 
        prev.map(type => type.id === optimisticType.id ? result : type)
      );
      dispatch(clearError()); // Clear any previous errors
    } catch (error) {
      // Remove optimistic entry on error
      setOptimisticTicketTypes(prev => 
        prev.filter(type => type.id !== optimisticType.id)
      );
      setFormError(error instanceof Error ? error.message : 'Failed to create ticket type');
      setNewTypeName(trimmedName); // Restore form value
      setNewTypeColor('#3B82F6'); // Reset color
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditType = (type: typeof ticketTypes[0]) => {
    setEditingTypeId(type.id);
    setEditingName(type.name);
    setEditingColor(type.color || '#3B82F6');
  };

  const handleSaveEdit = async (typeId: string) => {
    const validationError = validateTypeName(editingName);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      await dispatch(updateTicketType({
        id: typeId,
        name: editingName.trim(),
        color: editingColor,
      })).unwrap();
      setEditingTypeId(null);
      setEditingName('');
      setEditingColor('#3B82F6');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to update ticket type');
    }
  };

  const handleCancelEdit = () => {
    setEditingTypeId(null);
    setEditingName('');
    setEditingColor('#3B82F6');
    setFormError('');
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Ticket Types</h2>
        <p className="text-muted-foreground">
          Create and manage custom ticket types to organize your activities.
        </p>
      </div>

      {/* Create New Ticket Type Form */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Create New Ticket Type</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="typeName" className="block text-sm font-medium text-foreground mb-2">
              Type Name
            </label>
            <Input
              id="typeName"
              type="text"
              value={newTypeName}
              onChange={(e) => {
                setNewTypeName(e.target.value);
                setFormError(''); // Clear error on input change
              }}
              placeholder="Enter ticket type name (3-50 characters)"
              className="w-full"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Name must be 3-50 characters, using only letters, numbers, and spaces.
            </p>
          </div>
          
          <div>
            <label htmlFor="typeColor" className="block text-sm font-medium text-foreground mb-2">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="typeColor"
                type="color"
                value={newTypeColor}
                onChange={(e) => setNewTypeColor(e.target.value)}
                className="w-10 h-10 rounded-md border border-border cursor-pointer"
                disabled={isSubmitting}
              />
              <Input
                type="text"
                value={newTypeColor}
                onChange={(e) => setNewTypeColor(e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a color to help identify this ticket type.
            </p>
          </div>
          
          {formError && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {formError}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting || !newTypeName.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Creating...' : 'Create Ticket Type'}
          </Button>
        </form>
      </div>

      {/* Existing Ticket Types List */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Your Ticket Types</h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading ticket types...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-destructive">Error loading ticket types: {error}</div>
          </div>
        ) : optimisticTicketTypes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No ticket types created yet.</div>
            <div className="text-sm text-muted-foreground mt-1">
              Create your first ticket type using the form above.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {optimisticTicketTypes.map((type) => (
              <div
                key={type.id}
                className={`flex items-center justify-between p-3 bg-background border border-border rounded-md ${
                  type.id.startsWith('temp-') ? 'opacity-75 border-dashed' : ''
                }`}
              >
                {editingTypeId === type.id ? (
                  // Edit mode
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="color"
                      value={editingColor}
                      onChange={(e) => setEditingColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ticket type name"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(type.id)}
                        disabled={!editingName.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div>
                      <div className="font-medium text-foreground flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: type.color || '#3B82F6' }}
                        />
                        {type.name}
                        {type.id.startsWith('temp-') && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            Creating...
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(type.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {!type.id.startsWith('temp-') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditType(type)}
                      >
                        Edit
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
