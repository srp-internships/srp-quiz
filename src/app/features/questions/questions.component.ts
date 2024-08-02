import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../shared/services/quiz.service';
import { Quiz, Variant } from '../../interface/quiz.interface';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'srp-questions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnInit {
  quizzes: Quiz[] = [];
  currentQuizIndex: number = 0;
  selectedAnswers: { [key: string]: boolean } = {};
  showResult: boolean = false;
  isLastQuestion: boolean = false;
  correctAnswersCount: number = 0;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('categoryId');
    if (categoryId) {
      this.quizService.getQuizzesByCategory(categoryId).subscribe((quizzes) => {
        this.quizzes = quizzes;
        this.checkIfLastQuestion();
      });
    }
  }

  selectAnswer(variant: Variant): void {
    if (!this.showResult) {
      if (this.quizzes[this.currentQuizIndex].multiple) {
        this.selectedAnswers[variant.letter] = !this.selectedAnswers[variant.letter];
      } else {
        this.selectedAnswers = { [variant.letter]: true };
      }
      this.errorMessage = null;
    }
  }

  isSelected(variant: Variant): boolean {
    return this.selectedAnswers[variant.letter] || false;
  }

  submitOrNext(): void {
    if (!this.showResult) {
      const anyAnswerSelected = Object.values(this.selectedAnswers).includes(true);

      if (!anyAnswerSelected) {
        this.toast.error('Please select at least one answer.');
        return;
      }

      this.showResult = true;
      this.calculateCorrectAnswers();
    } else {
      if (this.currentQuizIndex < this.quizzes.length - 1) {
        this.currentQuizIndex++;
        this.selectedAnswers = {};
        this.showResult = false;
        this.errorMessage = null;

        this.checkIfLastQuestion();
      } else {
        this.router.navigate(['/rating'], {
          queryParams: {
            correct: this.correctAnswersCount,
            total: this.quizzes.length
          }
        });
      }
    }
  }

  private checkIfLastQuestion(): void {
    this.isLastQuestion = this.currentQuizIndex === this.quizzes.length - 1;
  }

  private calculateCorrectAnswers(): void {
    const currentQuiz = this.quizzes[this.currentQuizIndex];
    const selectedAnswers = new Set<string>(
      Object.keys(this.selectedAnswers).filter(
        (letter) => this.selectedAnswers[letter]
      )
    );
    const correctAnswers = new Set<string>(
      currentQuiz.variants
        .filter((variant) => variant.correct)
        .map((variant) => variant.letter)
    );

    const isCorrect = currentQuiz.multiple
      ? correctAnswers.size === selectedAnswers.size &&
        [...correctAnswers].every((answer) => selectedAnswers.has(answer))
      : correctAnswers.has([...selectedAnswers][0]);

    if (isCorrect) {
      this.correctAnswersCount++;
    }
  }
}
