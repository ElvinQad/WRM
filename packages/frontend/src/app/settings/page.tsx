'use client';

import { ProtectedRoute } from '../../components/auth/ProtectedRoute.tsx';
import { SettingsLayout } from '../../components/settings/SettingsLayout.tsx';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsLayout />
    </ProtectedRoute>
  );
}
