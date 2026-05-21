
export interface LessonProgress {
  lessonId: string;
  stars: number;
  bestWpm: number;
  bestAccuracy: number;
  completed: boolean;
}

export const loadProgress = (): Record<string, LessonProgress> => {
  const saved = localStorage.getItem('typing_teacher_progress');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse progress', e);
    }
  }
  return {};
};

export const saveProgress = (progress: LessonProgress) => {
  const current = loadProgress();
  const existing = current[progress.lessonId];
  
  // Only update if better or first time
  if (!existing || progress.stars > existing.stars || progress.bestWpm > existing.bestWpm) {
    current[progress.lessonId] = {
      ...progress,
      stars: Math.max(progress.stars, existing?.stars || 0),
      bestWpm: Math.max(progress.bestWpm, existing?.bestWpm || 0),
      bestAccuracy: Math.max(progress.bestAccuracy, existing?.bestAccuracy || 0),
      completed: true
    };
    localStorage.setItem('typing_teacher_progress', JSON.stringify(current));
  }
};

export const isLessonUnlocked = (id: number): boolean => {
  if (id === 1) return true;
  const progress = loadProgress();
  const prevLesson = progress[(id - 1).toString()];
  return !!(prevLesson && prevLesson.completed);
};
