import type { VoiceEncouragement } from '@/types';

export const VOICE_ENCOURAGEMENTS: VoiceEncouragement[] = [
  {
    id: 'correct_1',
    text: '太棒了！答对了！',
    condition: 'correct'
  },
  {
    id: 'correct_2',
    text: '真聪明！继续加油！',
    condition: 'correct'
  },
  {
    id: 'correct_3',
    text: '你真是数学小天才！',
    condition: 'correct'
  },
  {
    id: 'correct_4',
    text: '完美！做得好！',
    condition: 'correct'
  },
  {
    id: 'correct_5',
    text: '好厉害！继续保持！',
    condition: 'correct'
  },
  {
    id: 'correct_6',
    text: '没错！你真棒！',
    condition: 'correct'
  },
  {
    id: 'combo_3',
    text: '三连击！太厉害了！',
    condition: 'combo',
    minCombo: 3
  },
  {
    id: 'combo_5',
    text: '五连击！你是最棒的！',
    condition: 'combo',
    minCombo: 5
  },
  {
    id: 'combo_10',
    text: '十连击！你是数学大师！',
    condition: 'combo',
    minCombo: 10
  },
  {
    id: 'combo_15',
    text: '十五连击！无人能敌！',
    condition: 'combo',
    minCombo: 15
  },
  {
    id: 'combo_20',
    text: '二十连击！你是神！',
    condition: 'combo',
    minCombo: 20
  },
  {
    id: 'level_complete_1',
    text: '恭喜通关！你真棒！',
    condition: 'level_complete'
  },
  {
    id: 'level_complete_2',
    text: '太厉害了！关卡完成！',
    condition: 'level_complete'
  },
  {
    id: 'level_complete_3',
    text: '完美通关！继续挑战吧！',
    condition: 'level_complete'
  },
  {
    id: 'encouragement_1',
    text: '没关系，再试一次！',
    condition: 'encouragement'
  },
  {
    id: 'encouragement_2',
    text: '别灰心，你可以的！',
    condition: 'encouragement'
  },
  {
    id: 'encouragement_3',
    text: '加油！再想想看！',
    condition: 'encouragement'
  },
  {
    id: 'encouragement_4',
    text: '失败是成功之母！',
    condition: 'encouragement'
  },
  {
    id: 'encouragement_5',
    text: '你已经很棒了，继续努力！',
    condition: 'encouragement'
  }
];

export const getRandomEncouragement = (
  condition: 'correct' | 'combo' | 'level_complete' | 'encouragement',
  combo?: number
): VoiceEncouragement => {
  let candidates = VOICE_ENCOURAGEMENTS.filter(e => e.condition === condition);
  
  if (condition === 'combo' && combo !== undefined) {
    const comboCandidates = candidates.filter(e => 
      e.minCombo !== undefined && combo >= e.minCombo
    );
    if (comboCandidates.length > 0) {
      candidates = comboCandidates;
    }
  }
  
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

export const speakText = (text: string, voiceEnabled: boolean = true): void => {
  if (!voiceEnabled || !('speechSynthesis' in window)) {
    return;
  }
  
  try {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('语音合成失败:', error);
  }
};

export const speakQuestion = (content: string, voiceEnabled: boolean = true): void => {
  if (!voiceEnabled || !('speechSynthesis' in window)) {
    return;
  }
  
  try {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.7;
    
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('语音合成失败:', error);
  }
};
