import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ComponentRef, Injectable, Injector } from "@angular/core";
import { Notification } from "app/layout/common/notifications/notifications.types";
import {
  BehaviorSubject,
  map,
  Observable,
  ReplaySubject,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from "rxjs";
import { UserService as _authService } from "app/core/user/user.service";
import { User } from "app/core/user/user.types";
import { WebSocketService } from "./websocket.service";
import { Client } from "@stomp/stompjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotificationPopupComponent } from "./notification-popup.components";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { environment } from "../../../../../environments/environment";
import { TaskCompletionPopupComponent } from "./task-completion-popup.components";

@Injectable({ providedIn: "root" })
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<any>([]);
  public notifications = 0;
  private stompClient: Client;
  private readonly _baseUrl = environment.apiUrl;
  private headers = new HttpHeaders({ "Content-Type": "application/json" });

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private webSocketService: WebSocketService,
    private overlay: Overlay,
    private injector: Injector
  ) {
    this.stompClient = this.webSocketService.connect();

    this.stompClient.onConnect = (frame) => {
      console.log("Connected: " + frame);
      this.stompClient.subscribe("/topic/notification", (message) => {
        const body = message.body;
        console.log("my notification", body);
        const newNotification: Notification = {
          id: Date.now().toString(), // Generate a unique ID
          description: body,
          read: false,
          time: new Date().toISOString(),
        };

        this.addNotification(newNotification);
        //  this.notifications = body.count;
        this.showPopupNotification(newNotification);
      });
      
    };

    this.stompClient.activate();
  }

  private addNotification(notification: Notification) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);
  }

  private showPopupNotification(notification: Notification) {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .top("20px")
        .right("20px"),
      hasBackdrop: false,
    });
    const isTaskCompletion = notification.description.includes("Congratulations");

    if(isTaskCompletion){
      const notificationRef: ComponentRef<TaskCompletionPopupComponent> =
      overlayRef.attach(
        new ComponentPortal(
          TaskCompletionPopupComponent,
          null,
          this.createInjector(notification, overlayRef)
        )
      );
    }else {
      const notificationRef: ComponentRef<NotificationPopupComponent> =
      overlayRef.attach(
        new ComponentPortal(
          NotificationPopupComponent,
          null,
          this.createInjector(notification, overlayRef)
        )
      );
    }
   

    setTimeout(() => {
      overlayRef.dispose();
    }, 5000);
  }
  private createInjector(notification: Notification, overlayRef: OverlayRef) {
    return Injector.create({
      parent: this.injector,
      providers: [
        { provide: "NOTIFICATION_DATA", useValue: notification },
        { provide: OverlayRef, useValue: overlayRef },
      ],
    });
  }

  /**
   * Getter for notifications
   */
  get notifications$(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all notifications
   */
  getAll(): Observable<Notification[]> {
    return this._httpClient.get<Notification[]>('http://localhost:8888/api/notifications').pipe(
      tap((notifications) => {
        this.notificationsSubject.next(notifications);
      })
    );
  }


  


  /**
   * Create a notification
   *
   * @param notification
   */
  create(notification: Notification): Observable<Notification> {
    return this._httpClient
      .post<Notification>(`${this._baseUrl}/notifications`, notification)
      .pipe(
        tap((newNotification) => {
          const currentNotifications = this.notificationsSubject.value;
          this.notificationsSubject.next([...currentNotifications, newNotification]);
        })
      );
  }

  /**
   * Update the notification
   *
   * @param id
   * @param notification
   */
  update(id: string, notification: Notification): Observable<Notification> {
    return this._httpClient
      .put<Notification>(`${this._baseUrl}/notifications/${id}`, notification)
      .pipe(
        tap((updatedNotification) => {
          const currentNotifications = this.notificationsSubject.value;
          const index = currentNotifications.findIndex((item) => item.id === id);
          if (index !== -1) {
            currentNotifications[index] = updatedNotification;
            this.notificationsSubject.next([...currentNotifications]);
          }
        })
      );
  }
  

  /**
   * Delete the notification
   *
   * @param id
   */
  delete(id: string): Observable<boolean> {
    return this._httpClient
      .delete<boolean>(`${this._baseUrl}/notifications/${id}`)
      .pipe(
        tap((isDeleted) => {
          if (isDeleted) {
            const currentNotifications = this.notificationsSubject.value;
            const updatedNotifications = currentNotifications.filter((item) => item.id !== id);
            this.notificationsSubject.next(updatedNotifications);
          }
        })
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<boolean> {
    return this._httpClient
      .patch<boolean>(`${this._baseUrl}/notifications/mark-all-as-read`, {})
      .pipe(
        tap((isUpdated) => {
          if (isUpdated) {
            const currentNotifications = this.notificationsSubject.value;
            currentNotifications.forEach((notification) => {
              notification.read = true;
            });
            this.notificationsSubject.next([...currentNotifications]);
          }
        })
      );
  }
}
