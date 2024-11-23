import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Course } from '../course.types';

@Component({
    template: `
        <h2 mat-dialog-title class="dialog-title">Update Course</h2>
        <mat-dialog-content class="dialog-content">
            <form [formGroup]="courseForm">
                <mat-form-field appearance="fill" class="form-field">
                    <mat-label>Course Name</mat-label>
                    <input matInput placeholder="Course Name" formControlName="name">
                </mat-form-field>
                <mat-form-field appearance="fill" class="form-field">
                    <mat-label>Description</mat-label>
                    <textarea matInput placeholder="Description" formControlName="description"></textarea>
                </mat-form-field>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions class="dialog-actions">
            <button mat-button class="cancel-button" (click)="onNoClick()">Cancel</button>
            <button mat-button class="submit-button" [disabled]="!courseForm.valid" (click)="onSubmit()">Update</button>
        </mat-dialog-actions>
    `,
    standalone: true,
    imports: [
        MatDialogActions,
        MatDialogContent,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule
    ],
    styles: [`
        .dialog-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .dialog-content {
            padding: 24px;
            display: flex;
            flex-direction: column;
        }

        .form-field {
            width: 100%;
            margin-bottom: 16px;
        }

        .dialog-actions {
            padding: 16px;
            display: flex;
            justify-content: flex-end;
        }

        .cancel-button, .submit-button {
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .cancel-button {
            margin-right: 8px;
            color: #555;
            background-color: #f0f0f0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .cancel-button:hover {
            background-color: #e0e0e0;
        }

        .submit-button {
            color: #007bff;
            background-color: #e6f0ff;
            box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
        }

        .submit-button:hover {
            background-color: #cce4ff;
        }

        .submit-button:disabled {
            color: #aaa;
            background-color: #f0f0f0;
            box-shadow: none;
        }
    `]
})
export class UpdateCourseDialogComponent {
    courseForm: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<UpdateCourseDialogComponent>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: { course: Course } // Inject course data
    ) {
        this.courseForm = this.fb.group({
            name: [data.course.name, Validators.required],
            description: [data.course.description, Validators.required],
            id: [data.course.id, Validators.required]
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        if (this.courseForm.valid) {
            this.dialogRef.close(this.courseForm.value);
        }
    }
}
