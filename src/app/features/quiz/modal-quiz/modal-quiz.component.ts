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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-quiz.component.html',
  styleUrl: './modal-quiz.component.scss',
})
export class ModalQuizComponent implements OnInit {
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @Input() updateModeData: Quiz | null = null;

  categories$: Observable<any[]> | undefined;
  quizForm: FormGroup;
  submitting: boolean = false;

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
      variants: this.fb.array([this.createVariant()], Validators.required)
    });
  }

  ngOnInit(): void {
    this.fetchCategories();
    if (this.updateModeData) {
      this.updateForm(this.updateModeData);
    } else {
      this.setDefaultCategory();
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
      const nextLetter = lastVariant ? this.getNextLetter(lastVariant.get('letter')?.value || 'A') : 'A';
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

  setDefaultCategory(): void {
    this.categories$!.subscribe(categories => {
      if (categories.length > 0) {
        this.quizForm.patchValue({ categoryId: categories[0].id });
      }
    });
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
    if (this.quizForm.valid && this.variants.length > 0) {
      this.submitting = true;
      const formValue = this.quizForm.value;
      const question = formValue.question;
  
      try {
        const excludeId = this.updateModeData ? this.updateModeData.id : undefined;
        const isDuplicate = await this.checkDuplicateQuestion(question, excludeId);
        if (isDuplicate) {
          this.toast.error('This question already exists.');
          this.submitting = false;
          return;
        }
      } catch (error) {
        this.toast.error('Error checking for duplicate question.');
        console.error('Error checking for duplicates:', error);
        this.submitting = false;
        return;
      }
  
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
      } finally {
        this.submitting = false;
      }
    } else {
      this.toast.error('Please fill out all required fields.');
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

  private async checkDuplicateQuestion(question: string, excludeId?: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.quizService.getQuizzes().subscribe({
        next: quizzes => {
          const isDuplicate = quizzes.some(quiz => quiz.question === question && quiz.id !== excludeId);
          resolve(isDuplicate);
        },
        error: error => {
          reject(error);
        }
      });
    });
  }
}
