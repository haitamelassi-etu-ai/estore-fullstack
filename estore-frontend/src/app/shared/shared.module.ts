import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ToastComponent } from './components/toast/toast.component';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    ToastComponent,
    ProductCardComponent
  ],
  imports: [CommonModule, RouterModule],
  exports: [NavbarComponent, FooterComponent, ToastComponent, ProductCardComponent]
})
export class SharedModule {}
