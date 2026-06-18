import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/types';
import { generateOptions } from '@/utils/helpers';

interface PatternQuestionProps {
  question: Question;
  onSubmit: (answer: string | number) => void;
  disabled?: boolean;
}

export const PatternQuestion: React.FC<PatternQuestionProps> = ({
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

  const { pattern, missingIndex } = question.displayData || question.data || {};
  const answer = typeof question.answer === 'number' ? question.answer : parseInt(String(question.answer), 10);
  const options = generateOptions(answer);

  const getEmoji = (index: number): string => {
    const emojis = ['🌟', '🎈', '🎨', '🎯', '🎪', '🎁', '🎠', '🎡', '🎢', '🎃'];
    return emojis[index % emojis.length];
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center mb-8"
      >
        <div className="mb-4">
          <span className="inline-block bg-accent-100 text-accent-700 px-6 py-2 rounded-full text-xl font-bold">
            🔍 找规律
          </span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-4">
          {pattern?.map((num: number, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.15, type: 'spring' }}
              className={`
                flex flex-col items-center min-w-[80px] md:min-w-[100px]
                ${index === missingIndex ? '' : ''}
              `}
            >
              <span className="text-2xl mb-1">{getEmoji(index)}</span>
              {index === missingIndex ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                  className="bg-gradient-to-br from-reward-400 to-reward-600 text-white px-5 py-4 rounded-3xl text-4xl md:text-5xl font-display font-bold shadow-lg border-4 border-reward-300 min-w-[90px]"
                >
                  ?
                </motion.div>
              ) : (
                <div className="bg-gradient-to-br from-accent-100 to-accent-200 text-accent-700 px-5 py-4 rounded-3xl text-4xl md:text-5xl font-display font-bold border-4 border-accent-300 min-w-[90px]">
                  {num}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-xl text-gray-600 font-display mt-4">
          按照规律，第 {missingIndex! + 1} 个数应该是多少？
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {options.map((option, index) => (
          <motion.button
            key={`${question.id}-${option}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.8, type: 'spring' }}
            whileHover={!disabled ? { scale: 1.1, rotate: 3 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={() => handleSelect(option)}
            disabled={disabled || selectedAnswer !== null}
            className={`
              py-6 px-4 rounded-3xl text-4xl font-display font-bold
              transition-all duration-200 shadow-cartoon
              ${selectedAnswer === option
                ? 'bg-reward-500 text-white scale-105'
                : 'bg-white text-reward-600 border-4 border-reward-200 hover:border-reward-400 hover:bg-reward-50'
              }
              ${disabled || selectedAnswer !== null ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PatternQuestion;
