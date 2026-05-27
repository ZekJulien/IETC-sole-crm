-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "supplyDate" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvoiceLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "vatRate" REAL NOT NULL DEFAULT 21,
    "invoiceId" INTEGER NOT NULL,
    "productId" INTEGER,
    CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvoiceLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InvoiceLine" ("description", "id", "invoiceId", "productId", "quantity", "unitPrice", "vatRate") SELECT "description", "id", "invoiceId", "productId", "quantity", "unitPrice", "vatRate" FROM "InvoiceLine";
DROP TABLE "InvoiceLine";
ALTER TABLE "new_InvoiceLine" RENAME TO "InvoiceLine";
CREATE TABLE "new_QuoteLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "vatRate" REAL NOT NULL DEFAULT 21,
    "quoteId" INTEGER NOT NULL,
    "productId" INTEGER,
    CONSTRAINT "QuoteLine_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuoteLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QuoteLine" ("description", "id", "productId", "quantity", "quoteId", "unitPrice", "vatRate") SELECT "description", "id", "productId", "quantity", "quoteId", "unitPrice", "vatRate" FROM "QuoteLine";
DROP TABLE "QuoteLine";
ALTER TABLE "new_QuoteLine" RENAME TO "QuoteLine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
