import validation from '../validation/de'
import common from '../ui/common.de'
import client from '../ui/client/client.de'
import contact from '../ui/client/contact.de'
import company from '../ui/company/company.de'
import category from '../ui/category/category.de'
import expenseCategory from '../ui/expense-category/expense-category.de'
import project from '../ui/project/project.de'
import task from '../ui/task/task.de'
import time from '../ui/time-entry/time.de'
import expense from '../ui/expense/expense.de'
import quote from '../ui/quote/quote.de'
import invoice from '../ui/invoice/invoice.de'
import vatRate from '../ui/vat-rate/vat-rate.de'
import product from '../ui/product/product.de'
import settings from '../ui/settings/settings.de'
import wizard from '../ui/welcome-wizard/welcome-wizard.de'

export default {
  ...validation, ...common, ...client, ...contact, ...company, ...category,
  ...expenseCategory, ...project, ...task, ...time, ...expense, ...quote,
  ...invoice, ...vatRate, ...product, ...settings, ...wizard,
} satisfies Record<string, string>
