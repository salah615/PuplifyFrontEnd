import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Course, CoursePagination } from './course.types';
import { BehaviorSubject, Observable, tap,of, delay, switchMap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class CourseService {
    private _courses: BehaviorSubject<Course[]> = new BehaviorSubject<Course[]>([]);
    private _course: BehaviorSubject<Course | null> = new BehaviorSubject<Course | null>(null);
    private _pagination: BehaviorSubject<CoursePagination | null> = new BehaviorSubject(null);
    private _courseCreationStatus: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(private _httpClient: HttpClient) {}

    get courses$(): Observable<Course[]> {
        return this._courses.asObservable();
    }

    get course$(): Observable<Course> {
        return this._course.asObservable();
    }

    get pagination$(): Observable<CoursePagination> {
        return this._pagination.asObservable();
    }

    getCourses(): Observable<Course[]> {
        return this._httpClient.get<Course[]>('http://localhost:8888/api/Tasknote/courses').pipe(
            tap((courses) => {
                console.log("api",courses);                
                this._courses.next(courses);
            })
        );
    }

    getCourseById(id: string): Observable<Course> {
        return this._httpClient.get<Course>(`http://localhost:8888/api/Tasknote/courses/${id}`).pipe(
            tap((course) => {
                this._course.next(course);

            })

        );
    }
    getCourseTasks(courseId: string): Observable<any[]> {
        return this._httpClient.get<any[]>(`http://localhost:8888/api/Tasknote/tasks/course/${courseId}`);
    }
    createCourse(course: Omit<Course, 'id'>): Observable<Course> {
        this._courseCreationStatus.next('Creating course and sending emails to students...');
        
        return this._httpClient.post<Course>('http://localhost:8888/api/Tasknote/courses', course).pipe(
            switchMap((newCourse) => {
                return this.simulateEmailSending().pipe(
                    tap(() => {
                        const currentCourses = this._courses.value;
                        this._courses.next([...currentCourses, newCourse]);
                        this._courseCreationStatus.next('Course created and emails sent successfully!');
                    }),
                    delay(1000), // Add a small delay before resetting the status
                    tap(() => {
                        this._courseCreationStatus.next('');
                    }),
                    switchMap(() => of(newCourse))
                );
            })
        );
    }

    private simulateEmailSending(): Observable<boolean> {
        return of(true).pipe(delay(3000)); // Simulate a 3-second delay for email sending
    }

    get courseCreationStatus$(): Observable<string> {
        return this._courseCreationStatus.asObservable();
    }

    updateCourse(id: string, course: Partial<Course>): Observable<Course> {
        return this._httpClient.put<Course>(`http://localhost:8888/api/Tasknote/courses/${id}`, course).pipe(
            tap((updatedCourse) => {
                const currentCourses = this._courses.value;
                const index = currentCourses.findIndex(c => c.id === id);
                if (index !== -1) {
                    currentCourses[index] = updatedCourse;
                    this._courses.next([...currentCourses]);
                }
            })
        );
    }

    deleteCourse(id: string): Observable<void> {
        return this._httpClient.delete<void>(`http://localhost:8888/api/Tasknote/courses/${id}`).pipe(
            tap(() => {
                const currentCourses = this._courses.value;
                this._courses.next(currentCourses.filter(c => c.id !== id));
            })
        );
    }
}