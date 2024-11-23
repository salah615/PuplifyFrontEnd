import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskExportService {
  private apiUrl = 'http://localhost:8888/api'; // Replace with your actual API base URL

  constructor(private http: HttpClient) { }

  exportTasksExcel(courseId: string): Observable<Blob> {
    const url = `${this.apiUrl}/Tasknote/tasks/export/excel/course/${courseId}`;
    return this.http.get(url, {
      responseType: 'blob'
    });
  }
}