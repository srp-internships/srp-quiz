import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'srp-rating',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {
  correctAnswers: number = 0;
  totalQuestions: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.correctAnswers = +params['correct'];
      this.totalQuestions = +params['total'];
    });
  }
}