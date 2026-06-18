import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/types';
import { generateOptions } from '@/utils/helpers';

interface CompletionQuestionProps {
  question: Question;
  onSubmit: (answer: string | number) => void;
  disabled?: boolean;
}

export const CompletionQuestion: React.FC<CompletionQuestionProps> = ({
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

  const { numbers, operators, blanks } = question.displayData || {};
  const data = question.data || {};
  const num1 = numbers?.[0] ?? data.num1;
  const num2 = numbers?.[1] ?? data.num2;
  const result = data.result;
  const operator = operators?.[0] ?? data.operator;
  const answer = typeof question.answer === 'number' ? question.answer : parseInt(String(question.answer), 10);
  const options = generateOptions(answer);

  const operatorSymbol: Record<string, string> = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷'
  };

  const hasMissingNum1 = num1 === null || num1 === undefined;
  const hasMissingNum2 = num2 === null || num2 === undefined;
  const hasMissingResult = result === null || result === undefined;

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
          <span className="inline-block bg-primary-100 text-primary-700 px-6 py-2 rounded-full text-xl font-bold">
            🧩 补全算式
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-5xl md:text-7xl font-display font-bold">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className={hasMissingNum1 ? '' : 'text-primary-700'}
          >
            {hasMissingNum1 ? (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                className="inline-block bg-gradient-to-br from-primary-400 to-primary-600 text-white px-5 py-3 rounded-2xl min-w-[90px] border-4 border-primary-300"
              >
                ?
              </motion.span>
            ) : (
              <span className="inline-block bg-accent-100 px-5 py-3 rounded-2xl text-accent-600 min-w-[90px] border-4 border-accent-200">
                {num1}
              </span>
            )}
          </motion.span>

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, type: 'spring' }}
            className="text-primary-500 text-5xl"
          >
            {operatorSymbol[operator as string] || '?'}
          </motion.span>

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className={hasMissingNum2 ? '' : 'text-primary-700'}
          >
            {hasMissingNum2 ? (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                className="inline-block bg-gradient-to-br from-primary-400 to-primary-600 text-white px-5 py-3 rounded-2xl min-w-[90px] border-4 border-primary-300"
              >
                ?
              </motion.span>
            ) : (
              <span className="inline-block bg-accent-100 px-5 py-3 rounded-2xl text-accent-600 min-w-[90px] border-4 border-accent-200">
                {num2}
              </span>
            )}
          </motion.span>

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.55, type: 'spring' }}
            className="text-primary-500 text-5xl"
          >
            =
          </motion.span>

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
            className={hasMissingResult ? '' : 'text-primary-700'}
          >
            {hasMissingResult ? (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                className="inline-block bg-gradient-to-br from-primary-400 to-primary-600 text-white px-5 py-3 rounded-2xl min-w-[90px] border-4 border-primary-300"
              >
                ?
              </motion.span>
            ) : (
              <span className="inline-block bg-primary-100 px-5 py-3 rounded-2xl text-primary-600 min-w-[90px] border-4 border-primary-200">
                {result}
              </span>
            )}
          </motion.span>
        </div>

        <p className="text-xl text-gray-600 font-display mt-6">
          请找出缺失的数字，使算式成立！
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {options.map((option, index) => (
          <motion.button
            key={`${question.id}-${option}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.9, type: 'spring' }}
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
      </div>
    </div>
  );
};

export default CompletionQuestion;
