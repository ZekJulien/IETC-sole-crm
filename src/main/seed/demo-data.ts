import { ClientType } from '@shared/dtos/client'
import { ProjectStatus } from '@shared/dtos/project'
import { TaskStatus, TaskPriority } from '@shared/dtos/task'
import { QuoteStatus } from '@shared/dtos/quote'
import { InvoiceStatus, PaymentMethod, InvoiceDto } from '@shared/dtos/invoice'
import { SeedServices } from './types'
import { seedRequiredDefaults } from './required-defaults'

function at(days: number): Date {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d
}

export async function seedDemoData(s: SeedServices): Promise<void> {
  await seedRequiredDefaults(s)

  await s.company.saveCompany({
    name: 'Atelier Margaux',
    legalForm: 'Personne physique (indépendant·e)',
    street: 'Rue de la Loi 42', zipCode: '1000', city: 'Bruxelles', country: 'BE',
    email: 'hello@ateliermargaux.be', phone: '+32 2 333 44 55', website: 'https://ateliermargaux.be',
    companyNumber: '0712.345.678', vatNumber: 'BE0712345678',
    iban: 'BE68 5390 0754 7034', bic: 'GKCCBEBB',
  }, {
    defaultVatRate: 21, paymentTermsDays: 30,
    paymentConditions: 'Paiement à 30 jours par virement bancaire.',
    invoiceNumberFormat: 'INV-{YYYY}-{####}', quoteNumberFormat: 'QUO-{YYYY}-{####}',
    invoiceCounterResetYearly: true, quoteCounterResetYearly: true,
  })

  const categories = (await s.category.get()).data
  const catId = (name: string): number => categories.find(c => c.name === name)!.id

  const dev    = await s.product.add({ name: 'Jour de développement', unitPrice: 480, vatRate: 21, unit: 'jour', description: 'Journée de développement logiciel' })
  const advice = await s.product.add({ name: 'Heure de conseil',      unitPrice: 85,  vatRate: 21, unit: 'heure' })
  const mockup = await s.product.add({ name: 'Forfait maquette UI',   unitPrice: 1200, vatRate: 21, unit: 'forfait' })
  await s.product.add({ name: 'Hébergement annuel', unitPrice: 180, vatRate: 21, unit: 'an' })

  const bakery = await s.client.add({
    name: 'Boulangerie Dupont', type: ClientType.COMPANY,
    email: 'contact@boulangerie-dupont.be', phone: '+32 2 511 22 33',
    street: 'Rue du Pain 12', zipCode: '1000', city: 'Bruxelles', country: 'BE',
    companyNumber: '0123.456.789', vatNumber: 'BE0123456789',
  })
  await s.contact.add({ clientId: bakery.id, lastName: 'Dupont', firstName: 'Jean', role: 'Gérant', email: 'jean@boulangerie-dupont.be', phone: '+32 475 12 34 56' })

  const studio = await s.client.add({
    name: 'Studio Créatif', type: ClientType.COMPANY,
    email: 'hello@studiocreatif.be', phone: '+32 4 222 33 44',
    street: 'Quai des Arts 5', zipCode: '4000', city: 'Liège', country: 'BE',
    companyNumber: '0987.654.321', vatNumber: 'BE0987654321',
  })
  await s.contact.add({ clientId: studio.id, lastName: 'Moreau', firstName: 'Sophie', role: 'Directrice artistique', email: 'sophie@studiocreatif.be' })

  const marie = await s.client.add({
    name: 'Lefèvre', firstName: 'Marie', type: ClientType.INDIVIDUAL,
    email: 'marie.lefevre@gmail.com', phone: '+32 478 99 88 77',
    street: 'Avenue Louise 200', zipCode: '1050', city: 'Ixelles', country: 'BE',
  })

  const site = await s.project.add({
    name: 'Site vitrine Boulangerie', description: 'Refonte du site vitrine avec module de commande en ligne.',
    status: ProjectStatus.COMPLETED, clientId: bakery.id,
    categoryIds: [catId('Développement web'), catId('Design / UI')],
    dailyRate: 480, budget: 6000, startDate: at(-90), endDate: at(-30),
  })
  const reservation = await s.project.add({
    name: 'App de réservation', description: 'Application mobile de réservation de tables.',
    status: ProjectStatus.IN_PROGRESS, clientId: studio.id,
    categoryIds: [catId('Application mobile'), catId('Développement web')],
    dailyRate: 520, budget: 18000, startDate: at(-40),
  })
  const brand = await s.project.add({
    name: 'Refonte identité visuelle', description: 'Nouvelle charte graphique, logo et papeterie.',
    status: ProjectStatus.IN_PROGRESS, clientId: studio.id,
    categoryIds: [catId('Design / UI')],
    hourlyRate: 75, budget: 4000, startDate: at(-20),
  })
  const maintenance = await s.project.add({
    name: 'Maintenance annuelle', description: 'Contrat de maintenance et support technique.',
    status: ProjectStatus.IN_PROGRESS, clientId: bakery.id,
    categoryIds: [catId('Maintenance')],
    hourlyRate: 65, startDate: at(-60),
  })
  await s.project.add({
    name: 'Audit & conseil stratégique', description: 'Audit technique et accompagnement.',
    status: ProjectStatus.PROSPECT, clientId: marie.id,
    categoryIds: [catId('Conseil')],
    dailyRate: 600, budget: 3000, startDate: at(7),
  })

  const taskSpecs = [
    { projectId: reservation.id, title: 'Maquettes des écrans',     status: TaskStatus.DONE,        priority: TaskPriority.HIGH,   dueIn: -10 },
    { projectId: reservation.id, title: 'API de réservation',       status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, dueIn: 6 },
    { projectId: reservation.id, title: 'Intégration du paiement',  status: TaskStatus.TODO,        priority: TaskPriority.MEDIUM, dueIn: 18 },
    { projectId: reservation.id, title: 'Tests utilisateurs',       status: TaskStatus.BLOCKED,     priority: TaskPriority.LOW,    dueIn: 25 },
    { projectId: brand.id,       title: 'Recherche de logo',        status: TaskStatus.DONE,        priority: TaskPriority.MEDIUM, dueIn: -3 },
    { projectId: brand.id,       title: 'Déclinaisons papeterie',   status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, dueIn: 9 },
    { projectId: maintenance.id, title: 'Mises à jour de sécurité', status: TaskStatus.TODO,        priority: TaskPriority.HIGH,   dueIn: 4 },
  ]
  const taskId: Record<string, number> = {}
  for (const t of taskSpecs) {
    const created = await s.task.add({ projectId: t.projectId, title: t.title, status: t.status, priority: t.priority, dueDate: at(t.dueIn) })
    taskId[t.title] = created.id
  }

  const timeSpecs = [
    { projectId: site.id,        taskId: null,                          duration: 480, billable: true,  day: -88, description: 'Intégration de la page d\'accueil', pomodoro: false },
    { projectId: site.id,        taskId: null,                          duration: 420, billable: true,  day: -84, description: 'Module de commande', pomodoro: false },
    { projectId: site.id,        taskId: null,                          duration: 180, billable: false, day: -80, description: 'Réunion de cadrage', pomodoro: false },
    { projectId: reservation.id, taskId: taskId['Maquettes des écrans'], duration: 390, billable: true,  day: -32, description: 'Wireframes', pomodoro: false },
    { projectId: reservation.id, taskId: taskId['API de réservation'],   duration: 480, billable: true,  day: -12, description: 'Endpoints de réservation', pomodoro: false },
    { projectId: reservation.id, taskId: taskId['API de réservation'],   duration: 25,  billable: true,  day: -9,  description: 'Validation des créneaux', pomodoro: true },
    { projectId: reservation.id, taskId: taskId['API de réservation'],   duration: 25,  billable: true,  day: -9,  description: 'Gestion des conflits', pomodoro: true },
    { projectId: reservation.id, taskId: taskId['Intégration du paiement'], duration: 240, billable: true, day: -4, description: 'Étude de Stripe', pomodoro: false },
    { projectId: brand.id,       taskId: taskId['Recherche de logo'],    duration: 300, billable: true,  day: -18, description: 'Exploration de pistes', pomodoro: false },
    { projectId: brand.id,       taskId: taskId['Recherche de logo'],    duration: 120, billable: true,  day: -15, description: 'Présentation client', pomodoro: false },
    { projectId: brand.id,       taskId: taskId['Déclinaisons papeterie'], duration: 180, billable: true, day: -6, description: 'Cartes de visite', pomodoro: false },
    { projectId: brand.id,       taskId: null,                          duration: 25,  billable: false, day: -2,  description: 'Veille graphique', pomodoro: true },
    { projectId: maintenance.id, taskId: taskId['Mises à jour de sécurité'], duration: 90, billable: true, day: -20, description: 'Patch de sécurité', pomodoro: false },
    { projectId: maintenance.id, taskId: null,                          duration: 60,  billable: true,  day: -13, description: 'Sauvegarde et monitoring', pomodoro: false },
    { projectId: maintenance.id, taskId: null,                          duration: 45,  billable: true,  day: -5,  description: 'Support téléphonique', pomodoro: false },
    { projectId: reservation.id, taskId: taskId['API de réservation'],   duration: 360, billable: true,  day: -1,  description: 'Documentation API', pomodoro: false },
    { projectId: brand.id,       taskId: taskId['Déclinaisons papeterie'], duration: 150, billable: true, day: 0, description: 'Charte typographique', pomodoro: false },
    { projectId: maintenance.id, taskId: null,                          duration: 75,  billable: true,  day: 0,   description: 'Mise à jour des dépendances', pomodoro: false },
  ]
  for (const e of timeSpecs)
    await s.timeEntry.add({ projectId: e.projectId, taskId: e.taskId, duration: e.duration, billable: e.billable, pomodoro: e.pomodoro, date: at(e.day), description: e.description })

  const expCats = (await s.expenseCategory.get()).data
  const expCatId = (name: string): number => expCats.find(c => c.name === name)!.id
  const expenseSpecs = [
    { label: 'Licence IDE annuelle',        amount: 199,  category: 'Logiciel / SaaS', projectId: null,            day: -120 },
    { label: 'Abonnement hébergement',      amount: 28,   category: 'Logiciel / SaaS', projectId: site.id,         day: -60 },
    { label: 'Écran externe 27"',           amount: 349,  category: 'Matériel',        projectId: null,            day: -95 },
    { label: 'Train Bruxelles–Liège',       amount: 24,   category: 'Déplacement',     projectId: brand.id,        day: -18 },
    { label: 'Déjeuner client',             amount: 62,   category: 'Restauration',    projectId: reservation.id,  day: -12 },
    { label: 'Prestation graphiste',        amount: 850,  category: 'Sous-traitance',  projectId: brand.id,        day: -9 },
    { label: 'Banque d\'images',            amount: 45,   category: 'Logiciel / SaaS', projectId: brand.id,        day: -7 },
    { label: 'Fournitures de bureau',       amount: 38,   category: 'Divers',          projectId: null,            day: -3 },
    { label: 'Parking',                     amount: 12,   category: 'Déplacement',     projectId: reservation.id,  day: -1 },
  ]
  for (const e of expenseSpecs)
    await s.expense.add({ label: e.label, amount: e.amount, expenseCategoryId: expCatId(e.category), projectId: e.projectId, date: at(e.day) }, [])

  await s.quote.add({
    clientId: studio.id, projectId: reservation.id, status: QuoteStatus.ACCEPTED,
    issueDate: at(-45), validUntil: at(15), notes: 'Acompte de 30% à la commande.',
    lines: [{ description: 'Développement de l\'application', quantity: 20, unitPrice: dev.unitPrice, vatRate: 21, productId: dev.id }],
  })
  await s.quote.add({
    clientId: bakery.id, status: QuoteStatus.SENT,
    issueDate: at(-6), validUntil: at(24),
    lines: [
      { description: 'Maquette UI', quantity: 1, unitPrice: mockup.unitPrice, vatRate: 21, productId: mockup.id },
      { description: 'Intégration', quantity: 5, unitPrice: dev.unitPrice, vatRate: 21, productId: dev.id },
    ],
  })
  await s.quote.add({
    clientId: marie.id, status: QuoteStatus.DRAFT,
    issueDate: at(-1), validUntil: at(40),
    lines: [{ description: 'Conseil stratégique', quantity: 10, unitPrice: advice.unitPrice, vatRate: 21, productId: advice.id }],
  })
  await s.quote.add({
    clientId: studio.id, status: QuoteStatus.REJECTED,
    issueDate: at(-30), validUntil: at(-2),
    lines: [{ description: 'Développement complémentaire', quantity: 8, unitPrice: dev.unitPrice, vatRate: 21, productId: dev.id }],
  })
  await s.quote.add({
    clientId: bakery.id, projectId: maintenance.id, status: QuoteStatus.SENT,
    issueDate: at(-3), validUntil: at(18),
    lines: [{ description: 'Forfait maintenance annuel', quantity: 12, unitPrice: advice.unitPrice, vatRate: 21, productId: advice.id }],
  })

  const payFull = (inv: InvoiceDto, day: number): Promise<InvoiceDto> =>
    s.invoice.addPayment({ invoiceId: inv.id, amount: inv.totalTtc, method: PaymentMethod.TRANSFER, date: at(day) })

  const i1 = await s.invoice.add({
    clientId: bakery.id, projectId: site.id, status: InvoiceStatus.SENT,
    issueDate: at(-75), dueDate: at(-45),
    lines: [{ description: 'Site vitrine — forfait', quantity: 12.5, unitPrice: dev.unitPrice, vatRate: 21, productId: dev.id }],
  })
  await payFull(i1, -50)

  await s.invoice.add({
    clientId: studio.id, projectId: reservation.id, status: InvoiceStatus.SENT,
    issueDate: at(-30), dueDate: at(-5),
    lines: [{ description: 'Développement — sprint 1', quantity: 10, unitPrice: dev.unitPrice, vatRate: 21, productId: dev.id }],
  })

  const i3 = await s.invoice.add({
    clientId: studio.id, projectId: brand.id, status: InvoiceStatus.SENT,
    issueDate: at(-15), dueDate: at(15),
    lines: [{ description: 'Identité visuelle — phase 1', quantity: 20, unitPrice: advice.unitPrice, vatRate: 21, productId: advice.id }],
  })
  await s.invoice.addPayment({ invoiceId: i3.id, amount: 1000, method: PaymentMethod.TRANSFER, date: at(-3) })

  await s.invoice.add({
    clientId: bakery.id, projectId: maintenance.id, status: InvoiceStatus.SENT,
    issueDate: at(-5), dueDate: at(25),
    lines: [{ description: 'Maintenance — trimestre', quantity: 12, unitPrice: 65, vatRate: 21 }],
  })

  await s.invoice.add({
    clientId: marie.id, status: InvoiceStatus.DRAFT,
    issueDate: at(-2), dueDate: at(28),
    lines: [{ description: 'Conseil — première séance', quantity: 4, unitPrice: advice.unitPrice, vatRate: 21, productId: advice.id }],
  })

  const i6 = await s.invoice.add({
    clientId: studio.id, projectId: reservation.id, status: InvoiceStatus.SENT,
    issueDate: at(-90), dueDate: at(-60),
    lines: [
      { description: 'Développement — cadrage', quantity: 6, unitPrice: dev.unitPrice, vatRate: 21, productId: dev.id },
      { description: 'Maquette UI', quantity: 1, unitPrice: mockup.unitPrice, vatRate: 21, productId: mockup.id },
    ],
  })
  await payFull(i6, -65)

  await s.invoice.add({
    clientId: bakery.id, status: InvoiceStatus.SENT,
    issueDate: at(-40), dueDate: at(-2),
    lines: [{ description: 'Développement complémentaire', quantity: 3, unitPrice: dev.unitPrice, vatRate: 21, productId: dev.id }],
  })

  const i8 = await s.invoice.add({
    clientId: studio.id, projectId: brand.id, status: InvoiceStatus.SENT,
    issueDate: at(-20), dueDate: at(25),
    lines: [{ description: 'Forfait maquette UI', quantity: 1, unitPrice: mockup.unitPrice, vatRate: 21, productId: mockup.id }],
  })
  await payFull(i8, -10)
}
