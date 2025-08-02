import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth.ts';

interface PasswordResetFormProps {
  token: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ 
  token, 
  onSuccess,
  onCancel 
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isResetComplete, setIsResetComplete] = useState(false);
  
  const { resetPassword, passwordResetStatus, error, clearError } = useAuth();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!newPassword.trim()) {
      errors.push('Please enter a new password');
    } else if (newPassword.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (newPassword !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    clearError();
    
    try {
      await resetPassword(token, newPassword);
      setIsResetComplete(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
    }
  };

  if (isResetComplete) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Password Reset Successful
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <button
            type="button"
            onClick={onSuccess}
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue to Sign In
          </button>
        </div>
      </div>
    );
  }

  const allErrors = [...validationErrors];
  if (error) {
    allErrors.push(error);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reset Your Password
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password Field */}
        <div className="space-y-2">
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="Enter your new password (6+ characters)"
              disabled={passwordResetStatus === 'pending'}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="confirm-new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="Confirm your new password"
              disabled={passwordResetStatus === 'pending'}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {allErrors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please fix the following {allErrors.length === 1 ? 'error' : 'errors'}:
                </h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                  {allErrors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={passwordResetStatus === 'pending'}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {passwordResetStatus === 'pending' && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {passwordResetStatus === 'pending' ? 'Resetting Password...' : 'Reset Password'}
        </button>

        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};
