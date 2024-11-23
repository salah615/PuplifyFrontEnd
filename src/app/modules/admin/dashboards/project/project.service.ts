import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Course } from '../../apps/academy/academy.types';

@Injectable({ providedIn: 'root' })
export class ProjectService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    _overview: BehaviorSubject<any> = new BehaviorSubject(null);
    _courses: BehaviorSubject<Course[]> = new BehaviorSubject([]);
    private apiUrl = 'http://localhost:8888/api/';

    constructor(private _httpClient: HttpClient) {}

    getCourseBurndownData(courseId: any): Observable<any> {
        return this._httpClient.get(`${this.apiUrl}dashboard/course/${courseId}/burndown`);
    }

    getOverview(): Observable<any> {
        return this._httpClient.get(`${this.apiUrl}dashboard/overview`).pipe(
            tap((overview) => {
                this._overview.next(overview);
            })
        );
    }

    getCourses(): Observable<Course[]> {
        return this._httpClient.get<Course[]>(`${this.apiUrl}Tasknote/courses`).pipe(
            tap((courses) => {
                this._courses.next(courses);
            })
        );
    }

    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    getData(): Observable<any> {
        return this._httpClient.get('api/dashboards/project').pipe(
            tap((response: any) => {
                this._data.next(response);
            }),
        );
    }
}