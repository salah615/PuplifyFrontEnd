import { TextFieldModule } from "@angular/cdk/text-field";
import { AsyncPipe, NgClass, NgFor, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRippleModule } from "@angular/material/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { NotesService } from "app/modules/admin/apps/notes/notes.service";
import { Label, Note, Task } from "app/modules/admin/apps/notes/notes.types";
import {
  debounceTime,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from "rxjs";

@Component({
  selector: "notes-details",
  templateUrl: "./details.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    TextFieldModule,
    NgFor,
    MatCheckboxModule,
    NgClass,
    MatRippleModule,
    MatMenuModule,
    MatDialogModule,
    AsyncPipe,
  ],
})
export class NotesDetailsComponent implements OnInit, OnDestroy {
  note$: Observable<any>;
  labels$: Observable<string[]> = of(["ACTIVE", "ARCHIVED"]);

  noteChanged: Subject<any> = new Subject<any>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private _data: { note: Note },
    private _notesService: NotesService,
    private _matDialogRef: MatDialogRef<NotesDetailsComponent>
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Edit
    if (this._data.note.id) {
      // Request the data from the server
      this._notesService.getNoteById(this._data.note.id).subscribe();

      // Get the note
      this.note$ = this._notesService.note$;
    }
    // Add
    else {
      // Create an empty note
      const note = {
        title: "",
        description: "",
        label: 'ACTIVE',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId:{
            id:localStorage.getItem('userId')
        }
      };

      this.note$ = of(note);
    }

    // Subscribe to note updates
    this.noteChanged
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(500),
        switchMap((note) => this._notesService.updateNote(note))
      )
      .subscribe(() => {
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create a new note
   *
   * @param note
   */
  createNote(note: any): void {
    console.log("note",note);

    this._notesService
      .createNote(note)
      .pipe(
        map(() => {
          // Get the note
          this.note$ = this._notesService.note$;
        })
      )
      .subscribe();
  }

  /**
   * Update a new note
   * 
   * @param note
   */
  updateNote(note:any):void{
    this._notesService
     .updateNote(note)
     .subscribe();
        
  }
  /**
   * Upload image to given note
   *
   * @param note
   * @param fileList
   */
  uploadImage(note: Note, fileList: FileList): void {
    // Return if canceled
    if (!fileList.length) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    const file = fileList[0];

    // Return if the file is not allowed
    if (!allowedTypes.includes(file.type)) {
      return;
    }

    this._readAsDataURL(file).then((data) => {
      // Update the image
      note.image = data;

      // Update the note
      this.noteChanged.next(note);
    });
  }

  /**
   * Remove the image on the given note
   *
   * @param note
   */
  removeImage(note: any): void {
    note.image = null;

    // Update the note
    this.noteChanged.next(note);
  }

  /**
   * Update the note details
   *
   * @param note
   */
  updateNoteDetails(note: any): void {
    console.log("note",note);
    this.noteChanged.next(note);
  }

  /**
   * Delete the given note
   *
   * @param note
   */
  deleteNote(note: any): void {
    this._notesService.deleteNote(note).subscribe((isDeleted) => {
      // Return if the note wasn't deleted...
      if (!isDeleted) {
        return;
      }

      // Close the dialog
      this._matDialogRef.close();
    });
  }

  /**
   * Toggle archive on the given note
   *
   * @param note
   */
  toggleArchiveOnNote(note: any): void {
    // Toggle the archived status
    note.archived = !note.archived;

    // Update the note
    this.noteChanged.next(note);
  }

  /**
   * Add tag to the given note
   *
   * @param note
   * @param tag
   */
  addTag(note: any, tag: string): void {
    if (tag && !note.tags.includes(tag)) {
      note.tags.push(tag);
      this.noteChanged.next(note);
    }
  }

  /**
   * Remove tag from the given note
   *
   * @param note
   * @param tag
   */
  removeTag(note: any, tag: string): void {
    const index = note.tags.indexOf(tag);
    if (index >= 0) {
      note.tags.splice(index, 1);
      this.noteChanged.next(note);
    }
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Read the given file for demonstration purposes
   *
   * @param file
   */
  private _readAsDataURL(file: File): Promise<any> {
    // Return a new promise
    return new Promise((resolve, reject) => {
      // Create a new reader
      const reader = new FileReader();

      // Resolve the promise on success
      reader.onload = (): void => {
        resolve(reader.result);
      };

      // Reject the promise on error
      reader.onerror = (e): void => {
        reject(e);
      };

      // Read the file as the
      reader.readAsDataURL(file);
    });
  }
}
