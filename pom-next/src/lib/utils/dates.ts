/**
 * Calculate working days between two dates (excluding weekends)
 */
export function dateDiffWorkingDays(start: Date | string, end: Date | string): number {
  let count = 0;
  const current = new Date(start);
  const finish = new Date(end);
  current.setHours(0, 0, 0, 0);
  finish.setHours(0, 0, 0, 0);
  while (current <= finish) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/**
 * Check if a date is a working day
 */
export function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

/**
 * Get duration in working days
 */
export function getDuration(dateDebut?: string, dateFinTheorique?: string): number {
  if (!dateDebut || !dateFinTheorique) return 0;
  return dateDiffWorkingDays(dateDebut, dateFinTheorique);
}

/**
 * Get spent time (working days from start to today)
 */
export function getSpentTime(dateDebut?: string): number {
  if (!dateDebut) return 0;
  return dateDiffWorkingDays(dateDebut, new Date());
}

/**
 * Count items by a specific property value
 */
export function countByTerm<T>(items: T[], key: keyof T): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const val = String(item[key] ?? 'Inconnu');
    result[val] = (result[val] || 0) + 1;
  }
  return result;
}

/**
 * Generate project code for a year: {YYYY}P{NNN}
 */
export function generateProjectCode(existingCodes: string[], year?: number): string {
  const y = year || new Date().getFullYear();
  const prefix = `${y}P`;
  const nums = existingCodes
    .filter(c => c.startsWith(prefix))
    .map(c => parseInt(c.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

/**
 * Generate task code: {PROJECT_CODE}T{NNN}
 */
export function generateTaskCode(projectCode: string, existingCodes: string[]): string {
  const prefix = `${projectCode}T`;
  const nums = existingCodes
    .filter(c => c.startsWith(prefix))
    .map(c => parseInt(c.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

/**
 * Calculate task cost
 * cost = Σ (cout_horaire × 7 hours/day × working_days)
 */
export function calculateTaskCost(
  collaborateursCoutHoraire: number[],
  dateDebut?: string,
  dateFinTheorique?: string
): number {
  if (!dateDebut || !dateFinTheorique || collaborateursCoutHoraire.length === 0) return 0;
  const workingDays = dateDiffWorkingDays(dateDebut, dateFinTheorique);
  const totalHourlyCost = collaborateursCoutHoraire.reduce((sum, c) => sum + c, 0);
  return totalHourlyCost * 7 * workingDays;
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(date?: string): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date for input[type=date] (YYYY-MM-DD)
 */
export function toInputDate(date?: string): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
