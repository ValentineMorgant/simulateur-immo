// src/utils/format.ts
export function euros(n: number): string {
  return Math.round(n).toLocaleString('fr-FR') + ' €'
}
