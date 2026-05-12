import { Component } from '@angular/core';
import { PingFeature } from './features/ping/ping';

@Component({
  selector: 'app-root',
  imports: [PingFeature],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
