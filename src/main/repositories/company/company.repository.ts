import { Prisma } from '@db/client'
import { DbContext } from '../../core/db-context'

const COMPANY_ID = 'default'

type CompanyWithSettings = Prisma.CompanyGetPayload<{ include: { settings: true } }>

export class CompanyRepository {
  constructor(private readonly dbContext: DbContext) {}

  get(): Promise<CompanyWithSettings | null> {
    return this.dbContext.client.company.findUnique({
      where: { id: COMPANY_ID },
      include: { settings: true },
    })
  }

  async upsert(
    company: Omit<Prisma.CompanyCreateInput, 'id' | 'settings'>,
    settings?: Prisma.CompanySettingsCreateWithoutCompanyInput,
  ): Promise<CompanyWithSettings> {
    const existing = await this.dbContext.client.company.findUnique({ where: { id: COMPANY_ID } })

    if (!existing) {
      return this.dbContext.client.company.create({
        data: {
          id: COMPANY_ID,
          ...company,
          settings: { create: settings ?? {} },
        },
        include: { settings: true },
      })
    }

    if (settings) {
      return this.dbContext.client.company.update({
        where: { id: COMPANY_ID },
        data: { ...company, settings: { update: settings } },
        include: { settings: true },
      })
    }

    return this.dbContext.client.company.update({
      where: { id: COMPANY_ID },
      data: { ...company },
      include: { settings: true },
    })
  }
}
