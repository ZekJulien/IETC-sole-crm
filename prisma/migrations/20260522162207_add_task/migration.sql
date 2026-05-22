-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO' CHECK ("status" IN ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED')),
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM' CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
