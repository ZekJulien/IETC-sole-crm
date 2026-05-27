import validation from '../validation/en'
import common from '../ui/common.en'
import client from '../ui/client/client.en'
import contact from '../ui/client/contact.en'
import company from '../ui/company/company.en'
import category from '../ui/category/category.en'
import expenseCategory from '../ui/expense-category/expense-category.en'
import project from '../ui/project/project.en'
import task from '../ui/task/task.en'
import time from '../ui/time-entry/time.en'
import expense from '../ui/expense/expense.en'
import quote from '../ui/quote/quote.en'
import invoice from '../ui/invoice/invoice.en'
import vatRate from '../ui/vat-rate/vat-rate.en'
import product from '../ui/product/product.en'
import settings from '../ui/settings/settings.en'
import wizard from '../ui/welcome-wizard/welcome-wizard.en'
import conversion from '../ui/conversion/conversion.en'

export default {
  ...validation, ...common, ...client, ...contact, ...company, ...category,
  ...expenseCategory, ...project, ...task, ...time, ...expense, ...quote,
  ...invoice, ...vatRate, ...product, ...settings, ...wizard, ...conversion,
} satisfies Record<string, string>
