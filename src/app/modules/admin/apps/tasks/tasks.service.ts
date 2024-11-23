import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Tag, Task } from "app/modules/admin/apps/tasks/tasks.types";
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from "rxjs";
import { environment } from "../../../../../../environments/environment";
import { cloneDeep } from "lodash";
import { Course } from "../courseboard/courses/course.types";

interface taskResponse {
  id: string;
  title: string;
  priority: string;
  dueDate: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: any;
  tags: any;
}

@Injectable({ providedIn: "root" })
export class TasksService {
  // Private
  private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
  private _task: BehaviorSubject<any | null> = new BehaviorSubject(null);
  private _tasks: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
  private readonly _baseUrl = environment.apiUrl;
  private headers = new HttpHeaders({ "Content-Type": "application/json" });
  private _courses: BehaviorSubject<Course[]> = new BehaviorSubject<Course[]>([]);

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for tags
   */
  get tags$(): Observable<Tag[]> {
    return this._tags.asObservable();
  }

  /**
   * Getter for task
   */
  get task$(): Observable<Task> {
    return this._task.asObservable();
  }

  get courses$(): Observable<Course[]> {
    return this._courses.asObservable();
}
  /**
   * Getter for tasks
   */
  get tasks$(): Observable<Task[]> {
    return this._tasks.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get tags
   */
  getTags(): Observable<Tag[]> {
    return this._httpClient.get<Tag[]>("api/apps/tasks/tags").pipe(
      tap((response: any) => {
        this._tags.next(response);
      })
    );
  }

  getCourses(): Observable<Course[]> {
    return this._httpClient.get<Course[]>('http://localhost:8888/api/Tasknote/courses').pipe(
        tap((courses) => {
            console.log("api",courses);                
            this._courses.next(courses);
        })
    );
}

  /**
   * Crate tag
   *
   * @param tag
   */
  createTag(tag: Tag): Observable<Tag> {
    return this.tags$.pipe(
      take(1),
      switchMap((tags) =>
        this._httpClient.post<Tag>("api/apps/tasks/tag", { tag }).pipe(
          map((newTag) => {
            // Update the tags with the new tag
            this._tags.next([...tags, newTag]);

            // Return new tag from observable
            return newTag;
          })
        )
      )
    );
  }

  /**
   * Update the tag
   *
   * @param id
   * @param tag
   */
  updateTag(id: string, tag: Tag): Observable<Tag> {
    return this.tags$.pipe(
      take(1),
      switchMap((tags) =>
        this._httpClient
          .patch<Tag>("api/apps/tasks/tag", {
            id,
            tag,
          })
          .pipe(
            map((updatedTag) => {
              // Find the index of the updated tag
              const index = tags.findIndex((item) => item.id === id);

              // Update the tag
              tags[index] = updatedTag;

              // Update the tags
              this._tags.next(tags);

              // Return the updated tag
              return updatedTag;
            })
          )
      )
    );
  }

  /**
   * Delete the tag
   *
   * @param id
   */
  deleteTag(id: string): Observable<boolean> {
    return this.tags$.pipe(
      take(1),
      switchMap((tags) =>
        this._httpClient.delete("api/apps/tasks/tag", { params: { id } }).pipe(
          map((isDeleted: boolean) => {
            // Find the index of the deleted tag
            const index = tags.findIndex((item) => item.id === id);

            // Delete the tag
            tags.splice(index, 1);

            // Update the tags
            this._tags.next(tags);

            // Return the deleted status
            return isDeleted;
          }),
          filter((isDeleted) => isDeleted),
          switchMap((isDeleted) =>
            this.tasks$.pipe(
              take(1),
              map((tasks) => {
                // Iterate through the tasks
                tasks.forEach((task) => {
                  const tagIndex = task.tags.findIndex((tag) => tag === id);

                  // If the task has a tag, remove it
                  if (tagIndex > -1) {
                    task.tags.splice(tagIndex, 1);
                  }
                });

                // Return the deleted status
                return isDeleted;
              })
            )
          )
        )
      )
    );
  }

  /**
   * Get tasks
   */
  getTasks(): Observable<any[]> {
    const userId = localStorage.getItem('userId');
    return this._httpClient
      .get(this._baseUrl + `/Tasknote/tasks/user/${userId}`, { headers: this.headers })
      .pipe(
        tap((response: any[]) => {
          console.log("getTasks", response);
          this._tasks.next(response);
        })
      );
  }

    /**
   * export PDF
   */
    exportTasksPdf() {
      const userId = localStorage.getItem('userId');
      const url = `${this._baseUrl}/Tasknote/tasks/export/pdf/user/${userId}`;
      return this._httpClient.get(url, {  responseType: 'blob' });
    }

  /**
   * Update tasks orders
   *
   * @param tasks
   */
  updateTasksOrders(tasks: Task[]): Observable<Task[]> {
    return this._httpClient.patch<Task[]>("api/apps/tasks/order", { tasks });
  }

  /**
   * Search tasks with given query
   *
   * @param query
   */
  searchTasks(query: string): Observable<Task[] | null> {
    return this._httpClient.get<Task[] | null>("api/apps/tasks/search", {
      params: { query },
    });
  }

  /**
   * Get task by id
   */
  getTaskById(id: string): Observable<Task> {
    return this._httpClient
      .get(this._baseUrl + "/Tasknote/tasks/" + id, { headers: this.headers })
      .pipe(
        tap((response: any) => {
          this._task.next(response);
        })
      );
  }

  /**
   * Create task
   *
   * @param type
   */
  createTask(type: string, task: any): Observable<any> {    
    return this._httpClient
      .post(this._baseUrl + "/Tasknote/tasks/", task, { headers: this.headers })
      .pipe(
        switchMap((response: taskResponse) =>
          this.getTasks().pipe(
            switchMap(() =>
              this.getTaskById(response.id).pipe(map(() => response))
            )
          )
        )
      );
  }

  /**
   * Update task
   *
   * @param id
   * @param task
   */
  updateTask(task: any): Observable<any> {
    // Clone the task to prevent accidental reference based updates
    const updatedTask = cloneDeep(task) as any;
    console.log("task",updatedTask);


    
    return this._httpClient
      .put(this._baseUrl + "/Tasknote/tasks/" + task.id, updatedTask, {
        headers: this.headers,
      })
      .pipe(
        tap((response) => {
          // Update the task
          this.getTaskById(response.id).subscribe();
          this.getTasks().subscribe();
          
        })
      );
  }

  /**
   * Delete the task
   *
   * @param id
   */
  deleteTask(id: string): Observable<boolean> {
    return this._httpClient
      .delete(this._baseUrl + "/Tasknote/tasks/" + id, {
        headers: this.headers,
      })
      .pipe(
        map((isDeleted: boolean) => {
          // Update the tasks
          this.getTasks().subscribe();


          // Return the deleted status
          return isDeleted;
        })
      );
  }
}
