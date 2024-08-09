export interface Quiz {
  id?: string;
  categoryId: string;
  multiple: boolean;
  question: string;
  variants: Variant[];
}

export interface Variant {
  letter: string;
  variant: string;
}

export type SelectedVariant = { correct: boolean } & Variant;

export interface QuizCorrect {
  corrects: string[];
}
