import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const ParentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { userSettings, loadUserSettings, loginParent, setParentPassword } = usePlayerStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  useEffect(() => {
    if (userSettings && !userSettings.parentPassword) {
      setIsSetup(true);
    }
  }, [userSettings]);

  const handleSetupPassword = async () => {
    if (password.length < 4) {
      setError('密码至少需要4位数字');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    const success = await setParentPassword(password);
    if (success) {
      await loginParent(password);
      navigate('/parent');
    } else {
      setError('设置密码失败，请重试');
    }
  };

  const handleLogin = async () => {
    if (!password) {
      setError('请输入密码');
      return;
    }
    
    const success = await loginParent(password);
    if (success) {
      navigate('/parent');
    } else {
      setError('密码错误，请重试');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSetup) {
        handleSetupPassword();
      } else {
        handleLogin();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 py-8 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-8 text-white text-center">
            <div className="text-6xl mb-4">👨‍👩‍👧</div>
            <h1 className="text-3xl font-display font-bold mb-2">
              {isSetup ? '设置家长密码' : '家长中心'}
            </h1>
            <p className="opacity-90">
              {isSetup ? '首次使用，请设置4位数字密码' : '请输入密码进入家长中心'}
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-display font-bold mb-2">
                  {isSetup ? '设置密码' : '输入密码'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode="numeric"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="请输入数字密码"
                    className="w-full px-4 py-4 text-2xl text-center font-display font-bold rounded-2xl border-4 border-gray-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {isSetup && (
                <div>
                  <label className="block text-gray-700 font-display font-bold mb-2">
                    确认密码
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode="numeric"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="请再次输入密码"
                    className="w-full px-4 py-4 text-2xl text-center font-display font-bold rounded-2xl border-4 border-gray-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all tracking-widest"
                    maxLength={6}
                  />
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error-100 text-error-600 px-4 py-3 rounded-xl text-center font-display"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  fullWidth
                >
                  返回
                </Button>
                <Button
                  variant="primary"
                  onClick={isSetup ? handleSetupPassword : handleLogin}
                  fullWidth
                >
                  {isSetup ? '设置密码' : '进入'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>💡 家长可以在这里设置游戏限制、查看学习数据</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ParentLoginPage;
