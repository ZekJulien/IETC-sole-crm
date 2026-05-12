import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PingService } from '../../services/ping/ping.service';

@Component({
  selector: 'app-ping',
  imports: [DatePipe],
  templateUrl: './ping.html',
  styleUrl: './ping.css',
})
export class PingFeature {
  private _pingService = inject(PingService);
  readonly pings = this._pingService.pings.asReadonly();

  async send(message: string): Promise<void> {
    if (!message.trim()) return;
    await this._pingService.send(message);
  }
}
