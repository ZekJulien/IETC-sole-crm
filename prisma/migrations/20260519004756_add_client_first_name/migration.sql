-- AlterTable: ajout du champ firstName optionnel sur Client (pour les clients de type INDIVIDUAL)
ALTER TABLE "Client" ADD COLUMN "firstName" TEXT;
