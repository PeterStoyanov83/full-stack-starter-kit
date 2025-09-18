'use client';

import React from 'react';

export type ErrorType = 'auth' | 'network' | 'validation' | 'system' | 'warning';

interface ErrorMessageProps {
  type: ErrorType;
  title: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showActions?: boolean;
  autoClose?: boolean;
  duration?: number;
}

export default function ErrorMessage({
  type,
  title,
  message,
  onRetry,
  onDismiss,
  showActions = true,
  autoClose = false,
  duration = 5000,
}: ErrorMessageProps) {
  React.useEffect(() => {
    if (autoClose && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onDismiss]);

  const getErrorConfig = (errorType: ErrorType) => {
    switch (errorType) {
      case 'auth':
        return {
          bgGradient: 'from-red-50 via-pink-50 to-red-100',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          buttonBg: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          ),
        };
      case 'network':
        return {
          bgGradient: 'from-orange-50 via-yellow-50 to-orange-100',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-500',
          titleColor: 'text-orange-800',
          messageColor: 'text-orange-700',
          buttonBg: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ),
        };
      case 'validation':
        return {
          bgGradient: 'from-yellow-50 via-amber-50 to-yellow-100',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          buttonBg: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          ),
        };
      case 'system':
        return {
          bgGradient: 'from-gray-50 via-slate-50 to-gray-100',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
          buttonBg: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          ),
        };
      case 'warning':
        return {
          bgGradient: 'from-blue-50 via-indigo-50 to-blue-100',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          buttonBg: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ),
        };
      default:
        return getErrorConfig('system');
    }
  };

  const config = getErrorConfig(type);

  return (
    <div className="animate-slideDown">
      <div className={`bg-gradient-to-r ${config.bgGradient} ${config.borderColor} border shadow-xl rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300`}>
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${config.bgGradient} px-8 py-6 border-b ${config.borderColor}`}>
          <div className="flex items-center">
            <div className={`w-12 h-12 ${config.iconColor} bg-white/50 rounded-full flex items-center justify-center mr-4 shadow-lg`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {config.icon}
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${config.titleColor} mb-1`}>
                {title}
              </h3>
              <p className={`${config.messageColor} text-sm font-medium`}>
                {message}
              </p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`${config.iconColor} hover:bg-white/20 p-2 rounded-full transition-all duration-200 transform hover:scale-110`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (onRetry || onDismiss) && (
          <div className="px-8 py-6 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-end space-x-4">
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Затвори
                </button>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`px-6 py-3 bg-gradient-to-r ${config.buttonBg} text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Опитай отново
                </button>
              )}
            </div>
          </div>
        )}

        {/* Auto-close progress bar */}
        {autoClose && (
          <div className="h-1 bg-gray-200 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${config.buttonBg} animate-pulse`}
              style={{
                width: '100%',
                animation: `shrinkProgress ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Predefined error message configurations
export const ErrorMessages = {
  // Authentication errors
  LOGIN_FAILED: {
    type: 'auth' as ErrorType,
    title: 'Грешка при вход',
    message: 'Неправилен имейл или парола. Моля, опитайте отново.',
  },
  SESSION_EXPIRED: {
    type: 'auth' as ErrorType,
    title: 'Сесията е изтекла',
    message: 'Вашата сесия е изтекла. Моля, влезте отново в системата.',
  },
  UNAUTHORIZED: {
    type: 'auth' as ErrorType,
    title: 'Няма достъп',
    message: 'Нямате права за достъп до този ресурс.',
  },
  LOGOUT_FAILED: {
    type: 'auth' as ErrorType,
    title: 'Грешка при изход',
    message: 'Възникна проблем при излизане от системата.',
  },

  // Network errors
  NETWORK_ERROR: {
    type: 'network' as ErrorType,
    title: 'Мрежова грешка',
    message: 'Няма връзка със сървъра. Проверете интернет връзката си.',
  },
  SERVER_ERROR: {
    type: 'network' as ErrorType,
    title: 'Сървърна грешка',
    message: 'Възникна проблем със сървъра. Моля, опитайте по-късно.',
  },
  TIMEOUT_ERROR: {
    type: 'network' as ErrorType,
    title: 'Изтекло време',
    message: 'Заявката отне твърде много време. Моля, опитайте отново.',
  },

  // Validation errors
  VALIDATION_ERROR: {
    type: 'validation' as ErrorType,
    title: 'Невалидни данни',
    message: 'Моля, проверете въведените данни и опитайте отново.',
  },
  REQUIRED_FIELDS: {
    type: 'validation' as ErrorType,
    title: 'Задължителни полета',
    message: 'Моля, попълнете всички задължителни полета.',
  },

  // System errors
  DATA_LOAD_ERROR: {
    type: 'system' as ErrorType,
    title: 'Грешка при зареждане',
    message: 'Възникна проблем при зареждане на данните.',
  },
  UNEXPECTED_ERROR: {
    type: 'system' as ErrorType,
    title: 'Неочаквана грешка',
    message: 'Възникна неочаквана грешка. Моля, опитайте отново.',
  },

  // Warnings
  SLOW_CONNECTION: {
    type: 'warning' as ErrorType,
    title: 'Бавна връзка',
    message: 'Вашата интернет връзка е бавна. Данните може да се зареждат по-бавно.',
  },
  OFFLINE_MODE: {
    type: 'warning' as ErrorType,
    title: 'Офлайн режим',
    message: 'Няма интернет връзка. Някои функции може да не работят.',
  },
} as const;