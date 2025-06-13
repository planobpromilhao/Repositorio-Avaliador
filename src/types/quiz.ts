export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    emoji?: string;
  }[];
  image?: string;
}

export interface QuizState {
  currentQuestion: number;
  totalCredits: number;
  answers: Record<number, string>;
  isCompleted: boolean;
  showRewardPopup: boolean;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}