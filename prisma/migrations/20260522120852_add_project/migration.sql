-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROSPECT' CHECK ("status" IN ('PROSPECT', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),
    "startDate" DATETIME,
    "endDate" DATETIME,
    "hourlyRate" REAL,
    "dailyRate" REAL,
    "budget" REAL,
    "clientId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectCategory" (
    "projectId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    PRIMARY KEY ("projectId", "categoryId"),
    CONSTRAINT "ProjectCategory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
