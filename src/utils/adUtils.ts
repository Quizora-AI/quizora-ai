
const AD_FREQUENCY = {
  QUIZ_COMPLETION: 2, // Show ad every 2 quiz completions
  FLASHCARD_COMPLETION: 2, // Show ad every 2 flashcard completions
};

let quizCompletionCount = 0;
let flashcardCompletionCount = 0;

export const shouldShowQuizCompletionAd = () => {
  quizCompletionCount++;
  return quizCompletionCount % AD_FREQUENCY.QUIZ_COMPLETION === 0;
};

export const shouldShowFlashcardCompletionAd = () => {
  flashcardCompletionCount++;
  return flashcardCompletionCount % AD_FREQUENCY.FLASHCARD_COMPLETION === 0;
};
