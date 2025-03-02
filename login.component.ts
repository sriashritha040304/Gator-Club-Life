import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule], // Include CommonModule here
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = ''; // Define errorMessage property

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    // Clear any previous error message
    this.errorMessage = '';

    const payload = {
      email: this.username,
      password: this.password,
    };

    this.http
      .post<{ message: string }>('http://localhost:8080/login', payload)
      .pipe(
        catchError((error) => {
          // Set errorMessage to display in the template
          this.errorMessage = error.error || 'Login failed';
          return throwError(() => error);
        })
      )
      .subscribe((response) => {
        // On success, mark as logged in and navigate to home
        localStorage.setItem('isLoggedIn', 'true');
        this.router.navigate(['/home']);
      });
  }
}
