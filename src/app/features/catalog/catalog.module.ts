import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: ProductListComponent },
  { path: 'catalog/:id', component: ProductDetailComponent }
];

@NgModule({
  declarations: [HomeComponent, ProductListComponent, ProductDetailComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes), SharedModule]
})
export class CatalogModule {}
