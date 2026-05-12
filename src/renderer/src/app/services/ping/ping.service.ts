import { Injectable, signal } from '@angular/core';
import { Ping } from '@shared/interfaces/ping.dto';

@Injectable({ providedIn: 'root' })
export class PingService {
  readonly pings = signal<Ping[]>([]);

  constructor() {
    this.loadAll();
  }

  private async loadAll(): Promise<void> {
    try {
      const result = await window.pingService.getAll();
      this.pings.set(result ?? []);
    } catch (e) {
      console.error('Erreur chargement pings', e);
    }
  }

  async send(message: string): Promise<void> {
    try {
      const ping = await window.pingService.send(message);
      if (ping) this.pings.update(p => [ping, ...p]);
    } catch (e) {
      console.error('Erreur envoi ping', e);
    }
  }
}
