-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanySettings" (
    "companyId" TEXT NOT NULL PRIMARY KEY,
    "defaultVatRate" REAL NOT NULL DEFAULT 21,
    "vatRegime" TEXT NOT NULL DEFAULT 'NORMAL' CHECK ("vatRegime" IN ('NORMAL', 'FRANCHISE')),
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "paymentConditions" TEXT,
    "dashboardNote" TEXT,
    "pomodoroWorkMinutes" INTEGER NOT NULL DEFAULT 25,
    "pomodoroShortBreakMinutes" INTEGER NOT NULL DEFAULT 5,
    "pomodoroLongBreakMinutes" INTEGER NOT NULL DEFAULT 15,
    "pomodoroLongBreakInterval" INTEGER NOT NULL DEFAULT 4,
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
INSERT INTO "new_CompanySettings" ("companyId", "createdAt", "dashboardNote", "defaultVatRate", "invoiceCounterResetYearly", "invoiceCounterYear", "invoiceNumberCounter", "invoiceNumberFormat", "paymentConditions", "paymentTermsDays", "quoteCounterResetYearly", "quoteCounterYear", "quoteNumberCounter", "quoteNumberFormat", "updatedAt", "vatRegime") SELECT "companyId", "createdAt", "dashboardNote", "defaultVatRate", "invoiceCounterResetYearly", "invoiceCounterYear", "invoiceNumberCounter", "invoiceNumberFormat", "paymentConditions", "paymentTermsDays", "quoteCounterResetYearly", "quoteCounterYear", "quoteNumberCounter", "quoteNumberFormat", "updatedAt", "vatRegime" FROM "CompanySettings";
DROP TABLE "CompanySettings";
ALTER TABLE "new_CompanySettings" RENAME TO "CompanySettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
