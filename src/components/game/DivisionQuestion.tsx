import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/types';
import { generateOptions } from '@/utils/helpers';

interface DivisionQuestionProps {
  question: Question;
  onSubmit: (answer: string | number) => void;
  disabled?: boolean;
}

export const DivisionQuestion: React.FC<DivisionQuestionProps> = ({
  question,
  onSubmit,
  disabled = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [question.id]);

  const handleSelect = useCallback((answer: number) => {
    if (disabled) return;
    setSelectedAnswer(answer);
    setTimeout(() => onSubmit(answer), 300);
  }, [disabled, onSubmit]);

  const { dividend, divisor } = question.data || {};
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
            className="bg-success-100 px-6 py-4 rounded-3xl text-success-600 min-w-[120px]"
          >
            {dividend}
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-primary-500 text-5xl"
          >
            ÷
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="bg-success-100 px-6 py-4 rounded-3xl text-success-600 min-w-[120px]"
          >
            {divisor}
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
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
            className={`py-6 px-4 rounded-3xl text-4xl font-display font-bold transition-all duration-200 shadow-cartoon ${
              selectedAnswer === option
                ? 'bg-success-500 text-white scale-105'
                : 'bg-white text-primary-600 border-4 border-primary-200 hover:border-success-400 hover:bg-success-50'
            } ${disabled || selectedAnswer !== null ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DivisionQuestion;
