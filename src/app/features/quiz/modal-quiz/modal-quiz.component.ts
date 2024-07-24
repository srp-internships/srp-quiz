import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators , ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { QuizService } from '../../../shared/services/quiz.service';
import { CategoryService } from '../../../shared/services/category.service';
import { Variant, Quiz } from '../../../interface/quiz.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'srp-modal-quiz',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Убедитесь, что FormsModule не используется
  templateUrl: './modal-quiz.component.html',
  styleUrls: ['./modal-quiz.component.scss'],
})
export class ModalQuizComponent implements OnInit {
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @Input() updateModeData: Quiz | null = null;

  categories$: Observable<any[]> | undefined;
  quizForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private toast: ToastrService,
    private categoryService: CategoryService
  ) {
    this.quizForm = this.fb.group({
      question: ['', Validators.required],
      categoryId: ['', Validators.required],
      multiple: [false],
      variants: this.fb.array([
        this.createVariant()
      ])
    });
  }

  ngOnInit(): void {
    this.fetchCategories();
    if (this.updateModeData) {
      this.updateForm(this.updateModeData);
    }
  }

  get variants(): FormArray {
    return this.quizForm.get('variants') as FormArray;
  }

  createVariant(): FormGroup {
    return this.fb.group({
      letter: ['A'],
      variant: ['', Validators.required],
      correct: [false]
    });
  }

  addVariant(): void {
    if (this.variants.length < 8) {
      const lastVariant = this.variants.at(this.variants.length - 1);
      const nextLetter = this.getNextLetter(lastVariant.get('letter')?.value || 'A');
      this.variants.push(this.fb.group({
        letter: [nextLetter],
        variant: ['', Validators.required],
        correct: [false]
      }));
    }
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
    this.updateLetters();
  }

  resetForm(): void {
    this.quizForm.reset();
    this.quizForm.setControl('variants', this.fb.array([this.createVariant()]));
  }

  fetchCategories(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  getNextLetter(currentLetter: string): string {
    const currentCharCode = currentLetter.charCodeAt(0);
    const nextCharCode = currentCharCode + 1;
    return String.fromCharCode(nextCharCode);
  }

  updateLetters(): void {
    this.variants.controls.forEach((control, index) => {
      control.get('letter')?.setValue(String.fromCharCode(65 + index));
    });
  }

  async onSubmitQuiz(): Promise<void> {
    if (this.quizForm.valid) {
      const formValue = this.quizForm.value;
      const quizData: Quiz = {
        question: formValue.question,
        categoryId: formValue.categoryId,
        multiple: formValue.multiple,
        variants: formValue.variants
      };

      try {
        if (this.updateModeData) {
          const updatedQuiz = { ...quizData, id: this.updateModeData.id };
          await this.quizService.updateQuiz(updatedQuiz);
          this.toast.success('Question successfully edited');
        } else {
          const quizDocRef = await this.quizService.addQuiz(quizData);
          const quizId = quizDocRef.id;

          await this.quizService.addCorrects(
            quizId,
            quizData.variants.filter((v: Variant) => v.correct)
          );
          this.toast.success('Question successfully created');
        }

        this.closeModal.emit();
        this.resetForm();
      } catch (error) {
        console.error('Error:', error);
        this.toast.error('An error occurred while processing the quiz.');
      }
    }
  }

  onCloseModal(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  updateForm(quiz: Quiz): void {
    this.quizForm.patchValue({
      question: quiz.question,
      categoryId: quiz.categoryId,
      multiple: quiz.multiple
    });
    
    const variantsFormArray = this.fb.array(quiz.variants.map(variant => this.fb.group(variant)));
    this.quizForm.setControl('variants', variantsFormArray);
  }
}
