import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../core/category-service/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Category } from '../../interface/category.interface';

@Component({
  selector: 'srp-category.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
  categories$!: Observable<Category[]>;
  currentCategory: Category = { id: '', name: '' };
  error: string | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  async saveCategory(): Promise<void> {
    if (this.currentCategory.name.trim() !== '') {
      try {
        if (this.currentCategory.id === '') {
          await this.categoryService.addCategory(this.currentCategory.name);
        } else {
          await this.categoryService.updateCategory(
            this.currentCategory.id,
            this.currentCategory.name
          );
        }

        this.currentCategory = { id: '', name: '' };
        this.error = null;
      } catch (error) {
        console.error('error: ', error);
      }
    }
  }

  editCategory(category: Category): void {
    this.currentCategory = { ...category };
  }

  cancelEdit(): void {
    this.currentCategory = { id: '', name: '' };
    this.error = null;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await this.categoryService.deleteCategory(categoryId);
    } catch (error) {
      console.error('error: ', error);
    }
  }
}
