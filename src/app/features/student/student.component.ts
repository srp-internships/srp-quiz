import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../shared/services/category.service';
import { QuizService } from '../../shared/services/quiz.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'srp-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student.component.html',
  styleUrl: './student.component.scss'
})
export class StudentComponent implements OnInit {
  categories: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
      this.loadQuestionCountsForCategories();
    });
  }

  private loadQuestionCountsForCategories(): void {
    this.categories.forEach(category => {
      this.quizService.getQuizzesByCategory(category.id).subscribe(quizzes => {
        category.questionCount = quizzes.length;
      });
    });
  }

  goToQuestions(categoryId: string): void {
    this.router.navigate(['/question', categoryId]);
  }
}
