import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { QuizService } from '../../core/service/quiz.service';
import { Quiz } from '../../interface/quiz.interface';
import { ModalQuizComponent } from './modal-quiz/modal-quiz.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'srp-quiz',
  standalone: true,
  imports: [ModalQuizComponent, CommonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {
  categories$: Observable<any[]> | undefined;
  quizzes: Quiz[] = [];
  selectedCategoryId: string | null = null;
  isModalOpen: boolean = false;
  quizToEdit: Quiz | null = null;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.categories$ = this.quizService.getCategories();
  }

  onCategoryChange(event: any): void {
    this.selectedCategoryId = event.target.value;
    if (this.selectedCategoryId && this.selectedCategoryId !== 'Select category') {
      this.fetchQuizzesByCategory(this.selectedCategoryId);
    } else {
      this.quizzes = [];
    }
  }

  fetchQuizzesByCategory(categoryId: string): void {
    this.quizService.getQuizzesByCategory(categoryId).subscribe(data => {
      this.quizzes = data;
    });
  }

  openModal(): void {
    this.isModalOpen = true;
    this.quizToEdit = null;
  }

  editQuiz(quiz: Quiz): void {
    this.quizToEdit = quiz;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.quizToEdit = null;
  }
}
