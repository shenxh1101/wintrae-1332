import React from 'react';
import type { Question } from '@/types';
import { AdditionQuestion } from './AdditionQuestion';
import { SubtractionQuestion } from './SubtractionQuestion';
import { MultiplicationQuestion } from './MultiplicationQuestion';
import { DivisionQuestion } from './DivisionQuestion';
import { ComparisonQuestion } from './ComparisonQuestion';
import { PatternQuestion } from './PatternQuestion';
import { CompletionQuestion } from './CompletionQuestion';

interface GameQuestionRendererProps {
  question: Question;
  onSubmit: (answer: string | number) => void;
  disabled?: boolean;
}

export const GameQuestionRenderer: React.FC<GameQuestionRendererProps> = ({
  question,
  onSubmit,
  disabled = false
}) => {
  const props = { question, onSubmit, disabled };

  switch (question.type) {
    case 'addition':
      return <AdditionQuestion {...props} />;
    case 'subtraction':
      return <SubtractionQuestion {...props} />;
    case 'multiplication':
      return <MultiplicationQuestion {...props} />;
    case 'division':
      return <DivisionQuestion {...props} />;
    case 'comparison':
      return <ComparisonQuestion {...props} />;
    case 'pattern':
      return <PatternQuestion {...props} />;
    case 'completion':
      return <CompletionQuestion {...props} />;
    default:
      return (
        <div className="text-center py-12">
          <p className="text-2xl text-gray-500">未知题型</p>
        </div>
      );
  }
};

export default GameQuestionRenderer;
