import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main style="padding: 20px; font-family: sans-serif;">
      <h1>Port Inspector Setup Test</h1>
      
      <button 
        (click)="testBridge()" 
        style="padding: 10px 20px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;">
        Fetch Ports from Rust
      </button>

      <pre style="background: #f4f4f4; padding: 15px; margin-top: 20px;">{{ ports | json }}</pre>
    </main>
  `,
})

export class AppComponent {
  ports: any[] = [];

  async testBridge() {
    try {
      // THIS IS THE MAGIC LINE. It calls the 'get_ports' macro in your Rust main.rs!
      this.ports = await invoke('get_ports');
      console.log('Received from Rust:', this.ports);
    } catch (error) {
      console.error('Failed to invoke Rust command:', error);
    }
  }
}
