import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../shared/services/quiz.service';
import { CorrectsService } from '../../shared/services/corrects.service';
import { Quiz, Variant, QuizCorrect } from '../../interface/quiz.interface';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { WarningComponent } from '../../shared/warning-component/warning-component.component';

@Component({
  selector: 'srp-questions',
  standalone: true,
  imports: [CommonModule , WarningComponent],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss',
})
export class QuestionsComponent implements OnInit {
  quizzes: Quiz[] = [];
  currentQuizIndex: number = 0;
  selectedAnswers: { [key: string]: boolean } = {};
  showResult: boolean = false;
  isLastQuestion: boolean = false;
  correctAnswersCount: number = 0;
  errorMessage: string | null = null;
  completedTests: {
    categoryId: string;
    results: {
      quiz: Quiz;
      selectedAnswers: string[];
      correctVariants: string[];
      isCorrect: boolean;
    }[];
  }[] = [];
  showWarning: boolean = false;
  warningMessage: string = "Are you sure you want to exit the test?. Results will not be saved";


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private correctsService: CorrectsService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('categoryId');
    if (categoryId) {
      this.quizService.getQuizzesByCategory(categoryId).subscribe((quizzes) => {
        this.quizzes = this.shuffleArray(quizzes);
        this.checkIfLastQuestion();
      });
    }
  }

  selectAnswer(variant: Variant): void {
    if (!this.showResult) {
      if (this.quizzes[this.currentQuizIndex].multiple) {
        this.selectedAnswers[variant.letter] =
          !this.selectedAnswers[variant.letter];
      } else {
        this.selectedAnswers = { [variant.letter]: true };
      }
      this.errorMessage = null;
    }
  }

  isSelected(variant: Variant): boolean {
    return this.selectedAnswers[variant.letter] || false;
  }

  async submitOrNext(): Promise<void> {
    const anyAnswerSelected = Object.values(this.selectedAnswers).includes(
      true
    );

    if (!anyAnswerSelected) {
      this.toast.error('Please select at least one answer.');
      this.showResult = false;
      return;
    }

    this.showResult = true;
    await this.calculateCorrectAnswers();

    if (this.currentQuizIndex < this.quizzes.length - 1) {
      this.currentQuizIndex++;
      this.selectedAnswers = {};
      this.showResult = false;
      this.errorMessage = null;

      this.checkIfLastQuestion();
    } else {
      this.saveCompletedTest();
      const categoryId = this.route.snapshot.paramMap.get('categoryId');
      if (categoryId) {
        this.router.navigate(['/rating', categoryId], {
          queryParams: {
            correct: this.correctAnswersCount,
            total: this.quizzes.length,
          },
        });
      }
    }
  }

  private checkIfLastQuestion(): void {
    this.isLastQuestion = this.currentQuizIndex === this.quizzes.length - 1;
  }

  private async calculateCorrectAnswers(): Promise<void> {
    const currentQuiz = this.quizzes[this.currentQuizIndex];

    const selectedAnswers = new Set<string>(
      Object.keys(this.selectedAnswers).filter(
        (letter) => this.selectedAnswers[letter]
      )
    );

    if (currentQuiz.id) {
      const correctAnswers = await this.correctsService.getCorrects(
        currentQuiz.id
      );
      if (correctAnswers) {
        const correctAnswersSet = new Set<string>(correctAnswers.corrects);

        const isCorrect = currentQuiz.multiple
          ? correctAnswersSet.size === selectedAnswers.size &&
            [...correctAnswersSet].every((answer) =>
              selectedAnswers.has(answer)
            )
          : correctAnswersSet.has([...selectedAnswers][0]);

        if (isCorrect) {
          this.correctAnswersCount++;
        }

        this.saveQuizResult(
          currentQuiz,
          Array.from(selectedAnswers),
          Array.from(correctAnswersSet),
          isCorrect
        );
      }
    }
  }

  private saveQuizResult(
    quiz: Quiz,
    selectedAnswers: string[],
    correctVariants: string[],
    isCorrect: boolean
  ): void {
    const categoryId = this.route.snapshot.paramMap.get('categoryId');
    if (categoryId) {
      const existingTest = this.completedTests.find(
        (test) => test.categoryId === categoryId
      );
      if (existingTest) {
        existingTest.results.push({
          quiz,
          selectedAnswers,
          correctVariants,
          isCorrect,
        });
      } else {
        this.completedTests.push({
          categoryId: categoryId,
          results: [{ quiz, selectedAnswers, correctVariants, isCorrect }],
        });
      }
    }
  }

  private saveCompletedTest(): void {
    sessionStorage.setItem(
      'completedTests',
      JSON.stringify(this.completedTests)
    );
  }

  private shuffleArray(array: Quiz[]): Quiz[] {
    return array.sort(() => Math.random() - 0.5);
  }

  showExitWarning(): void {
    this.showWarning = true;
  }

  handleExit(): void {
    this.showWarning = false;
    this.router.navigate(['/student']);
  }

  closeWarning(): void {
    this.showWarning = false;
  }
}
