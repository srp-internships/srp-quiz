import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { QuizService } from '../../../core/service/quiz.service';
import { Variant } from '../../../interface/quiz.interface';

@Component({
  selector: 'srp-modal-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-quiz.component.html',
  styleUrls: ['./modal-quiz.component.scss']
})
export class ModalQuizComponent implements OnInit {
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  categories$: Observable<any[]> | undefined;
  newQuiz: { question: string; categoryId: string; variants: Variant[] } = {
    question: '',
    categoryId: '',
    variants: [
      { letter: 'A', variant: '', correct: false }
    ]
  };

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  async onCreateQuiz() {
    if (this.newQuiz.question && this.newQuiz.categoryId && this.newQuiz.variants.every((v: Variant) => v.variant)) {
      try {
        await this.quizService.addQuiz(this.newQuiz);
        this.closeModal.emit();
        this.resetForm();
      } catch (error) {
        console.error('error:', error);
      }
    }
  }

  onCloseModal() {
    this.closeModal.emit();
    this.resetForm();
  }

  addVariant() {
    if (this.newQuiz.variants.length < 8) { 
      const lastVariant = this.newQuiz.variants[this.newQuiz.variants.length - 1];
      const nextLetter = this.getNextLetter(lastVariant?.letter || 'A'); 
      this.newQuiz.variants.push({ letter: nextLetter, variant: '', correct: false });
    }
  }

  removeVariant(index: number) {
    this.newQuiz.variants.splice(index, 1);
    this.updateLetters(); 
  }

  resetForm() {
    this.newQuiz = {
      question: '',
      categoryId: '',
      variants: [
        { letter: 'A', variant: '', correct: false }
      ]
    };
  }

  async fetchCategories(): Promise<void> {
    this.categories$ = this.quizService.getCategories();
  }

  getNextLetter(currentLetter: string): string {
    const currentCharCode = currentLetter.charCodeAt(0);
    const nextCharCode = currentCharCode + 1;
    return String.fromCharCode(nextCharCode);
  }

  updateLetters() {
    for (let i = 0; i < this.newQuiz.variants.length; i++) {
      this.newQuiz.variants[i].letter = String.fromCharCode(65 + i);
    }
  }
}
