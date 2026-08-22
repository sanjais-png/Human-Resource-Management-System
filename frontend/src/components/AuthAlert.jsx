import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export const AuthAlert = ({ type = 'error', message }) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div
      className={`p-4 rounded-lg text-sm border flex items-center space-x-3 mb-4 ${
        isError
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};
