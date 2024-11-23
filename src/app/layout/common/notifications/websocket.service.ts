import { Injectable } from "@angular/core";
import { Client, IStompSocket } from '@stomp/stompjs';

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  public connect(): Client {
    return new Client({
      brokerURL: 'http://localhost:8888/api/socket',
      connectHeaders: {},
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }
}