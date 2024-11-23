import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../course.service';
import { CommonModule } from '@angular/common';
import { TaskExportService } from './task-export.service';

@Component({
    selector: 'app-course-tasks',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './course-tasks.component.html'
})
export class CourseTasksComponent implements OnInit {
    tasks: any[];
    courseName: string;
    courseId: string;

    constructor(
        private route: ActivatedRoute,
        private courseService: CourseService,
        private _cdr: ChangeDetectorRef, // Inject ChangeDetectorRef
        private taskExportService: TaskExportService,

    ) {}

    ngOnInit() {
        console.log("here");
        
        this.courseId = this.route.snapshot.paramMap.get('id');
        if (this.courseId) {
            this.courseService.getCourseTasks(this.courseId).subscribe(
                (tasks) => {
                    console.log("tasksinside",tasks);
                    this.tasks = tasks;
                    // Assuming you have a method to get course details
                    this.courseService.getCourseById(this.courseId).subscribe(
                        (course) => {
                            this.courseName = course.name;
                            this._cdr.detectChanges(); // Ensure changes are detected
                        }
                    );
                    this._cdr.detectChanges(); // Ensure changes are detected

                }
            );
        }
    }
    exportTasks() {
        this.taskExportService.exportTasksExcel(this.courseId).subscribe(
            (data: Blob) => {
                const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `tasks_${this.courseName}.xlsx`;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error => {
                console.error('Error exporting tasks:', error);
                // You might want to show an error message to the user here
            }
        );
    }
}