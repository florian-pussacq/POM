import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DatePipe,
  ],
  template: `
    <div class="page-header">
      <h2>Projets</h2>
      @if (canCreate()) {
        <a mat-raised-button color="primary" routerLink="/projects/create">
          <mat-icon>add</mat-icon> Nouveau projet
        </a>
      }
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner /></div>
    } @else if (error()) {
      <div class="error-banner">{{ error() }}</div>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="projects()" class="full-width">
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let p">{{ p.nom }}</td>
          </ng-container>
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let p">{{ p.code }}</td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let p">
              <mat-chip [class]="'chip-' + p.statut?.toLowerCase().replace(' ', '-')">
                {{ p.statut }}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="date_debut">
            <th mat-header-cell *matHeaderCellDef>Début</th>
            <td mat-cell *matCellDef="let p">{{ p.date_debut | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <a mat-icon-button [routerLink]="['/projects', p._id]" matTooltip="Voir le détail">
                <mat-icon>visibility</mat-icon>
              </a>
            </td>
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
export class ProjectsListComponent implements OnInit {
  readonly displayedColumns = ['nom', 'code', 'statut', 'date_debut', 'actions'];
  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly canCreate = computed(() => {
    const role = this.auth.userRole();
    return role === 'admin' || role === 'manager';
  });

  constructor(private projectService: ProjectService, private auth: AuthService) {}

  ngOnInit(): void {
    this.projectService.getAll().subscribe({
      next: (data) => { this.projects.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Erreur de chargement'); this.loading.set(false); },
    });
  }
}
