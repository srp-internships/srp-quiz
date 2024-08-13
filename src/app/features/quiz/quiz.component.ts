import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryService } from '../../shared/services/category.service';
import { QuizService } from '../../shared/services/quiz.service';
import { CorrectsService } from '../../shared/services/corrects.service';
import { Category } from '../../interface/category.interface';
import { Quiz, QuizCorrect } from '../../interface/quiz.interface';
import { ModalQuizComponent } from './modal-quiz/modal-quiz.component';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { WarningComponent } from '../../shared/warning-component/warning-component.component';

@Component({
  selector: 'srp-quiz',
  standalone: true,
  imports: [ModalQuizComponent, CommonModule, WarningComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
})
export class QuizComponent implements OnInit {
  categories$: Observable<Category[]> | undefined;
  quizzes$: Observable<Quiz[]> | undefined;
  corrects: Record<string, string[]> = {};
  selectedCategoryId: string | null = null;
  isModalOpen: boolean = false;
  quizToEdit: Quiz | null = null;
  showWarning = false;
  warningMessage: string | undefined;
  quizToDelete: string | null = null;

  constructor(
    private quizService: QuizService,
    private correctsService: CorrectsService,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
    this.quizzes$ = this.quizService.getQuizzesByCategory(
      this.selectedCategoryId || ''
    );

    this.quizzes$?.subscribe((quizzes) => {
      quizzes.forEach((quiz) => {
        if (quiz.id) {
          this.loadCorrectsForQuiz(quiz.id);
        }
      });
    });
  }

  onCategoryChange(event: any): void {
    this.selectedCategoryId = event.target.value;
    if (
      this.selectedCategoryId &&
      this.selectedCategoryId !== 'Select category'
    ) {
      this.quizzes$ = this.quizService.getQuizzesByCategory(
        this.selectedCategoryId
      );
      this.quizzes$?.subscribe((quizzes) => {
        quizzes.forEach((quiz) => {
          if (quiz.id) {
            this.loadCorrectsForQuiz(quiz.id);
          }
        });
      });
    } else {
      this.quizzes$ = new Observable<Quiz[]>();
    }
  }

  openModal(): void {
    this.isModalOpen = true;
    this.quizToEdit = null;
  }

  editQuiz(quiz: Quiz): void {
    console.log('Editing quiz:', quiz);
    this.quizToEdit = quiz;
    this.isModalOpen = true;
  }

  confirmDelete(id?: string): void {
    if (!id) return;

    this.warningMessage = 'Are you sure you want to delete this question?';
    this.showWarning = true;
    this.quizToDelete = id;
  }

  async deleteQuiz(): Promise<void> {
    if (!this.quizToDelete) return;

    try {
      await this.quizService.deleteQuiz(this.quizToDelete);
      this.quizzes$ = this.quizService.getQuizzesByCategory(
        this.selectedCategoryId || ''
      );
      this.toastr.success('Question successfully deleted.');
    } catch (error) {
      console.error('error:', error);
      this.toastr.error('An error occurred while deleting the question.');
    } finally {
      this.showWarning = false;
      this.quizToDelete = null;
    }
  }

  closeModal(): void {
    this.showWarning = false;
    this.isModalOpen = false;
    this.quizToDelete = null;
    this.quizToEdit = null;
  }

  handleDeleteConfirmation() {
    if (this.quizToDelete) {
      this.quizService
        .deleteQuiz(this.quizToDelete)
        .then(() => {
          this.quizzes$ = this.quizService.getQuizzesByCategory(
            this.selectedCategoryId || ''
          );
          this.toastr.success('Question successfully deleted.');
        })
        .catch((err) => {
          console.error('error:', err);
          this.toastr.error('An error occurred while deleting a question.');
        })
        .finally(() => {
          this.showWarning = false;
          this.quizToDelete = null;
        });
    }
  }

  async loadCorrectsForQuiz(quizId: string): Promise<void> {
    try {
      const correctsData: QuizCorrect | null =
        await this.correctsService.getCorrects(quizId);
      if (correctsData && correctsData.corrects.length > 0) {
        this.corrects[quizId] = correctsData.corrects;
      } else {
        console.log(`No correct answers found for quiz ${quizId}`);
      }
    } catch (error) {
      console.error('Error loading correct answers:', error);
    }
  }

  isCorrect(quizId: string | undefined, letter: string): boolean {
    if (!quizId || !this.corrects[quizId]) {
      return false;
    }
    return this.corrects[quizId].includes(letter);
  }
}
