import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CourseService } from '../course.service';
import { Course } from '../course.types';
import { MatDialog } from '@angular/material/dialog';
import { AddCourseDialogComponent } from './add-course-dialog.component';
import { DeleteConfirmationDialogComponent } from './delete-dialog-confirmation.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UpdateCourseDialogComponent } from './update-course-dialog.coomponents';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector     : 'course-list',
    templateUrl  : './course.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        RouterModule,
        MatProgressSpinnerModule
    ]
    
})
export class CourseListComponent implements OnInit {
    courses: Course[];
    courseCreationStatus: string = '';
    private _subscriptions: Subscription = new Subscription();

    constructor(
        private _courseService: CourseService,
        private _dialog: MatDialog,
        private _cdr: ChangeDetectorRef // Inject ChangeDetectorRef

    ) {}

    ngOnInit(): void {
        this._subscriptions.add(
            this._courseService.courses$.subscribe((courses) => {
                this.courses = courses;
                this._cdr.detectChanges(); // Ensure changes are detected
            })
        );
        this._subscriptions.add(
            this._courseService.courseCreationStatus$.subscribe((status) => {
                this.courseCreationStatus = status;
                this._cdr.detectChanges();
            })
        );
        this._courseService.getCourses().subscribe(); // Ensure initial data load
    }

    openAddCourseDialog(): void {
        const dialogRef = this._dialog.open(AddCourseDialogComponent, {
            width: '400px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._courseService.createCourse(result).subscribe(() => {
                    // Refresh the course list
                    this._courseService.getCourses().subscribe();
                });
            }
        });
    }

    openUpdateCourseDialog(course: Course): void {
        const dialogRef = this._dialog.open(UpdateCourseDialogComponent, {
            width: '400px',
            data: { course } // Pass the course data to the dialog
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._courseService.updateCourse(result.id, result).subscribe();
            }
        });
    }


    openDeleteConfirmationDialog(course: Course): void {
        const dialogRef = this._dialog.open(DeleteConfirmationDialogComponent, {
            width: '300px',
            data: { courseName: course.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._courseService.deleteCourse(course.id).subscribe(() => {
                    // Refresh the course list
                    this._courseService.getCourses().subscribe();
                });
            }
        });
    }
}