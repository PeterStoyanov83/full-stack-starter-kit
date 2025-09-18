'use client';

import React, { useState } from 'react';
import GoogleAuthenticatorSetup from '@/components/TwoFactor/GoogleAuthenticatorSetup';

interface FirstLoginSetupProps {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    profile_status: string;
    requires_2fa_setup: boolean;
  };
  onComplete: () => void;
}

export default function FirstLoginSetup({ token, user, onComplete }: FirstLoginSetupProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showSetup, setShowSetup] = useState(false);

  const authMethods = [
    {
      id: 'google_authenticator',
      name: 'Google Authenticator',
      description: 'Използвайте Google Authenticator приложение за генериране на кодове',
      icon: '📱',
      difficulty: 'Лесно',
      security: 'Високо',
      recommended: true
    },
    {
      id: 'email',
      name: 'Имейл код',
      description: 'Получавайте кодове за потвърждение на вашия имейл адрес',
      icon: '📧',
      difficulty: 'Много лесно',
      security: 'Средно',
      recommended: false,
      comingSoon: true
    },
    {
      id: 'google_oauth',
      name: 'Google акаунт',
      description: 'Влизайте директно с вашия Google акаунт (най-лесно)',
      icon: '🔐',
      difficulty: 'Най-лесно',
      security: 'Високо',
      recommended: true,
      comingSoon: true
    }
  ];

  const handleMethodSelect = (method: string) => {
    if (authMethods.find(m => m.id === method)?.comingSoon) {
      alert('Този метод ще бъде добавен скоро!');
      return;
    }
    setSelectedMethod(method);
    setShowSetup(true);
  };

  const handleSetupSuccess = () => {
    onComplete();
  };

  if (showSetup && selectedMethod === 'google_authenticator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <GoogleAuthenticatorSetup
          isOpen={true}
          onSuccess={handleSetupSuccess}
          onClose={() => setShowSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Добре дошли, {user.name}! 👋
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            За да активирате профила си, моля настройте двуфакторна автентикация
          </p>
          <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-700">
              Статус на профила: <span className="text-red-600">Неактивен</span>
            </span>
          </div>
        </div>

        {/* Security explanation */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start">
            <div className="bg-amber-500 rounded-full p-2 mr-4 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">🔒 Защо е важна двуфакторната автентикация?</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Защитава вашия акаунт дори ако паролата ви е компрометирана</li>
                <li>• Гарантира, че само вие имате достъп до вашите данни</li>
                <li>• Изисква се еднократно настройване - много лесно!</li>
                <li>• Съответства на най-добрите практики за сигурност</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Method selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Изберете метод за автентикация
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {authMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                disabled={method.comingSoon}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  method.comingSoon
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    : selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50 transform scale-105 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:transform hover:scale-105 hover:shadow-lg'
                }`}
              >
                {method.recommended && !method.comingSoon && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Препоръчано
                  </div>
                )}

                {method.comingSoon && (
                  <div className="absolute -top-3 -right-3 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Скоро
                  </div>
                )}

                <div className="text-4xl mb-4">{method.icon}</div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {method.name}
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  {method.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Трудност:</span>
                    <span className={`text-xs font-bold ${
                      method.difficulty === 'Най-лесно' ? 'text-green-600' :
                      method.difficulty === 'Много лесно' ? 'text-green-500' :
                      method.difficulty === 'Лесно' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {method.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Сигурност:</span>
                    <span className={`text-xs font-bold ${
                      method.security === 'Високо' ? 'text-green-600' :
                      method.security === 'Средно' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {method.security}
                    </span>
                  </div>
                </div>

                {!method.comingSoon && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center text-sm font-medium text-blue-600">
                      Настройване
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Help section */}
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Нужна ли ви помощ? 🤝
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Ако имате въпроси или затруднения с настройването, моля свържете се с администратора.
          </p>
          <div className="text-xs text-gray-500">
            💡 Съвет: Google Authenticator е най-сигурният и лесен за използване метод
          </div>
        </div>
      </div>
    </div>
  );
}