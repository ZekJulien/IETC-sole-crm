import validation from '../validation/fr'
import common from '../ui/common.fr'
import client from '../ui/client/client.fr'
import contact from '../ui/client/contact.fr'
import company from '../ui/company/company.fr'
import category from '../ui/category/category.fr'
import expenseCategory from '../ui/expense-category/expense-category.fr'
import project from '../ui/project/project.fr'
import task from '../ui/task/task.fr'
import time from '../ui/time-entry/time.fr'
import expense from '../ui/expense/expense.fr'
import quote from '../ui/quote/quote.fr'
import invoice from '../ui/invoice/invoice.fr'
import vatRate from '../ui/vat-rate/vat-rate.fr'
import product from '../ui/product/product.fr'
import settings from '../ui/settings/settings.fr'
import wizard from '../ui/welcome-wizard/welcome-wizard.fr'
import conversion from '../ui/conversion/conversion.fr'
import pdf from '../ui/pdf/pdf.fr'
import dashboard from '../ui/dashboard/dashboard.fr'

export default {
  ...validation, ...common, ...client, ...contact, ...company, ...category,
  ...expenseCategory, ...project, ...task, ...time, ...expense, ...quote,
  ...invoice, ...vatRate, ...product, ...settings, ...wizard, ...conversion, ...pdf,
  ...dashboard,
} satisfies Record<string, string>
