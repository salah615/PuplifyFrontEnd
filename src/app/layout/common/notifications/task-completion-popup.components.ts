import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { OverlayRef } from "@angular/cdk/overlay";
import { Notification } from "./notifications.types";
import { Router } from "@angular/router";

@Component({
  selector: "app-task-completion-popup",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="celebration-container" [@fadeIn]>
      <div class="confetti"></div>
      <div class="task-completion-popup" [@zoomIn]>
        <div class="icon">
          <mat-icon>emoji_events</mat-icon>
        </div>
        <div class="content">
          <div class="title">Congratulations!</div>
          <div class="message">{{ data.description }}</div>
        </div>
        <div class="buttons">
          <button
            mat-raised-button
            color="primary"
            (click)="redirectToDashboard()"
          >
            View Progress
          </button>
          <button mat-icon-button (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .celebration-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
      }
      .task-completion-popup {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #f0f8ff;
        padding: 32px;
        border-radius: 16px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .icon {
        margin-bottom: 24px;
        color: #ffd700;
      }
      .icon mat-icon {
        font-size: 120px; /* Increase font size */
        height: 120px; /* Adjust height */
        width: 120px; /* Adjust width */
      }

      .content {
        width: 100%;
        margin-bottom: 24px;
      }
      .title {
        font-weight: bold;
        font-size: 28px;
        margin-bottom: 12px;
        color: #000000;
      }
      .message {
        font-size: 18px;
        color: #000000;
      }
      .buttons {
        display: flex;
        justify-content: center;
        gap: 16px;
      }
      .confetti {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
      }
      .confetti::before {
        content: "";
        position: absolute;
        top: -10px;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: radial-gradient(circle, #ff6b6b 10%, transparent 10%),
          radial-gradient(circle, #feca57 10%, transparent 10%),
          radial-gradient(circle, #48dbfb 10%, transparent 10%),
          radial-gradient(circle, #ff9ff3 10%, transparent 10%);
        background-size: 10% 10%, 20% 20%, 15% 15%, 18% 18%;
        animation: confettiAnimation 10s linear infinite;
      }
      @keyframes confettiAnimation {
        0% {
          background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%;
        }
        100% {
          background-position: 0% 100%, 0% 100%, 0% 100%, 0% 100%;
        }
      }
    `,
  ],
  animations: [
    trigger("zoomIn", [
      state(
        "void",
        style({
          transform: "scale(0.5)",
          opacity: 0,
        })
      ),
      state(
        "*",
        style({
          transform: "scale(1)",
          opacity: 1,
        })
      ),
      transition("void => *", animate("300ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
      transition("* => void", animate("300ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
    trigger("fadeIn", [
      state(
        "void",
        style({
          opacity: 0,
        })
      ),
      state(
        "*",
        style({
          opacity: 1,
        })
      ),
      transition("void => *", animate("300ms ease-in")),
      transition("* => void", animate("300ms ease-out")),
    ]),
  ],
})
export class TaskCompletionPopupComponent {
  constructor(
    @Inject("NOTIFICATION_DATA") public data: Notification,
    private overlayRef: OverlayRef,
    private router: Router
  ) {}

  close() {
    this.overlayRef.dispose();
  }

  redirectToDashboard() {
    this.router.navigate(["/dashboards/project"]);
    this.close();
  }
}
