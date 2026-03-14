import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { BudgetService } from '../../../core/services/budget.service';
import { Budget } from '../../../core/models/budget.model';

@Component({
  selector: 'app-budgets-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    DecimalPipe,
  ],
  template: `
    <div class="page-header">
      <h2>Lignes budgétaires</h2>
      <a mat-raised-button color="primary" routerLink="/budgets/create">
        <mat-icon>add</mat-icon> Nouvelle ligne
      </a>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner /></div>
    } @else if (error()) {
      <div class="error-banner">{{ error() }}</div>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="budgets()" class="full-width">
          <ng-container matColumnDef="libelle">
            <th mat-header-cell *matHeaderCellDef>Libellé</th>
            <td mat-cell *matCellDef="let b">{{ b.libelle }}</td>
          </ng-container>
          <ng-container matColumnDef="montant">
            <th mat-header-cell *matHeaderCellDef>Montant</th>
            <td mat-cell *matCellDef="let b">{{ b.montant | number:'1.2-2' }} €</td>
          </ng-container>
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let b">{{ b.description || '—' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .error-banner { background: #fdecea; color: #b00020; padding: 12px; border-radius: 4px; }
  `],
})
export class BudgetsListComponent implements OnInit {
  readonly displayedColumns = ['libelle', 'montant', 'description'];
  readonly budgets = signal<Budget[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor(private budgetService: BudgetService) {}

  ngOnInit(): void {
    this.budgetService.getAll().subscribe({
      next: (data) => { this.budgets.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Erreur de chargement'); this.loading.set(false); },
    });
  }
}
