import Dexie, { Table } from 'dexie';
import type { GameRecord, WrongQuestion, DailyStats, QuestionTypeStats } from '@/types';
import { formatDate } from '@/utils/helpers';

export class MathWizardDatabase extends Dexie {
  gameRecords!: Table<GameRecord>;
  wrongQuestions!: Table<WrongQuestion>;
  dailyStats!: Table<DailyStats>;

  constructor() {
    super('MathWizardDB');
    
    this.version(1).stores({
      gameRecords: 'id, date, mode, levelId, createdAt',
      wrongQuestions: 'id, type, content, wrongCount, lastWrongDate, createdAt',
      dailyStats: 'date'
    });
  }

  async addGameRecord(record: Omit<GameRecord, 'id' | 'createdAt'>): Promise<string> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRecord: GameRecord = {
      ...record,
      id,
      createdAt: Date.now()
    };
    await this.gameRecords.add(newRecord);
    
    await this.updateDailyStats(record);
    
    return id;
  }

  async getGameRecords(limit?: number): Promise<GameRecord[]> {
    let query = this.gameRecords.orderBy('createdAt').reverse();
    if (limit) {
      query = query.limit(limit);
    }
    return query.toArray();
  }

  async getGameRecordsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<GameRecord[]> {
    return this.gameRecords
      .where('date')
      .between(startDate, endDate, true, true)
      .reverse()
      .sortBy('createdAt');
  }

  async getGameRecordsByMode(mode: string, limit?: number): Promise<GameRecord[]> {
    let query = this.gameRecords.where('mode').equals(mode).reverse();
    if (limit) {
      query = query.limit(limit);
    }
    return query.sortBy('createdAt');
  }

  async addWrongQuestion(
    question: Omit<WrongQuestion, 'id' | 'wrongCount' | 'lastWrongDate' | 'createdAt'>
  ): Promise<string> {
    const existing = await this.wrongQuestions
      .where('content')
      .equals(question.content)
      .first();

    if (existing) {
      existing.wrongCount += 1;
      existing.lastWrongDate = formatDate(new Date());
      existing.userAnswer = question.userAnswer;
      await this.wrongQuestions.put(existing);
      return existing.id;
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newQuestion: WrongQuestion = {
      ...question,
      id,
      wrongCount: 1,
      lastWrongDate: formatDate(new Date()),
      createdAt: Date.now()
    };
    await this.wrongQuestions.add(newQuestion);
    return id;
  }

  async getWrongQuestions(limit?: number): Promise<WrongQuestion[]> {
    let query = this.wrongQuestions.orderBy('wrongCount').reverse();
    if (limit) {
      query = query.limit(limit);
    }
    return query.toArray();
  }

  async getWrongQuestionsByType(type: string): Promise<WrongQuestion[]> {
    return this.wrongQuestions
      .where('type')
      .equals(type)
      .reverse()
      .sortBy('wrongCount');
  }

  async deleteWrongQuestion(id: string): Promise<void> {
    await this.wrongQuestions.delete(id);
  }

  async reduceWrongQuestionCount(id: string): Promise<void> {
    const existing = await this.wrongQuestions.get(id);
    if (existing) {
      existing.wrongCount -= 1;
      if (existing.wrongCount <= 0) {
        await this.wrongQuestions.delete(id);
      } else {
        await this.wrongQuestions.put(existing);
      }
    }
  }

  async clearWrongQuestions(): Promise<void> {
    await this.wrongQuestions.clear();
  }

  private async updateDailyStats(record: Omit<GameRecord, 'id' | 'createdAt'>): Promise<void> {
    const today = record.date;
    const existing = await this.dailyStats.get(today);

    if (existing) {
      existing.playTime += record.playTime;
      existing.questionsAnswered += record.totalCount;
      existing.correctCount += record.correctCount;
      existing.accuracy = existing.questionsAnswered > 0 ? existing.correctCount / existing.questionsAnswered : 0;
      await this.dailyStats.put(existing);
    } else {
      const newStats: DailyStats = {
        date: today,
        playTime: record.playTime,
        questionsAnswered: record.totalCount,
        correctCount: record.correctCount,
        accuracy: record.totalCount > 0 ? record.correctCount / record.totalCount : 0
      };
      await this.dailyStats.add(newStats);
    }
  }

  async getDailyStats(startDate: string, endDate: string): Promise<DailyStats[]> {
    return this.dailyStats
      .where('date')
      .between(startDate, endDate, true, true)
      .sortBy('date');
  }

  async getQuestionTypeStats(startDate?: string, endDate?: string): Promise<QuestionTypeStats[]> {
    let records: GameRecord[];
    
    if (startDate && endDate) {
      records = await this.getGameRecordsByDateRange(startDate, endDate);
    } else {
      records = await this.getGameRecords();
    }

    const typeStats: Record<string, QuestionTypeStats> = {};
    const typeResponseTimes: Record<string, number> = {};
    const typeWeights: Record<string, number> = {};

    for (const record of records) {
      if (record.perTypeStats && Object.keys(record.perTypeStats).length > 0) {
        for (const [type, stat] of Object.entries(record.perTypeStats)) {
          if (!typeStats[type]) {
            typeStats[type] = {
              type: type as any,
              total: 0,
              correct: 0,
              accuracy: 0,
              avgResponseTime: 0
            };
            typeResponseTimes[type] = 0;
            typeWeights[type] = 0;
          }
          typeStats[type].total += stat.total;
          typeStats[type].correct += stat.correct;
          if (record.avgResponseTime && stat.total > 0) {
            typeResponseTimes[type] += record.avgResponseTime * stat.total;
            typeWeights[type] += stat.total;
          }
        }
      } else {
        const fallbackType = record.levelId ? `level_${record.levelId}` : record.mode;
        if (!typeStats[fallbackType]) {
          typeStats[fallbackType] = {
            type: fallbackType as any,
            total: 0,
            correct: 0,
            accuracy: 0,
            avgResponseTime: 0
          };
          typeResponseTimes[fallbackType] = 0;
          typeWeights[fallbackType] = 0;
        }
        typeStats[fallbackType].total += record.totalCount;
        typeStats[fallbackType].correct += record.correctCount;
        if (record.avgResponseTime && record.totalCount > 0) {
          typeResponseTimes[fallbackType] += record.avgResponseTime * record.totalCount;
          typeWeights[fallbackType] += record.totalCount;
        }
      }
    }

    return Object.entries(typeStats).map(([type, stat]) => ({
      ...stat,
      type: type as any,
      accuracy: stat.total > 0 ? stat.correct / stat.total : 0,
      avgResponseTime: (typeWeights[type] || 0) > 0 ? (typeResponseTimes[type] || 0) / typeWeights[type] : 0
    }));
  }

  async getOverallStats(): Promise<{
    totalGames: number;
    totalQuestions: number;
    totalCorrect: number;
    overallAccuracy: number;
    avgResponseTime: number;
    totalPlayTime: number;
  }> {
    const records = await this.getGameRecords();
    
    if (records.length === 0) {
      return {
        totalGames: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        overallAccuracy: 0,
        avgResponseTime: 0,
        totalPlayTime: 0
      };
    }

    const totalGames = records.length;
    const totalQuestions = records.reduce((sum, r) => sum + r.totalCount, 0);
    const totalCorrect = records.reduce((sum, r) => sum + r.correctCount, 0);
    const totalPlayTime = records.reduce((sum, r) => sum + r.playTime, 0);
    const totalResponseTime = records.reduce((sum, r) => sum + r.avgResponseTime * r.totalCount, 0);

    return {
      totalGames,
      totalQuestions,
      totalCorrect,
      overallAccuracy: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
      avgResponseTime: totalQuestions > 0 ? totalResponseTime / totalQuestions : 0,
      totalPlayTime
    };
  }

  async getWeeklyStats(): Promise<DailyStats[]> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.getDailyStats(formatDate(weekAgo), formatDate(today));
  }

  async getMonthlyStats(): Promise<DailyStats[]> {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.getDailyStats(formatDate(monthAgo), formatDate(today));
  }

  async clearAllData(): Promise<void> {
    await this.gameRecords.clear();
    await this.wrongQuestions.clear();
    await this.dailyStats.clear();
  }

  async exportData(): Promise<string> {
    const gameRecords = await this.getGameRecords();
    const wrongQuestions = await this.getWrongQuestions();
    const dailyStats = await this.getDailyStats('1970-01-01', formatDate(new Date()));

    const data = {
      exportDate: formatDate(new Date()),
      version: '1.0.0',
      gameRecords,
      wrongQuestions,
      dailyStats
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.gameRecords) {
        await this.gameRecords.bulkPut(data.gameRecords);
      }
      if (data.wrongQuestions) {
        await this.wrongQuestions.bulkPut(data.wrongQuestions);
      }
      if (data.dailyStats) {
        await this.dailyStats.bulkPut(data.dailyStats);
      }
      
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

export const db = new MathWizardDatabase();

export default db;
