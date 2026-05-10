import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { IconComponent } from './components/icon/icon.component';

@NgModule({
  declarations: [ProductCardComponent, IconComponent],
  imports: [CommonModule, RouterModule],
  exports: [ProductCardComponent, IconComponent]
})
export class SharedModule {}
