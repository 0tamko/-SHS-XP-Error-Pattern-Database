import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { HubConnection } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { PatternsApiService } from './patterns-api.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubUrl: string = environment.hubUrl;
  public hubConnection: HubConnection | undefined;

  constructor(
    private patternsApiService: PatternsApiService) {
    this.initiateConnection();
  }

  private async initiateConnection() {
    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl)
        .build();

      this.hubConnection.start();

    }
    catch (error) {
      console.log("SignalR connection error: " + error);
    }
  }

}
