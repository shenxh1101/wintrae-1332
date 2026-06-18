import type { Question, DifficultyLevel, QuestionType } from '@/types';
import { generateId, getRandomInt, generateOptions, getDifficultyNumberRange } from '@/utils/helpers';
import { QUESTION_TYPE_CONFIG } from '@/constants/gameConfig';

function generateAdditionQuestion(difficulty: DifficultyLevel): Question {
  const [min, max] = getDifficultyNumberRange(difficulty);
  const a = getRandomInt(min, max);
  const b = getRandomInt(min, max);
  const answer = a + b;
  
  return {
    id: generateId(),
    type: 'addition',
    difficulty,
    content: `${a} + ${b} = ?`,
    answer,
    options: generateOptions(answer, 4, [-5, 5]),
    hint: `先算 ${a} + ${b}，可以从 ${a} 开始数 ${b} 个数`,
    inputType: 'click',
    data: { num1: a, num2: b, result: answer, operator: '+' },
    displayData: {
      expression: `${a} + ${b} = ?`,
      numbers: [a, b],
      operators: ['+']
    }
  };
}

function generateSubtractionQuestion(difficulty: DifficultyLevel): Question {
  const [min, max] = getDifficultyNumberRange(difficulty);
  let a = getRandomInt(min, max);
  let b = getRandomInt(min, max);
  
  if (a < b) {
    [a, b] = [b, a];
  }
  
  const answer = a - b;
  
  return {
    id: generateId(),
    type: 'subtraction',
    difficulty,
    content: `${a} - ${b} = ?`,
    answer,
    options: generateOptions(answer, 4, [-5, 5]),
    hint: `从 ${a} 中减去 ${b}，可以倒着数 ${b} 个数`,
    inputType: 'click',
    data: { num1: a, num2: b, result: answer, operator: 'subtraction' },
    displayData: {
      expression: `${a} - ${b} = ?`,
      numbers: [a, b],
      operators: ['-']
    }
  };
}

function generateMultiplicationQuestion(difficulty: DifficultyLevel): Question {
  const maxFactor = Math.min(9 + Math.floor(difficulty / 2), 20);
  const a = getRandomInt(1, maxFactor);
  const b = getRandomInt(1, maxFactor);
  const answer = a * b;
  
  return {
    id: generateId(),
    type: 'multiplication',
    difficulty,
    content: `${a} × ${b} = ?`,
    answer,
    options: generateOptions(answer, 4, [-10, 10]),
    hint: `想想乘法口诀，${a} 乘 ${b} 等于多少？`,
    inputType: 'click',
    displayData: {
      expression: `${a} × ${b} = ?`,
      numbers: [a, b],
      operators: ['×']
    }
  };
}

function generateDivisionQuestion(difficulty: DifficultyLevel): Question {
  const maxFactor = Math.min(9 + Math.floor(difficulty / 2), 20);
  const b = getRandomInt(1, maxFactor);
  const answer = getRandomInt(1, maxFactor);
  const a = b * answer;
  
  return {
    id: generateId(),
    type: 'division',
    difficulty,
    content: `${a} ÷ ${b} = ?`,
    answer,
    options: generateOptions(answer, 4, [-3, 3]),
    hint: `想想乘法口诀，${b} 乘多少等于 ${a}？`,
    inputType: 'click',
    data: { dividend: a, divisor: b, num1: a, num2: b, result: answer, operator: 'division' },
    displayData: {
      expression: `${a} ÷ ${b} = ?`,
      numbers: [a, b],
      operators: ['÷']
    }
  };
}

function generateComparisonQuestion(difficulty: DifficultyLevel): Question {
  const [min, max] = getDifficultyNumberRange(difficulty);
  let a = getRandomInt(min, max);
  let b = getRandomInt(min, max);
  
  while (a === b) {
    b = getRandomInt(min, max);
  }
  
  const correctAnswer = a > b ? '>' : a < b ? '<' : '=';
  
  return {
    id: generateId(),
    type: 'comparison',
    difficulty,
    content: `比较大小：${a}  ?  ${b}`,
    answer: correctAnswer,
    options: ['>', '<', '='],
    hint: `数一数两个数各是多少，看看哪个更大`,
    inputType: 'click',
    data: { num1: a, num2: b, left: a, right: b },
    displayData: {
      comparison: { left: a, right: b }
    }
  };
}

function generatePatternQuestion(difficulty: DifficultyLevel): Question {
  const patternTypes = ['arithmetic', 'geometric', 'fibonacci'] as const;
  const patternType = patternTypes[Math.min(Math.floor(difficulty / 3), patternTypes.length - 1)];
  
  let pattern: number[] = [];
  let answer: number;
  
  if (patternType === 'arithmetic') {
    const step = getRandomInt(1, Math.min(5 + difficulty, 20));
    const start = getRandomInt(1, 50);
    pattern = [start, start + step, start + step * 2, start + step * 3];
    answer = start + step * 4;
  } else if (patternType === 'geometric' && difficulty >= 5) {
    const ratio = getRandomInt(2, 4);
    const start = getRandomInt(1, 10);
    pattern = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
    answer = start * ratio * ratio * ratio * ratio;
  } else {
    let a = getRandomInt(1, 10);
    let b = getRandomInt(1, 10);
    pattern = [a, b];
    for (let i = 2; i < 5; i++) {
      const next = pattern[i - 1] + pattern[i - 2];
      pattern.push(next);
    }
    answer = pattern[4];
    pattern = pattern.slice(0, 4);
  }
  
  return {
    id: generateId(),
    type: 'pattern',
    difficulty,
    content: `找规律：${pattern.join(', ')}, ?`,
    answer,
    options: generateOptions(answer, 4, [-10, 10]),
    hint: `看看相邻两个数之间的差或比值有什么规律`,
    inputType: 'click',
    displayData: {
      pattern: [...pattern, NaN]
    }
  };
}

