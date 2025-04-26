
// Track ad display frequency
const AD_DISPLAY_INTERVAL = 2 * 60 * 1000; // 2 minutes minimum between ads
let lastAdDisplay = 0;

// Check if enough time has passed to show another ad
export const canShowAd = () => {
  const now = Date.now();
  if (now - lastAdDisplay >= AD_DISPLAY_INTERVAL) {
    lastAdDisplay = now;
    return true;
  }
  return false;
};

// Counter for quiz completions
let quizCompletionCount = 0;
export const shouldShowQuizCompletionAd = () => {
  quizCompletionCount++;
  // Show ad every 2 quiz completions
  return quizCompletionCount % 2 === 0 && canShowAd();
};

// Counter for flashcard sessions
let flashcardSessionCount = 0;
export const shouldShowFlashcardCompletionAd = () => {
  flashcardSessionCount++;
  // Show ad every 2 flashcard session completions
  return flashcardSessionCount % 2 === 0 && canShowAd();
};

