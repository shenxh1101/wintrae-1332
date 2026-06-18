import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import db from '@/db';
import type { QuestionType, DailyStats, OverallStats, DifficultyLevel } from '@/types';
import { formatDate } from '@/utils/helpers';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  addition: '加法',
  subtraction: '减法',
  multiplication: '乘法',
  division: '除法',
  comparison: '大小比较',
  pattern: '找规律',
  completion: '补全算式'
};

const ParentPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    isParentLoggedIn,
    userSettings,
    playerData,
    logoutParent,
    updateUserSettings,
    loadAllData,
    resetAllData
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'data'>('overview');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([]);
  const [dailyLimit, setDailyLimit] = useState(30);
  const [maxDifficulty, setMaxDifficulty] = useState(10);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isParentLoggedIn) {
      navigate('/parent-login');
      return;
    }
    loadAllData();
    loadData();
  }, [isParentLoggedIn, navigate, loadAllData]);

  useEffect(() => {
    if (userSettings) {
      setSelectedTypes(userSettings.enabledQuestionTypes || []);
      setDailyLimit(userSettings.dailyTimeLimit || 30);
      setMaxDifficulty(userSettings.maxDifficulty || 10);
    }
  }, [userSettings]);

  const loadData = async () => {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const [stats, overall] = await Promise.all([
        db.getDailyStats(formatDate(weekAgo), formatDate(today)),
        db.getOverallStats()
      ]);
      setDailyStats(stats);
      setOverallStats(overall as any);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const toggleType = (type: QuestionType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSaveSettings = async () => {
    if (selectedTypes.length === 0) {
      setMessage({ type: 'error', text: '请至少选择一种题型！' });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    const success = await updateUserSettings({
      enabledQuestionTypes: selectedTypes,
      dailyTimeLimit: dailyLimit,
      maxDifficulty: maxDifficulty as DifficultyLevel
    });

    if (success) {
      setMessage({ type: 'success', text: '设置已保存！' });
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage({ type: 'error', text: '保存失败，请重试' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleResetData = async () => {
    const success = await resetAllData();
    if (success) {
      setMessage({ type: 'success', text: '数据已重置！' });
      setShowResetConfirm(false);
      loadData();
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleLogout = () => {
    logoutParent();
    navigate('/');
  };

  if (!isParentLoggedIn) {
    return null;
  }

  const avgAccuracy = overallStats?.totalQuestions
    ? Math.round((overallStats.correctAnswers / overallStats.totalQuestions) * 100)
    : 0;

  const avgTime = overallStats?.totalQuestions
    ? (overallStats.totalTime / overallStats.totalQuestions).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Button variant="ghost" onClick={handleLogout} size="sm">
            ← 退出家长中心
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-display font-bold text-gray-700">
              👨‍👩‍👧 家长中心
            </h1>
          </div>
          <div className="w-32" />
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {(['overview', 'settings', 'data'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-display font-bold text-lg transition-all ${
                activeTab === tab
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'overview' && '📊 概览'}
              {tab === 'settings' && '⚙️ 设置'}
              {tab === 'data' && '📈 详细数据'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-2">🏆</div>
                    <div className="text-4xl font-display font-bold">{overallStats?.totalScore || 0}</div>
                    <div className="opacity-90">总得分</div>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <div className="text-4xl font-display font-bold">{avgAccuracy}%</div>
                    <div className="opacity-90">正确率</div>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-2">⏱️</div>
                    <div className="text-4xl font-display font-bold">{avgTime}s</div>
                    <div className="opacity-90">平均用时</div>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-2">🔥</div>
                    <div className="text-4xl font-display font-bold">{playerData.streakDays}</div>
                    <div className="opacity-90">连续天数</div>
                  </div>
                </Card>
              </div>

              <Card>
                <div className="p-6">
                  <h3 className="text-2xl font-display font-bold text-gray-700 mb-4">
                    📊 近7天学习情况
                  </h3>
                  <div className="space-y-3">
                    {dailyStats.slice().reverse().map((day, index) => {
                      const dayTotal = day.totalQuestions ?? day.questionsAnswered ?? 0;
                      const dayCorrect = day.correctAnswers ?? day.correctCount ?? 0;
                      const dayAccuracy = dayTotal
                        ? Math.round((dayCorrect / dayTotal) * 100)
                        : 0;
                      const maxQuestions = Math.max(...dailyStats.map(d => d.totalQuestions ?? d.questionsAnswered ?? 0), 1);
                      const width = (dayTotal / maxQuestions) * 100;

                      return (
                        <motion.div
                          key={day.date}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4"
                        >
                          <div className="w-24 text-gray-600 font-display">
                            {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${width}%` }}
                              transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-end pr-2"
                            >
                              {dayTotal > 0 && (
                                <span className="text-white text-sm font-display font-bold">
                                  {dayTotal}题
                                </span>
                              )}
                            </motion.div>
                          </div>
                          <div className="w-20 text-right font-display font-bold text-green-600">
                            {dayAccuracy}%
                          </div>
                        </motion.div>
                      );
                    })}
                    {dailyStats.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        暂无数据，开始学习后这里会显示统计
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-2xl font-display font-bold text-gray-700 mb-4">
                    📋 基本信息
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                      <div className="text-3xl mb-1">🎯</div>
                      <div className="text-2xl font-display font-bold text-primary-600">
                        {playerData.currentLevel}
                      </div>
                      <div className="text-sm text-gray-500">当前关卡</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                      <div className="text-3xl mb-1">💰</div>
                      <div className="text-2xl font-display font-bold text-accent-600">
                        {playerData.coins}
                      </div>
                      <div className="text-sm text-gray-500">当前金币</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                      <div className="text-3xl mb-1">📚</div>
                      <div className="text-2xl font-display font-bold text-success-600">
                        {overallStats?.totalQuestions || 0}
                      </div>
                      <div className="text-sm text-gray-500">总答题数</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                      <div className="text-3xl mb-1">👕</div>
                      <div className="text-2xl font-display font-bold text-reward-600">
                        {playerData.unlockedOutfits.length}
                      </div>
                      <div className="text-sm text-gray-500">解锁装扮</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-6 text-white">
                  <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                    <span className="text-3xl">⏰</span>
                    每日时长限制
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center gap-6">
                    <Button
                      variant="secondary"
                      onClick={() => setDailyLimit(Math.max(10, dailyLimit - 5))}
                    >
                      -
                    </Button>
                    <div className="text-center min-w-[140px]">
                      <div className="text-5xl font-display font-bold text-primary-600">
                        {dailyLimit}
                      </div>
                      <div className="text-gray-500">分钟/天</div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setDailyLimit(Math.min(120, dailyLimit + 5))}
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {[15, 30, 45, 60].map(minutes => (
                      <button
                        key={minutes}
                        onClick={() => setDailyLimit(minutes)}
                        className={`px-4 py-2 rounded-xl font-display font-bold transition-all ${
                          dailyLimit === minutes
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {minutes}分钟
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-6 text-white">
                  <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                    <span className="text-3xl">📚</span>
                    允许的题型
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => {
                      const isSelected = selectedTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={`p-4 rounded-2xl border-4 transition-all text-center ${
                            isSelected
                              ? 'bg-primary-500 text-white border-primary-300'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="font-display font-bold text-lg">
                            {QUESTION_TYPE_LABELS[type]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedTypes.length === 0 && (
                    <p className="text-error-500 text-center mt-4 font-display">
                      ⚠️ 请至少选择一种题型
                    </p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-6 text-white">
                  <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                    <span className="text-3xl">📊</span>
                    最高难度限制
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap justify-center gap-4">
                    {[1, 3, 5, 7, 10].map(level => (
                      <button
                        key={level}
                        onClick={() => setMaxDifficulty(level)}
                        className={`px-6 py-3 rounded-xl font-display font-bold text-lg transition-all ${
                          maxDifficulty === level
                            ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Lv.{level}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleSaveSettings}
                >
                  💾 保存设置
                </Button>
                <Button
                  variant="error"
                  size="lg"
                  onClick={() => setShowResetConfirm(true)}
                >
                  🗑️ 重置数据
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <div className="p-6">
                  <h3 className="text-2xl font-display font-bold text-gray-700 mb-4">
                    📈 题型正确率分析
                  </h3>
                  {overallStats?.typeStats && Object.entries(overallStats.typeStats).length > 0 ? (
                    <div className="space-y-4">
                      {(Object.entries(overallStats.typeStats) as [QuestionType, { total: number; correct: number }][]).map(([type, stats]) => {
                        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                        const getColor = () => {
                          if (accuracy >= 80) return 'from-green-400 to-green-500';
                          if (accuracy >= 60) return 'from-yellow-400 to-yellow-500';
                          return 'from-red-400 to-red-500';
                        };

                        return (
                          <div key={type}>
                            <div className="flex justify-between mb-1">
                              <span className="font-display font-bold text-gray-700">
                                {QUESTION_TYPE_LABELS[type]}
                              </span>
                              <span className="font-display font-bold text-gray-600">
                                {stats.correct}/{stats.total} ({accuracy}%)
                              </span>
                            </div>
                            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${accuracy}%` }}
                                transition={{ duration: 0.8 }}
                                className={`h-full bg-gradient-to-r ${getColor()} rounded-full`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      暂无数据
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-2xl font-display font-bold text-gray-700 mb-4">
                    ⚠️ 常错题
                  </h3>
                  <div className="text-center py-4 text-gray-500">
                    <p>功能开发中...</p>
                    <p className="text-sm mt-2">这里将展示孩子经常做错的题目类型</p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-xl font-display font-bold text-gray-700 mb-4">
                      📤 导出数据
                    </h3>
                    <p className="text-gray-500 mb-4">
                      将孩子的学习数据导出为JSON文件，方便备份和查看
                    </p>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={async () => {
                        try {
                          const data = await db.exportData();
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `math-wizard-data-${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          setMessage({ type: 'success', text: '数据导出成功！' });
                          setTimeout(() => setMessage(null), 2000);
                        } catch (error) {
                          setMessage({ type: 'error', text: '导出失败，请重试' });
                          setTimeout(() => setMessage(null), 2000);
                        }
                      }}
                    >
                      导出学习数据
                    </Button>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-xl font-display font-bold text-gray-700 mb-4">
                      📥 导入数据
                    </h3>
                    <p className="text-gray-500 mb-4">
                      从之前导出的JSON文件恢复学习数据
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      id="import-file"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const text = await file.text();
                          const data = JSON.parse(text);
                          await db.importData(data);
                          loadData();
                          setMessage({ type: 'success', text: '数据导入成功！' });
                          setTimeout(() => setMessage(null), 2000);
                        } catch (error) {
                          setMessage({ type: 'error', text: '导入失败，请检查文件格式' });
                          setTimeout(() => setMessage(null), 2000);
                        }
                      }}
                    />
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => document.getElementById('import-file')?.click()}
                    >
                      选择文件导入
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-full text-white font-display font-bold text-xl shadow-2xl z-50 ${
                message.type === 'success' ? 'bg-success-500' : 'bg-error-500'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full text-center border-4 border-error-200"
              >
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-display font-bold text-gray-800 mb-4">
                  确认重置所有数据？
                </h3>
                <p className="text-gray-600 mb-6">
                  此操作将删除所有学习记录、金币、装扮等数据，且无法恢复！
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setShowResetConfirm(false)}
                  >
                    取消
                  </Button>
                  <Button
                    variant="error"
                    fullWidth
                    onClick={handleResetData}
                  >
                    确认重置
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ParentPage;