function generateCompletionQuestion(difficulty: DifficultyLevel): Question {
  const [min, max] = getDifficultyNumberRange(difficulty);
  const operators = ['+', '-', '×', '÷'];
  const operator = operators[getRandomInt(0, Math.min(difficulty > 3 ? 3 : 1, 3))];
  
  let a: number, b: number, answer: number, blankPosition: number;
  
  if (operator === '+') {
    a = getRandomInt(min, max);
    b = getRandomInt(min, max);
    answer = a + b;
    blankPosition = getRandomInt(0, 2);
  } else if (operator === '-') {
    a = getRandomInt(min, max);
    b = getRandomInt(min, a);
    answer = a - b;
    blankPosition = getRandomInt(0, 2);
  } else if (operator === '×') {
    const maxFactor = Math.min(9 + Math.floor(difficulty / 2), 20);
    a = getRandomInt(1, maxFactor);
    b = getRandomInt(1, maxFactor);
    answer = a * b;
    blankPosition = getRandomInt(0, 2);
  } else {
    b = getRandomInt(1, 10);
    answer = getRandomInt(1, 10);
    a = b * answer;
    blankPosition = getRandomInt(0, 2);
  }
  
  let content: string;
  let displayNumbers: number[];
  let blanks: number[];
  
  if (blankPosition === 0) {
    content = `? ${operator} ${b} = ${answer}`;
    displayNumbers = [NaN, b, answer];
    blanks = [0];
  } else if (blankPosition === 1) {
    content = `${a} ${operator} ? = ${answer}`;
    displayNumbers = [a, NaN, answer];
    blanks = [1];
  } else {
    content = `${a} ${operator} ${b} = ?`;
    displayNumbers = [a, b, NaN];
    blanks = [2];
  }
  
  const correctAnswer = blankPosition === 0 ? a : blankPosition === 1 ? b : answer;
  
  return {
    id: generateId(),
    type: 'completion',
    difficulty,
    content,
    answer: correctAnswer,
    options: generateOptions(correctAnswer, 4, [-5, 5]),
    hint: `可以把问号当作未知数，用逆运算来求解`,
    inputType: 'click',
    data: {
      num1: blankPosition === 0 ? null : a,
      num2: blankPosition === 1 ? null : b,
      result: blankPosition === 2 ? null : answer,
      operator: operator === '+' ? 'addition' : operator === '-' ? 'subtraction' : operator === '×' ? 'multiplication' : 'division'
    },
    displayData: {
      expression: content,
      numbers: displayNumbers,
      operators: [operator],
      blanks
    }
  };
}

const questionGenerators: Record<QuestionType, (difficulty: DifficultyLevel) => Question> = {
  addition: generateAdditionQuestion,
  subtraction: generateSubtractionQuestion,
  multiplication: generateMultiplicationQuestion,
  division: generateDivisionQuestion,
  comparison: generateComparisonQuestion,
  pattern: generatePatternQuestion,
  completion: generateCompletionQuestion
};

export function generateQuestion(
  type: QuestionType,
  difficulty: DifficultyLevel
): Question {
  const generator = questionGenerators[type];
  if (!generator) {
    throw new Error(`未知的题目类型: ${type}`);
  }
  return generator(difficulty);
}

export function generateRandomQuestion(
  types: QuestionType[],
  difficulty: DifficultyLevel
): Question {
  if (types.length === 0) {
    throw new Error('题目类型列表不能为空');
  }
  
  const randomType = types[Math.floor(Math.random() * types.length)];
  return generateQuestion(randomType, difficulty);
}

export function generateQuestionBatch(
  types: QuestionType[],
  difficulty: DifficultyLevel,
  count: number
): Question[] {
  const questions: Question[] = [];
  const typeCount = types.length;
  
  for (let i = 0; i < count; i++) {
    const typeIndex = i % typeCount;
    const type = types[typeIndex];
    questions.push(generateQuestion(type, difficulty));
  }
  
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  
  return questions;
}

export function getQuestionHint(question: Question): string {
  return question.hint || '仔细想想，你一定能做出来的！';
}

export function getQuestionTypeName(type: QuestionType): string {
  return QUESTION_TYPE_CONFIG[type]?.name || type;
}

export default {
  generateQuestion,
  generateRandomQuestion,
  generateQuestionBatch,
  getQuestionHint,
  getQuestionTypeName
};
