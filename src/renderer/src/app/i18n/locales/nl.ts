import validation from '../validation/nl'
import common from '../ui/common.nl'
import client from '../ui/client/client.nl'
import contact from '../ui/client/contact.nl'
import company from '../ui/company/company.nl'
import category from '../ui/category/category.nl'
import expenseCategory from '../ui/expense-category/expense-category.nl'
import project from '../ui/project/project.nl'
import task from '../ui/task/task.nl'
import time from '../ui/time-entry/time.nl'
import expense from '../ui/expense/expense.nl'
import quote from '../ui/quote/quote.nl'
import invoice from '../ui/invoice/invoice.nl'
import vatRate from '../ui/vat-rate/vat-rate.nl'
import product from '../ui/product/product.nl'
import settings from '../ui/settings/settings.nl'
import wizard from '../ui/welcome-wizard/welcome-wizard.nl'
import conversion from '../ui/conversion/conversion.nl'

export default {
  ...validation, ...common, ...client, ...contact, ...company, ...category,
  ...expenseCategory, ...project, ...task, ...time, ...expense, ...quote,
  ...invoice, ...vatRate, ...product, ...settings, ...wizard, ...conversion,
} satisfies Record<string, string>
