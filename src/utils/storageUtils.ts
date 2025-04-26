
import { Question } from "@/components/FileUpload";
import { Flashcard } from "@/components/Flashcards/FlashcardsGenerator";

// Constants for storage keys
const STORAGE_KEYS = {
  QUIZ_HISTORY: 'quizHistory',
  QUIZ_IN_PROGRESS: 'quizInProgress',
  FLASHCARDS_HISTORY: 'flashcardsHistory',
  CURRENT_FLASHCARD_SET: 'currentFlashcardSet',
  USER_SETTINGS: 'userSettings'
} as const;

// Quiz related functions
export const saveQuizToHistory = (quiz: any) => {
  try {
    const existingHistory = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Check if this quiz already exists (by id)
    const existingQuizIndex = history.findIndex((item: any) => item.id === quiz.id);
    
    let updatedHistory;
    if (existingQuizIndex >= 0) {
      // Update the existing quiz entry
      updatedHistory = [...history];
      updatedHistory[existingQuizIndex] = quiz;
    } else {
      // Add as a new entry
      updatedHistory = [quiz, ...history];
    }
    
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error saving quiz to history:', error);
    return false;
  }
};

export const getQuizHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting quiz history:', error);
    return [];
  }
};

export const saveQuizProgress = (progress: {
  questions: Question[];
  currentIndex: number;
  userAnswers: number[];
  timings: number[];
  title: string;
  startTime: string;
}) => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_IN_PROGRESS, JSON.stringify({
      ...progress,
      lastUpdated: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    console.error('Error saving quiz progress:', error);
    return false;
  }
};

export const getQuizProgress = () => {
  try {
    const progress = localStorage.getItem(STORAGE_KEYS.QUIZ_IN_PROGRESS);
    return progress ? JSON.parse(progress) : null;
  } catch (error) {
    console.error('Error getting quiz progress:', error);
    return null;
  }
};

// Flashcard related functions
export const saveFlashcardsToHistory = (flashcardSet: {
  id: string;
  title: string;
  cards: Flashcard[];
  created_at: string;
  subject?: string;
  course?: string;
  topic?: string;
}) => {
  try {
    const existingHistory = localStorage.getItem(STORAGE_KEYS.FLASHCARDS_HISTORY);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Check if a set with this ID already exists
    const existingSetIndex = history.findIndex((set: any) => set.id === flashcardSet.id);
    
    let updatedHistory;
    if (existingSetIndex >= 0) {
      // Update existing entry instead of creating a duplicate
      updatedHistory = [...history];
      updatedHistory[existingSetIndex] = {
        ...flashcardSet,
        updated_at: new Date().toISOString()
      };
    } else {
      // Add as new entry
      updatedHistory = [
        {
          ...flashcardSet,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        ...history
      ];
    }
    
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS_HISTORY, JSON.stringify(updatedHistory));
    console.log("Updated flashcard history:", updatedHistory);
    return true;
  } catch (error) {
    console.error('Error saving flashcards to history:', error);
    return false;
  }
};

export const getFlashcardsHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.FLASHCARDS_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting flashcards history:', error);
    return [];
  }
};

export const saveCurrentFlashcardSet = (set: {
  id: string;
  title: string;
  cards: Flashcard[];
  mode: string;
  subject?: string;
  course?: string;
  topic?: string;
}) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_FLASHCARD_SET, JSON.stringify({
      ...set,
      lastUpdated: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    console.error('Error saving current flashcard set:', error);
    return false;
  }
};

export const getCurrentFlashcardSet = () => {
  try {
    const set = localStorage.getItem(STORAGE_KEYS.CURRENT_FLASHCARD_SET);
    return set ? JSON.parse(set) : null;
  } catch (error) {
    console.error('Error getting current flashcard set:', error);
    return null;
  }
};

// Utility function to clear specific data
export const clearData = (key: keyof typeof STORAGE_KEYS) => {
  try {
    localStorage.removeItem(STORAGE_KEYS[key]);
    return true;
  } catch (error) {
    console.error(`Error clearing ${key}:`, error);
    return false;
  }
};

// Utility to ensure persistence by syncing with localStorage
export const syncDataWithStorage = () => {
  const keys = Object.values(STORAGE_KEYS);
  const data: Record<string, any> = {};
  
  keys.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        data[key] = JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error syncing ${key} with storage:`, error);
    }
  });
  
  return data;
};
