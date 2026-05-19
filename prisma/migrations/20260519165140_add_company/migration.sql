-- CreateTable
CREATE TABLE "CompanySettings" (
    "companyId" TEXT NOT NULL PRIMARY KEY,
    "defaultVatRate" REAL NOT NULL DEFAULT 21,
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "paymentConditions" TEXT,
    "invoiceNumberFormat" TEXT NOT NULL DEFAULT 'INV-{YYYY}-{####}',
    "invoiceNumberCounter" INTEGER NOT NULL DEFAULT 0,
    "invoiceCounterResetYearly" BOOLEAN NOT NULL DEFAULT true,
    "invoiceCounterYear" INTEGER NOT NULL DEFAULT 0,
    "quoteNumberFormat" TEXT NOT NULL DEFAULT 'QUO-{YYYY}-{####}',
    "quoteNumberCounter" INTEGER NOT NULL DEFAULT 0,
    "quoteCounterResetYearly" BOOLEAN NOT NULL DEFAULT true,
    "quoteCounterYear" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanySettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "name" TEXT NOT NULL,
    "legalForm" TEXT,
    "street" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "country" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "companyNumber" TEXT,
    "vatNumber" TEXT,
    "peppolId" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "logoPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
