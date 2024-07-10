import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../core/category-service/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'srp-category.component',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class categoryComponent implements OnInit {
  categories!: any[];
  newCategoryName: string = '';
  editCategoryId: string | null = null; 
  editedCategoryName: string = ''; 

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  addCategory(): void {
    if (this.newCategoryName.trim() !== '') {
      this.categoryService.addCategory(this.newCategoryName)
        .then(() => {
          console.log('success');
          this.newCategoryName = ''; 
          this.loadCategories(); 
        })
        .catch(error => {
          console.error('Error ', error);
        });
    }
  }

  editCategory(category: any): void {
    this.editCategoryId = category.id;
    this.editedCategoryName = category.name;
  }

  updateCategory(): void {
    if (this.editCategoryId && this.editedCategoryName.trim() !== '') {
      this.categoryService.updateCategory(this.editCategoryId, this.editedCategoryName)
        .then(() => {
          console.log('success');
          this.editCategoryId = null;
          this.editedCategoryName = '';
          this.loadCategories(); 
        })
        .catch(error => {
          console.error('Error ', error);
        });
    }
  }

  cancelEdit(): void {
    this.editCategoryId = null;
    this.editedCategoryName = '';
  }

  deleteCategory(categoryId: string): void {
    this.categoryService.deleteCategory(categoryId)
      .then(() => {
        console.log('succes');
        this.loadCategories(); 
      })
      .catch(error => {
        console.error('Error: ', error);
      });
  }
}