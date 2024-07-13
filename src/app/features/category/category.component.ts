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
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categories$!: Observable<Category[]>;
  newCategoryName: string = '';
  editCategoryId: string | null = null;
  editedCategoryName: string = '';

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  async addCategory(): Promise<void> {
    if (this.newCategoryName.trim() !== '') {
      try {
        await this.categoryService.addCategory(this.newCategoryName);
        this.newCategoryName = '';
      } catch (error) {
        console.error('error: ', error);
      }
    }
  }

  editCategory(category: Category): void {
    this.editCategoryId = category.id;
    this.editedCategoryName = category.name;
  }

  async updateCategory(): Promise<void> {
    if (this.editCategoryId && this.editedCategoryName.trim() !== '') {
      try {
        await this.categoryService.updateCategory(this.editCategoryId, this.editedCategoryName);
        this.editCategoryId = null;
        this.editedCategoryName = '';
      } catch (error) {
        console.error('error: ', error);
      }
    }
  }
  cancelEdit(): void {
    this.editCategoryId = null;
    this.editedCategoryName = '';
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await this.categoryService.deleteCategory(categoryId);
    } catch (error) {
      console.error('error ', error);
    }
  }
}