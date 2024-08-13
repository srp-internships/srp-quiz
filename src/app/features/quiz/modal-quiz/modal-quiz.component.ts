import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { QuizService } from '../../../shared/services/quiz.service';
import { CategoryService } from '../../../shared/services/category.service';
import {
  Variant,
  Quiz,
  SelectedVariant,
  QuizCorrect,
} from '../../../interface/quiz.interface';
import { ToastrService } from 'ngx-toastr';
import { CorrectsService } from '../../../shared/services/corrects.service';

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
    private correctsService: CorrectsService,
    private toast: ToastrService,
    private categoryService: CategoryService
  ) {
    this.quizForm = this.fb.group({
      question: ['', Validators.required],
      categoryId: ['', Validators.required],
      multiple: [false],
      variants: this.fb.array([this.createVariant()], Validators.required),
    });

    this.trackVariantsChanges();
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
      correct: [false],
    });
  }

  addVariant(): void {
    if (this.variants.length < 8) {
      const lastVariant = this.variants.at(this.variants.length - 1);
      const nextLetter = lastVariant
        ? this.getNextLetter(lastVariant.get('letter')?.value || 'A')
        : 'A';
      this.variants.push(
        this.fb.group({
          letter: [nextLetter],
          variant: ['', Validators.required],
          correct: [false],
        })
      );
    }
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
    this.updateLetters();
    this.trackVariantsChanges();
  }

  resetForm(): void {
    this.quizForm.reset();
    this.quizForm.setControl('variants', this.fb.array([this.createVariant()]));
  }

  fetchCategories(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  setDefaultCategory(): void {
    this.categories$!.subscribe((categories) => {
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

  trackVariantsChanges(): void {
    this.variants.valueChanges.subscribe((variants) => {
      const correctVariants = variants
        .filter((v: { correct: boolean }) => v.correct)
        .map((v: { letter: string }) => v.letter);

      this.quizForm.patchValue({ correctVariants });

      const isMultiple = correctVariants.length > 1;
      this.quizForm.patchValue({ multiple: isMultiple });
    });
  }

  async onSubmitQuiz(): Promise<void> {
    if (this.quizForm.valid && this.variants.length > 0) {
      const variants = this.quizForm.get('variants')?.value;
      const hasCheckedVariant = variants.some(
        (variant: any) => variant.correct
      );

      if (!hasCheckedVariant) {
        this.toast.error('Please select at least one correct variant.');
        return;
      }

      this.submitting = true;
      const formValue = this.quizForm.value;
      const question = formValue.question;

      try {
        const excludeId = this.updateModeData?.id;
        const isDuplicate = await this.quizService.isDuplicateQuestion(
          question,
          excludeId
        );
        if (isDuplicate) {
          this.toast.error('This question already exists.');
          this.submitting = false;
          return;
        }
      } catch (error) {
        this.submitting = false;
        return;
      }

      const quizData: Quiz = {
        question: formValue.question,
        categoryId: formValue.categoryId,
        multiple: formValue.multiple,
        variants: formValue.variants.map((v: SelectedVariant) => ({
          letter: v.letter,
          variant: v.variant,
        })),
      };

      try {
        if (this.updateModeData) {
          const updatedQuiz = { ...quizData, id: this.updateModeData.id };
          await this.quizService.updateQuiz(updatedQuiz);

          const correctVariants: string[] = formValue.variants
            .filter((v: SelectedVariant) => v.correct)
            .map((v: SelectedVariant) => v.letter);

          if (this.updateModeData.id) {
            const correctsData: QuizCorrect = {
              quizId: this.updateModeData.id,
              corrects: correctVariants,
            };
            console.log('Update:', correctsData);
            await this.correctsService.addCorrects(
              this.updateModeData.id,
              correctsData
            );
          }

          this.toast.success('Question successfully edited');
        } else {
          const quizId = await this.quizService.addQuiz(quizData);

          const correctVariants: string[] = formValue.variants
            .filter((v: SelectedVariant) => v.correct)
            .map((v: SelectedVariant) => v.letter);

          const correctsData: QuizCorrect = {
            quizId,
            corrects: correctVariants,
          };
          console.log('add:', correctsData);
          await this.correctsService.addCorrects(quizId, correctsData);

          this.toast.success('Question successfully created');
        }

        this.closeModal.emit();
        this.resetForm();
      } catch (error) {
        console.error('Error:', error);
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

  async updateForm(quiz: Quiz): Promise<void> {
    this.quizForm.patchValue({
      question: quiz.question,
      categoryId: quiz.categoryId,
      multiple: quiz.multiple,
    });

    const variantsFormArray = this.fb.array(
      quiz.variants.map((variant) =>
        this.fb.group({
          letter: [variant.letter],
          variant: [variant.variant, Validators.required],
          correct: [false],
        })
      )
    );

    this.quizForm.setControl('variants', variantsFormArray);

    if (quiz.id) {
      const correctsData = await this.correctsService.getCorrects(quiz.id);
      if (correctsData && correctsData.corrects.length > 0) {
        correctsData.corrects.forEach((correctLetter) => {
          const index = quiz.variants.findIndex(
            (v) => v.letter === correctLetter
          );
          if (index !== -1) {
            this.variants.at(index).get('correct')?.setValue(true);
          }
        });
      }
    }

    const correctVariants = this.variants.value.filter(
      (v: { correct: boolean }) => v.correct
    );
    const isMultiple = correctVariants.length > 1;
    this.quizForm.patchValue({ multiple: isMultiple });

    this.trackVariantsChanges();
  }
}
