import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { OverlayRef } from '@angular/cdk/overlay';
import { Notification } from './notifications.types';

@Component({
  selector: 'app-notification-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="notification-popup" [@slideIn]>
      <div class="icon">
        <mat-icon>notifications</mat-icon>
      </div>
      <div class="content">
        <div class="title">New Notification</div>
        <div class="message">{{ data.description }}</div>
      </div>
      <button mat-icon-button (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .notification-popup {
      display: flex;
      align-items: center;
      background-color: #ffffff;
      color: #333333;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    .icon {
      margin-right: 16px;
      color: #1976d2;
    }
    .content {
      flex-grow: 1;
    }
    .title {
      font-weight: bold;
      margin-bottom: 4px;
    }
    .message {
      font-size: 14px;
    }
  `],
  animations: [
    trigger('slideIn', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('300ms ease-in'))
    ])
  ]
})
export class NotificationPopupComponent {
  constructor(
    @Inject('NOTIFICATION_DATA') public data: Notification,
    private overlayRef: OverlayRef
  ) {}

  close() {
    this.overlayRef.dispose();
  }
}