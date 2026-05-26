import { SeedServices } from './types'

const PROJECT_CATEGORIES = [
  { name: 'Développement web', color: '#89b4fa' },
  { name: 'Application mobile', color: '#cba6f7' },
  { name: 'Design / UI', color: '#f5c2e7' },
  { name: 'Conseil', color: '#a6e3a1' },
  { name: 'Maintenance', color: '#fab387' },
]

const EXPENSE_CATEGORIES = [
  { name: 'Matériel', color: '#89b4fa', deductible: true },
  { name: 'Logiciel / SaaS', color: '#cba6f7', deductible: true },
  { name: 'Déplacement', color: '#fab387', deductible: true },
  { name: 'Restauration', color: '#f9e2af', deductible: true },
  { name: 'Sous-traitance', color: '#a6e3a1', deductible: true },
  { name: 'Divers', color: '#9399b2', deductible: false },
]

export async function seedRequiredDefaults(s: SeedServices): Promise<void> {
  const alreadySeeded = (await s.category.get()).data.length > 0
  if (alreadySeeded) return
  for (const c of PROJECT_CATEGORIES) await s.category.add(c)
  for (const c of EXPENSE_CATEGORIES) await s.expenseCategory.add(c)
}
