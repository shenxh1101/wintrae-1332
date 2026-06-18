import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '@/types';
import { generateOptions } from '@/utils/helpers';

interface AdditionQuestionProps {
  question: Question;
  onSubmit: (answer: string | number) => void;
  disabled?: boolean;
  showKeyboard?: boolean;
}

export const AdditionQuestion: React.FC<AdditionQuestionProps> = ({
  question,
  onSubmit,
  disabled = false,
  showKeyboard = true
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [useKeyboard, setUseKeyboard] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setInputValue('');
  }, [question.id]);

  const handleSelect = useCallback((answer: number) => {
    if (disabled) return;
    setSelectedAnswer(answer);
    setTimeout(() => {
      onSubmit(answer);
    }, 300);
  }, [disabled, onSubmit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(value);
  };

  const handleSubmitInput = () => {
    if (disabled || !inputValue) return;
    const answer = parseInt(inputValue, 10);
    setSelectedAnswer(answer);
    setTimeout(() => {
      onSubmit(answer);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitInput();
    }
  };

  const { num1, num2 } = question.data || {};
  const answer = typeof question.answer === 'number' ? question.answer : parseInt(String(question.answer), 10);
  const options = generateOptions(answer);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-6 text-6xl md:text-8xl font-display font-bold text-primary-700">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="bg-accent-100 px-6 py-4 rounded-3xl text-accent-600 min-w-[120px]"
          >
            {num1}
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-primary-500 text-5xl"
          >
            +
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="bg-accent-100 px-6 py-4 rounded-3xl text-accent-600 min-w-[120px]"
          >
            {num2}
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
            className="text-primary-500 text-5xl"
          >
            =
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: 'spring' }}
            className="bg-primary-100 px-6 py-4 rounded-3xl text-primary-600 min-w-[120px]"
          >
            ?
          </motion.span>
        </div>
      </motion.div>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setUseKeyboard(false)}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            !useKeyboard
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎯 选择答案
        </button>
        <button
          onClick={() => setUseKeyboard(true)}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            useKeyboard
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ⌨️ 键盘输入
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!useKeyboard ? (
          <motion.div
            key="options"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {options.map((option, index) => (
              <motion.button
                key={`${question.id}-${option}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 1, type: 'spring' }}
                whileHover={!disabled ? { scale: 1.1 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                onClick={() => handleSelect(option)}
                disabled={disabled || selectedAnswer !== null}
                className={`
                  py-6 px-4 rounded-3xl text-4xl font-display font-bold
                  transition-all duration-200 shadow-cartoon
                  ${selectedAnswer === option
                    ? 'bg-primary-500 text-white scale-105'
                    : 'bg-white text-primary-600 border-4 border-primary-200 hover:border-primary-400 hover:bg-primary-50'
                  }
                  ${disabled || selectedAnswer !== null ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center gap-4 max-w-md mx-auto"
          >
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="输入答案..."
              className="w-full px-6 py-4 text-4xl text-center font-display font-bold rounded-3xl border-4 border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-200 outline-none transition-all text-primary-600"
              autoFocus
            />
            <button
              onClick={handleSubmitInput}
              disabled={disabled || !inputValue}
              className="w-full py-4 px-8 text-2xl font-display font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-3xl shadow-cartoon hover:shadow-cartoon-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ✓ 提交答案
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showKeyboard && useKeyboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 max-w-md mx-auto"
        >
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setInputValue(prev => prev + num.toString())}
                disabled={disabled}
                className="py-4 text-3xl font-bold bg-white border-4 border-primary-200 rounded-2xl hover:bg-primary-50 hover:border-primary-400 transition-all disabled:opacity-50"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setInputValue(prev => prev.slice(0, -1))}
              disabled={disabled || !inputValue}
              className="py-4 text-2xl font-bold bg-error-100 text-error-600 border-4 border-error-200 rounded-2xl hover:bg-error-200 transition-all disabled:opacity-50"
            >
              ⌫
            </button>
            <button
              onClick={() => setInputValue(prev => prev + '0')}
              disabled={disabled}
              className="py-4 text-3xl font-bold bg-white border-4 border-primary-200 rounded-2xl hover:bg-primary-50 hover:border-primary-400 transition-all disabled:opacity-50"
            >
              0
            </button>
            <button
              onClick={() => setInputValue('')}
              disabled={disabled || !inputValue}
              className="py-4 text-2xl font-bold bg-gray-100 text-gray-600 border-4 border-gray-200 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              C
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdditionQuestion;
