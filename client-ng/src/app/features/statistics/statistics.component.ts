import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <h2>Statistiques</h2>
    <mat-card>
      <mat-card-content>
        <p>
          <mat-icon>info</mat-icon>
          Les graphiques de statistiques seront disponibles prochainement.
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`mat-icon { vertical-align: middle; margin-right: 8px; }`],
})
export class StatisticsComponent {}
