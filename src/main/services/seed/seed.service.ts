import { getDbContext, clearAllStorage } from '../../core'
import { SeedServices, seedRequiredDefaults, seedDemoData } from '../../seed'

const SEED_TX = { maxWait: 10_000, timeout: 120_000 }

export class SeedService {
  constructor(private readonly services: SeedServices) {}

  seedRequiredDefaults(): Promise<void> {
    return getDbContext().transaction(() => seedRequiredDefaults(this.services), SEED_TX)
  }

  seedDemoData(): Promise<void> {
    return getDbContext().transaction(() => seedDemoData(this.services), SEED_TX)
  }

  async reset(): Promise<void> {
    await getDbContext().transaction(() => this.wipe(), SEED_TX)
    await clearAllStorage()
  }

  private async wipe(): Promise<void> {
    const db = getDbContext().client
    await db.payment.deleteMany()
    await db.invoiceLine.deleteMany()
    await db.invoice.deleteMany()
    await db.quoteLine.deleteMany()
    await db.quote.deleteMany()
    await db.timeEntry.deleteMany()
    await db.task.deleteMany()
    await db.expenseReceipt.deleteMany()
    await db.expense.deleteMany()
    await db.projectCategory.deleteMany()
    await db.project.deleteMany()
    await db.contact.deleteMany()
    await db.client.deleteMany()
    await db.product.deleteMany()
    await db.category.deleteMany()
    await db.expenseCategory.deleteMany()
    await db.companySettings.deleteMany()
    await db.company.deleteMany()
  }
}
