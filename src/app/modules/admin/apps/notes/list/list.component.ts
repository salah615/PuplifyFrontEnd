import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FuseMasonryComponent } from '@fuse/components/masonry';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NotesDetailsComponent } from 'app/modules/admin/apps/notes/details/details.component';
import { NotesLabelsComponent } from 'app/modules/admin/apps/notes/labels/labels.component';
import { NotesService } from 'app/modules/admin/apps/notes/notes.service';
import { Label, Note } from 'app/modules/admin/apps/notes/notes.types';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, Subject, takeUntil } from 'rxjs';

@Component({
    selector       : 'notes-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatSidenavModule, MatRippleModule, NgClass, MatIconModule, NgIf, NgFor, MatButtonModule, MatFormFieldModule, MatInputModule, FuseMasonryComponent, AsyncPipe],
})
export class NotesListComponent implements OnInit, OnDestroy
{
    labels$: Observable<Label[]>;
    notes$: Observable<any[]>;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    filter$: BehaviorSubject<string> = new BehaviorSubject('notes');
    searchQuery$: BehaviorSubject<string> = new BehaviorSubject(null);
    masonryColumns: number = 4;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        private _notesService: NotesService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the filter status
     */
    get filterStatus(): string
    {
        return this.filter$.value;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Request the data from the server
        this._notesService.getNotes().subscribe({
            
        });

        
        // Get notes
        this.notes$ = combineLatest([this._notesService.notes$, this.filter$, this.searchQuery$]).pipe(
            distinctUntilChanged(),
            map(([notes, filter, searchQuery]) =>
            {
                console.log("notes",notes);
                
                if ( !notes || !notes.length )
                {                    
                    return notes;
                }

                // Store the filtered notes
                let filteredNotes = notes;

                console.log("searchQuery",searchQuery);
                
                // Filter by query
                if ( searchQuery )
                {
                    searchQuery = searchQuery.trim().toLowerCase();
                    filteredNotes = filteredNotes.filter(note => note.title.toLowerCase().includes(searchQuery) || note.description.toLowerCase().includes(searchQuery));
                }

                // Show all
                if ( filter === 'notes' )
                {
                    // Do nothing
                }

                

                return filteredNotes;
            }),
        );

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Set the masonry columns
                //
                // This if block structured in a way so that only the
                // biggest matching alias will be used to set the column
                // count.
                if ( matchingAliases.includes('xl') )
                {
                    this.masonryColumns = 5;
                }
                else if ( matchingAliases.includes('lg') )
                {
                    this.masonryColumns = 4;
                }
                else if ( matchingAliases.includes('md') )
                {
                    this.masonryColumns = 3;
                }
                else if ( matchingAliases.includes('sm') )
                {
                    this.masonryColumns = 2;
                }
                else
                {
                    this.masonryColumns = 1;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Add a new note
     */
    addNewNote(): void
    {
        this._matDialog.open(NotesDetailsComponent, {
            autoFocus: false,
            data     : {
                note: {},
            },
        });
    }

    /**
     * Export PDF
     */

    exportPdf() {
        this._notesService.exportNotesPdf().subscribe(response => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        });
      }

    /**
     * Open the edit labels dialog
     */
    openEditLabelsDialog(): void
    {
        this._matDialog.open(NotesLabelsComponent, {autoFocus: false});
    }

    /**
     * Open the note dialog
     */
    openNoteDialog(note: Note): void
    {
        this._matDialog.open(NotesDetailsComponent, {
            autoFocus: false,
            data     : {
                note: cloneDeep(note),
            },
        });
    }

    /**
     * Filter by query
     *
     * @param query
     */
    filterByQuery(query: string): void
    {
        this.searchQuery$.next(query);
    }

    /**
     * Reset filter
     */
    resetFilter(): void
    {
        this.filter$.next('notes');
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
