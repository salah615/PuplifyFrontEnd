import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ProjectService } from './project.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { Course } from '../../apps/academy/academy.types';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone:true,
    imports:[
        CommonModule,
        MatTabsModule,    
        NgApexchartsModule,
    ],
})
export class ProjectComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    overview: any;
    courses: Course[];
    courseBurndownCharts: { [courseId: number]: ApexOptions } = {};
    username: string = localStorage.getItem('username');

    constructor(
        private _projectService: ProjectService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Get overview data
        this._projectService.getOverview().pipe(takeUntil(this._unsubscribeAll)).subscribe();

        // Get courses and their burndown data
        this._projectService.getCourses().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (courses) => {
                this.courses = courses;
                this.fetchAllCourseBurndownData();
            }
        );

        // Subscribe to overview data changes
        this._projectService._overview
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((overview) => {
                this.overview = overview;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    fetchAllCourseBurndownData(): void {
        const requests = this.courses.map(course => 
            this._projectService.getCourseBurndownData(course.id)
        );

        console.log("requests",requests);
        
        forkJoin(requests).subscribe(
            (results) => {
                results.forEach((data, index) => {
                    this.prepareBurndownChart(this.courses[index].id, data);
                });
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    prepareBurndownChart(courseId: any, data: any): void {
        console.log("data",data);
        
        this.courseBurndownCharts[courseId] = {
            chart: {
                type: 'line',
                height: 300,
                toolbar: {
                    show: false
                }
            },
            series: [
                {
                    name: 'Remaining Tasks',
                    data: data.map(item => item.remainingTasks)
                }
            ],
            xaxis: {
                categories: data.map(item => this.formatDate(item.date))
            },
            yaxis: {
                title: {
                    text: 'Remaining Tasks'
                }
            }
        };
    }
    formatDate(dateString: string): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options); // E.g., "Jun 15, 2024"
    }
}