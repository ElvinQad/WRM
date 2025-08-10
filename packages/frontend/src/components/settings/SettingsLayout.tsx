'use client';

import React, { useState } from 'react';
import { TicketTypesSettings } from '../tickets/TicketTypesSettings.tsx';

export const SettingsLayout = () => {
  const [activeSection, setActiveSection] = useState('ticket-types');

  const sections = [
    { id: 'ticket-types', label: 'Ticket Types', icon: '🏷️' },
    // Future sections can be added here
  ];

  return (
    <React.Suspense fallback={<div className="flex h-full bg-background" />}> 
      <div className="flex h-full bg-background">
      {/* Settings Navigation Sidebar */}
      <div className="w-64 bg-card border-r border-border p-4 flex-shrink-0">
        <h1 className="text-xl font-semibold text-foreground mb-6">Settings</h1>
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              type="button"
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition flex items-center gap-3 ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        {activeSection === 'ticket-types' && <TicketTypesSettings />}
      </div>
      </div>
    </React.Suspense>
  );
};
