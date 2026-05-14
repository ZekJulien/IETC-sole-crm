import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Sidebar } from './layout/sidebar/sidebar'
import { Topbar } from './layout/topbar/topbar'
import { Toaster } from './layout/toaster/toaster'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Topbar, Toaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
