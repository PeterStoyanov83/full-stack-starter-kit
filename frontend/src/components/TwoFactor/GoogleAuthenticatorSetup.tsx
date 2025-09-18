'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TwoFactorAPI, SetupResponse, QRCodeResponse } from '@/lib/twofactor';
import {
  Shield,
  Smartphone,
  QrCode,
  Key,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

interface GoogleAuthenticatorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoogleAuthenticatorSetup({
  isOpen,
  onClose,
  onSuccess
}: GoogleAuthenticatorSetupProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<'instructions' | 'setup' | 'verify' | 'complete'>('instructions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [setupData, setSetupData] = useState<SetupResponse['data'] | null>(null);
  const [qrCodeData, setQrCodeData] = useState<QRCodeResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('instructions');
      setError('');
      setSetupData(null);
      setQrCodeData(null);
      setVerificationCode('');
      setShowBackupCodes(false);
    }
  }, [isOpen]);

  const handleStartSetup = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await TwoFactorAPI.setupGoogleAuthenticator(token);
      setSetupData(response.data);
      setStep('setup');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при настройване');
    } finally {
      setLoading(false);
    }
  };

  const handleGetQRCode = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await TwoFactorAPI.getQRCode(token);
      setQrCodeData(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при зареждане на QR код');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!token || !verificationCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Single step: verify and enable in one call
      await TwoFactorAPI.verify(token, verificationCode, 'google_authenticator');

      setStep('complete');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Невалиден код');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    await onSuccess();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backup_codes) return;

    const content = [
      'РЕЗЕРВНИ КОДОВЕ ЗА ДВУФАКТОРНА АВТЕНТИКАЦИЯ',
      '==========================================',
      '',
      'ВАЖНО: Запазете тези кодове на сигурно място!',
      'Всеки код може да се използва само веднъж.',
      '',
      ...setupData.backup_codes.map((code, index) => `${index + 1}. ${code}`),
      '',
      `Генерирани на: ${new Date().toLocaleString('bg-BG')}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes-2fa.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              Google Authenticator
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Step 1: Instructions */}
          {step === 'instructions' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Настройване на Google Authenticator
                </h4>
                <p className="text-gray-600">
                  Следвайте стъпките за настройване на двуфакторна автентикация
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Инсталирайте приложението</p>
                    <p className="text-sm text-gray-600">
                      Свалете Google Authenticator от App Store или Google Play
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Сканирайте QR код</p>
                    <p className="text-sm text-gray-600">
                      Използвайте приложението за сканиране на QR кода
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Потвърдете настройката</p>
                    <p className="text-sm text-gray-600">
                      Въведете 6-цифрения код от приложението
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    <strong>Важно:</strong> Запазете резервните кодове на сигурно място.
                    Те ще ви позволят достъп при загуба на телефона.
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartSetup}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Shield className="w-5 h-5 mr-2" />
                )}
                Започни настройката
              </button>
            </div>
          )}

          {/* Step 2: Setup (QR Code) */}
          {step === 'setup' && setupData && (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Сканирайте QR кода
                </h4>
                <p className="text-gray-600">
                  Отворете Google Authenticator и сканирайте кода
                </p>
              </div>

              {/* QR Code Display */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                {qrCodeData ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img
                        src={qrCodeData.qr_code_url}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Сканирайте този QR код с Google Authenticator
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleGetQRCode}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <QrCode className="w-5 h-5 mr-2" />
                    )}
                    Покажи QR код
                  </button>
                )}
              </div>

              {/* Manual Entry */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Ръчно въвеждане:</p>
                    <p className="text-sm text-blue-700 font-mono">
                      {setupData.manual_entry_key}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(setupData.secret_key)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Копирай ключа"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Продължи към потвърждение
              </button>
            </div>
          )}

          {/* Step 3: Verify Code */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Въведете кода за потвърждение
                </h4>
                <p className="text-gray-600">
                  Въведете 6-цифрения код от Google Authenticator
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код за потвърждение
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Кодът се променя на всеки 30 секунди
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('setup')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Назад
                </button>
                <button
                  onClick={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  Потвърди
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && setupData && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Настройката е завършена!
                </h4>
                <p className="text-gray-600">
                  Google Authenticator е успешно активиран за вашия акаунт
                </p>
              </div>

              {/* Backup Codes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Key className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-900">Резервни кодове</span>
                  </div>
                  <button
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                  >
                    {showBackupCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {showBackupCodes && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {setupData.backup_codes.map((code, index) => (
                        <div key={index} className="bg-white p-2 rounded text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={downloadBackupCodes}
                      className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Изтегли кодовете
                    </button>
                  </div>
                )}

                <p className="text-xs text-yellow-800 mt-2">
                  <strong>Важно:</strong> Запазете тези кодове! Те ви позволяват достъп при загуба на телефона.
                </p>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Завърши
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}