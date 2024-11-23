import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Label, Note } from "app/modules/admin/apps/notes/notes.types";
import { cloneDeep } from "lodash-es";
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from "rxjs";
import { environment } from "../../../../../../environments/environment";

interface NoteResponse {
  id: string;
  title: string;
  description: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  userId: any;
  tags: any;
}

@Injectable({ providedIn: "root" })
export class NotesService {
  // Private
  private _labels: BehaviorSubject<Label[] | null> = new BehaviorSubject(null);
  private _note: BehaviorSubject<any | null> = new BehaviorSubject(null);
  private _notes: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
  private readonly _baseUrl = environment.apiUrl;
  private headers = new HttpHeaders({ "Content-Type": "application/json" });

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for labels
   */
  get labels$(): Observable<Label[]> {
    return this._labels.asObservable();
  }

  /**
   * Getter for notes
   */
  get notes$(): Observable<any[]> {
    return this._notes.asObservable();
  }

  /**
   * Getter for note
   */
  get note$(): Observable<any> {
    return this._note.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get labels
   */
  getLabels(): Observable<Label[]> {
    return this._httpClient.get<Label[]>("api/apps/notes/labels").pipe(
      tap((response: Label[]) => {
        this._labels.next(response);
      })
    );
  }

  /**
   * Add label
   *
   * @param title
   */
  addLabel(title: string): Observable<Label[]> {
    return this._httpClient
      .post<Label[]>("api/apps/notes/labels", { title })
      .pipe(
        tap((labels) => {
          // Update the labels
          this._labels.next(labels);
        })
      );
  }

  /**
   * Update label
   *
   * @param label
   */
  updateLabel(label: Label): Observable<Label[]> {
    return this._httpClient
      .patch<Label[]>("api/apps/notes/labels", { label })
      .pipe(
        tap((labels) => {
          // Update the notes
          this.getNotes().subscribe();

          // Update the labels
          this._labels.next(labels);
        })
      );
  }

  /**
   * Delete a label
   *
   * @param id
   */
  deleteLabel(id: string): Observable<Label[]> {
    return this._httpClient
      .delete<Label[]>("api/apps/notes/labels", { params: { id } })
      .pipe(
        tap((labels) => {
          // Update the notes
          this.getNotes().subscribe();

          // Update the labels
          this._labels.next(labels);
        })
      );
  }

  /**
   * Get notes
   */
  getNotes(): Observable<any> {
    const userId = localStorage.getItem('userId');
    console.log("userId",userId);
    
    return this._httpClient
      .get(this._baseUrl + `/Tasknote/notes/user/${userId}`, { headers: this.headers })
      .pipe(
        tap((response: any[]) => {
          this._notes.next(response);
        })
      );
  }

  /**
   * export PDF
   */
  exportNotesPdf() {
    const userId = localStorage.getItem('userId');
    const url = `${this._baseUrl}/Tasknote/notes/export/pdf/user/${userId}`;
    return this._httpClient.get(url, {  responseType: 'blob' });
  }

  /**
   * Get note by id
   */
  getNoteById(id: string): Observable<any> {
    return this._httpClient
      .get(this._baseUrl + "/Tasknote/notes/" + id, { headers: this.headers })
      .pipe(
        tap((response: any) => {
          this._note.next(response);
        })
      );
  }

  /**
   * Add task to the given note
   *
   * @param note
   * @param task
   */
  addTask(note: any, task: string): Observable<any> {
    return this._httpClient
      .post<Note>("api/apps/notes/tasks", {
        note,
        task,
      })
      .pipe(
        switchMap(() =>
          this.getNotes().pipe(switchMap(() => this.getNoteById(note.id)))
        )
      );
  }

  /**
   * Create note
   *
   * @param note
   */
  createNote(note: any): Observable<any> {
    console.log("service", note);

    return this._httpClient
      .post(this._baseUrl + "/Tasknote/notes/", note, { headers: this.headers })
      .pipe(
        switchMap((response: NoteResponse) =>
          this.getNotes().pipe(
            switchMap(() =>
              this.getNoteById(response.id).pipe(map(() => response))
            )
          )
        )
      );
  }

  /**
   * Update the note
   *
   * @param note
   */
  updateNote(note: any): Observable<any> {
    // Clone the note to prevent accidental reference based updates
    const updatedNote = cloneDeep(note) as any;

    return this._httpClient
      .put(this._baseUrl + "/Tasknote/notes/" + note.id, updatedNote, {
        headers: this.headers,
      })
      .pipe(
        tap((response) => {
          // Update the notes
          this.getNotes().subscribe();
        })
      );
  }

  /**
   * Delete the note
   *
   * @param note
   */
  deleteNote(note: any): Observable<boolean> {
    return this._httpClient
      .delete(this._baseUrl + "/Tasknote/notes/" + note.id, {
        headers: this.headers,
      })
      .pipe(
        map((isDeleted: boolean) => {
          // Update the notes
          this.getNotes().subscribe();

          // Return the deleted status
          return isDeleted;
        })
      );
  }
}
