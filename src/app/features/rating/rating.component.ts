import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Quiz, Variant } from '../../interface/quiz.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'srp-rating',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
})
export class RatingComponent implements OnInit {
  correctAnswersCount: number = 0;
  totalQuestions: number = 0;
  incorrectAnswersCount: number = 0;
  completedTests: {
    categoryId: string;
    results: {
      quiz: Quiz;
      selectedAnswers: string[];
      correctVariants: string[];
      isCorrect: boolean;
      showDetails: boolean;
    }[];
  }[] = [];
  currentCategoryTests: {
    quiz: Quiz;
    selectedAnswers: string[];
    correctVariants: string[];
    isCorrect: boolean;
    showDetails: boolean;
  }[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.correctAnswersCount = +params['correct'] || 0;
      this.totalQuestions = +params['total'] || 0;
      this.incorrectAnswersCount =
        this.totalQuestions - this.correctAnswersCount;
    });

    const savedTests = sessionStorage.getItem('completedTests');
    if (savedTests) {
      this.completedTests = JSON.parse(savedTests);
      const categoryId = this.route.snapshot.paramMap.get('categoryId');
      if (categoryId) {
        this.currentCategoryTests =
          this.completedTests.find((test) => test.categoryId === categoryId)
            ?.results || [];
        this.currentCategoryTests.forEach((test) => (test.showDetails = false));
      }
    }
  }

  get correctPercentage(): number {
    return (this.correctAnswersCount / this.totalQuestions) * 100;
  }

  getConicGradient(): string {
    return `conic-gradient(green ${this.correctPercentage}%, red ${this.correctPercentage}% 100%)`;
  }

  clearSessionStorageAndNavigate(): void {
    sessionStorage.removeItem('completedTests');
    this.router.navigate(['/student']);
  }

  getVariantText(letter: string, variants: Variant[]): string {
    const variant = variants.find(v => v.letter === letter);
    return variant ? `${variant.letter}. ${variant.variant}` : letter;
  }
}
