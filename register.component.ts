import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  register(): void {
    // Clear any previous error message
    this.errorMessage = '';

    // Validate all required fields are provided
    if (!this.name || !this.email || !this.username || !this.password || !this.confirmPassword || !this.role) {
      this.errorMessage = 'All fields are required!';
      return;
    }

    // Ensure the password fields match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    // Prepare the payload for the backend.
    // Note: The backend expects a JSON payload with keys:
    // user_name, user_email, user_role, user_password.
    const payload = {
      user_name: this.username,
      user_email: this.email,
      user_role: this.role,
      user_password: this.password,
    };

    // Send POST request to the registration endpoint on the Fiber backend.
    this.http.post<{ user_id: number }>('http://localhost:8080/users/create', payload)
      .pipe(
        catchError((error) => {
          // Set errorMessage to display in the UI if registration fails.
          this.errorMessage = error.error || 'Registration failed!';
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          // On successful registration, navigate to the login page.
          this.router.navigate(['/login']);
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
