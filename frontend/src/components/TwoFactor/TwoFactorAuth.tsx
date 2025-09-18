'use client';

import React, { useState } from 'react';
import { TwoFactorAPI } from '@/lib/twofactor';

interface TwoFactorAuthProps {
  token: string;
  mode: 'activation' | 'login';
  method: string;
  onSuccess: () => void;
  onCancel?: () => void;
  backupCodes?: string[];
}

export default function TwoFactorAuth({
  token,
  mode,
  method,
  onSuccess,
  onCancel,
  backupCodes
}: TwoFactorAuthProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      if (mode === 'activation') {
        // For activation: verify + enable
        await TwoFactorAPI.verify(token, code, method);
        await TwoFactorAPI.enable(token, method, code);
      } else {
        // For login: just verify
        await TwoFactorAPI.verify(token, code, method);
      }

      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Невалиден код');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'activation') {
      return 'Активиране на двуфакторна автентикация';
    }
    return 'Двуфакторна автентикация';
  };

  const getDescription = () => {
    if (method === 'google_authenticator') {
      return 'Въведете 6-цифрения код от Google Authenticator приложението';
    }
    if (method === 'email') {
      return 'Въведете кода, изпратен на вашия имейл';
    }
    if (method === 'telegram') {
      return 'Въведете кода, изпратен в Telegram';
    }
    return 'Въведете кода за потвърждение';
  };

  const getCodeInputProps = () => {
    if (useBackupCode) {
      return {
        placeholder: '12345678',
        maxLength: 8,
        pattern: '[0-9]{8}'
      };
    }
    return {
      placeholder: '123456',
      maxLength: 6,
      pattern: '[0-9]{6}'
    };
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {getTitle()}
        </h2>
        <p className="text-gray-600 text-sm">
          {getDescription()}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
            {useBackupCode ? '🔑 Резервен код (8 цифри)' : '🔢 Код за потвърждение'}
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center text-2xl font-mono tracking-widest"
            {...getCodeInputProps()}
            required
          />
        </div>

        {/* Backup codes option */}
        {backupCodes && backupCodes.length > 0 && method === 'google_authenticator' && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {useBackupCode ? 'Използване на Google Authenticator код' : 'Използване на резервен код'}
            </button>
          </div>
        )}

        <div className="flex space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Отказ
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className={`${onCancel ? 'flex-1' : 'w-full'} flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all duration-300 ${
              loading || !code.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Потвърждаване...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {mode === 'activation' ? 'Активиране' : 'Потвърждаване'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Instructions for different methods */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-600 font-medium mb-2">💡 Инструкции:</p>
        {method === 'google_authenticator' && (
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Отворете Google Authenticator приложението</li>
            <li>• Намерете кода за {window.location.hostname}</li>
            <li>• Въведете 6-цифрения код</li>
            {useBackupCode && <li>• Или използвайте 8-цифрен резервен код</li>}
          </ul>
        )}
        {method === 'email' && (
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Проверете входящата си поща</li>
            <li>• Намерете имейла с код за потвърждение</li>
            <li>• Въведете 6-цифрения код</li>
          </ul>
        )}
        {method === 'telegram' && (
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Отворете Telegram приложението</li>
            <li>• Намерете съобщението с кода</li>
            <li>• Въведете 6-цифрения код</li>
          </ul>
        )}
      </div>
    </div>
  );
}