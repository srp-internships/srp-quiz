import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../shared/services/quiz.service';
import { Quiz, Variant } from '../../interface/quiz.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'srp-questions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {
  quizzes: Quiz[] = [];
  currentQuizIndex: number = 0;
  selectedAnswers: Set<string> = new Set(); 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('categoryId');
    if (categoryId) {
      this.quizService.getQuizzesByCategory(categoryId).subscribe(quizzes => {
        this.quizzes = quizzes;
      });
    }
  }

  selectAnswer(variant: Variant): void {
    const currentQuiz = this.quizzes[this.currentQuizIndex];
    if (currentQuiz.multiple) {
      if (this.selectedAnswers.has(variant.letter)) {
        this.selectedAnswers.delete(variant.letter);
      } else {
        this.selectedAnswers.add(variant.letter);
      }
    } else {
      this.selectedAnswers.clear();
      this.selectedAnswers.add(variant.letter);
    }
  }

  isSelected(variant: Variant): boolean {
    return this.selectedAnswers.has(variant.letter);
  }

  answerQuiz() {

  }
}
