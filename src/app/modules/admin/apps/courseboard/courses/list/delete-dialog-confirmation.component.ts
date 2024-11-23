import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';

@Component({
    template: `
        <h2 mat-dialog-title class="dialog-title">Delete Course</h2>
        <mat-dialog-content class="dialog-content">
            Are you sure you want to delete the course "{{ data.courseName }}"?
        </mat-dialog-content>
        <mat-dialog-actions class="dialog-actions">
            <button mat-button class="cancel-button" (click)="onNoClick()">Cancel</button>
            <button mat-button color="warn" class="delete-button" (click)="onYesClick()">Delete</button>
        </mat-dialog-actions>
    `,
    standalone: true,
    imports: [
        MatDialogActions,
        MatDialogContent
    ],
    styles: [`

        .dialog-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: #333;
        }

        .dialog-content {
            padding: 24px;
            font-size: 1rem;
            color: #555;
        }

        .dialog-actions {
            padding: 16px;
            display: flex;
            justify-content: flex-end;
        }

        .cancel-button, .delete-button {
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

        .delete-button {
            color: #fff;
            background-color: #f44336;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .delete-button:hover {
            background-color: #c62828;
        }
    `]
})
export class DeleteConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { courseName: string }
    ) {}

    onNoClick(): void {
        this.dialogRef.close(false);
    }

    onYesClick(): void {
        this.dialogRef.close(true);
    }
}
