import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/types';

interface ComparisonQuestionProps {
  question: Question;
  onSubmit: (answer: string | number) => void;
  disabled?: boolean;
}

const COMPARISON_OPTIONS = ['>', '<', '='];
const COMPARISON_LABELS: Record<string, string> = {
  '>': '大于',
  '<': '小于',
  '=': '等于'
};

export const ComparisonQuestion: React.FC<ComparisonQuestionProps> = ({
  question,
  onSubmit,
  disabled = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [question.id]);

  const handleSelect = useCallback((answer: string) => {
    if (disabled) return;
    setSelectedAnswer(answer);
    setTimeout(() => onSubmit(answer), 300);
  }, [disabled, onSubmit]);

  const { left, right } = question.displayData?.comparison || question.data || {};
  const num1 = left ?? question.data?.num1;
  const num2 = right ?? question.data?.num2;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-8 text-6xl md:text-8xl font-display font-bold">
          <motion.span
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="bg-error-100 px-8 py-6 rounded-3xl text-error-600 min-w-[140px]"
          >
            {num1}
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="bg-primary-100 px-8 py-6 rounded-3xl text-primary-400 min-w-[140px] text-7xl"
          >
            ?
          </motion.span>
          <motion.span
            initial={{ scale: 0, rotate: 10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="bg-error-100 px-8 py-6 rounded-3xl text-error-600 min-w-[140px]"
          >
            {num2}
          </motion.span>
        </div>
      </motion.div>

      <div className="text-center mb-6">
        <p className="text-xl text-gray-600 font-display">请选择正确的比较符号</p>
      </div>

      <div className="flex justify-center gap-6 max-w-2xl mx-auto">
        {COMPARISON_OPTIONS.map((option, index) => (
          <motion.button
            key={`${question.id}-${option}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.8, type: 'spring' }}
            whileHover={!disabled ? { scale: 1.1, rotate: 5 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={() => handleSelect(option)}
            disabled={disabled || selectedAnswer !== null}
            className={`
              flex-1 max-w-[200px] py-8 px-4 rounded-3xl text-7xl font-display font-bold
              transition-all duration-200 shadow-cartoon
              ${selectedAnswer === option
                ? 'bg-error-500 text-white scale-110 rotate-0'
                : 'bg-white text-error-500 border-4 border-error-200 hover:border-error-400 hover:bg-error-50'
              }
              ${disabled || selectedAnswer !== null ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-2xl mb-2 font-body text-gray-500">{COMPARISON_LABELS[option]}</div>
            <div className="text-7xl">{option}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ComparisonQuestion;
