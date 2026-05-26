-- CreateTable
CREATE TABLE "VatRate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VatRate_rate_key" ON "VatRate"("rate");

-- Seed Belgian VAT rates (standard 21 set as default)
INSERT INTO "VatRate" ("label", "rate", "isDefault", "createdAt", "updatedAt") VALUES
  ('Standard',      21, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Intermédiaire', 12, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Réduit',         6, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Exonéré',        0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
