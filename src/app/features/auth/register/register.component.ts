import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    MessageModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    alias: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    phone: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.register(this.form.value as any);
      await this.authService.login(this.form.value.alias!, this.form.value.password!);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set(err.error?.detail || 'Error al registrarse');
    } finally {
      this.loading.set(false);
    }
  }
}
