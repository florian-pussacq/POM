import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-projects-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatListModule,
    DatePipe,
  ],
  template: `
    @if (loading()) {
      <div class="center"><mat-spinner /></div>
    } @else if (error()) {
      <div class="error-banner">{{ error() }}</div>
    } @else if (project()) {
      <div class="page-header">
        <h2>{{ project()!.nom }}</h2>
        <div>
          @if (canEdit()) {
            <button mat-stroked-button color="primary">
              <mat-icon>edit</mat-icon> Modifier
            </button>
          }
          <a mat-button routerLink="/projects">
            <mat-icon>arrow_back</mat-icon> Retour
          </a>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>Code</span>
              <span matListItemLine>{{ project()!.code || '—' }}</span>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Statut</span>
              <span matListItemLine>{{ project()!.statut }}</span>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Description</span>
              <span matListItemLine>{{ project()!.description || '—' }}</span>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Date de début</span>
              <span matListItemLine>{{ project()!.date_debut | date:'dd/MM/yyyy' }}</span>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Date de fin théorique</span>
              <span matListItemLine>{{ project()!.date_fin_theorique | date:'dd/MM/yyyy' }}</span>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .error-banner { background: #fdecea; color: #b00020; padding: 12px; border-radius: 4px; }
  `],
})
export class ProjectsDetailComponent implements OnInit {
  readonly project = signal<Project | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly canEdit = computed(() => {
    const role = this.auth.userRole();
    return role === 'admin' || role === 'manager';
  });

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.projectService.getById(id).subscribe({
      next: (p) => { this.project.set(p); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Projet introuvable'); this.loading.set(false); },
    });
  }
}
