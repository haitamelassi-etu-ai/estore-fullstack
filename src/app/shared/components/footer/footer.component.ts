import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-logo">E<span>·Store</span></div>
      <p>© 2025 E·Store — Faculté des Sciences Ben M'Sick</p>
      <p class="footer-tech">Spring Boot · JPA · MongoDB · Angular</p>
    </footer>
  `,
  styles: [`
    .footer {
      padding: 2rem 2.5rem;
      border-top: 1px solid rgba(201,168,76,0.1);
      text-align: center;
      color: #555568;
      font-size: .8rem;
    }
    .footer-logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.3rem;
      color: #c9a84c;
      margin-bottom: .4rem;
    }
    .footer-logo span { color: #f5f2eb; }
    .footer-tech { margin-top: .3rem; font-size: .72rem; letter-spacing: .08em; }
  `]
})
export class FooterComponent {}
