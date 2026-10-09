-- CreateEnum
CREATE TYPE "Category" AS ENUM ('BUDGET_DESTINATION', 'ACCOMMODATION_EXCHANGE', 'VOLUNTEERING', 'REMOTE_FRIENDLY');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('SOUTH_AMERICA', 'CENTRAL_AMERICA_CARIBBEAN', 'EUROPE', 'ASIA', 'AFRICA');

-- CreateEnum
CREATE TYPE "PriceKind" AS ENUM ('ESTIMATE', 'VERIFIED');

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "categories" "Category"[],
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dailyBudgetMinor" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "priceKind" "PriceKind" NOT NULL DEFAULT 'ESTIMATE',
    "verifiedAt" TIMESTAMP(3),
    "sourceLabel" TEXT NOT NULL,
    "remoteWorkScore" INTEGER NOT NULL,
    "internetNotes" TEXT NOT NULL,
    "coworkingNotes" TEXT NOT NULL,
    "bestSeason" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "destinationId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "conditions" TEXT NOT NULL,
    "hoursPerWeek" INTEGER,
    "dailyCostMinor" INTEGER NOT NULL,
    "upfrontFeeMinor" INTEGER,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "priceKind" "PriceKind" NOT NULL DEFAULT 'ESTIMATE',
    "verifiedAt" TIMESTAMP(3),
    "sourceLabel" TEXT NOT NULL,
    "externalUrl" TEXT,
    "imageKey" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- CreateIndex
CREATE INDEX "Destination_region_idx" ON "Destination"("region");

-- CreateIndex
CREATE INDEX "Destination_dailyBudgetMinor_idx" ON "Destination"("dailyBudgetMinor");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_slug_key" ON "Opportunity"("slug");

-- CreateIndex
CREATE INDEX "Opportunity_destinationId_idx" ON "Opportunity"("destinationId");

-- CreateIndex
CREATE INDEX "Opportunity_category_idx" ON "Opportunity"("category");

-- CreateIndex
CREATE INDEX "Opportunity_dailyCostMinor_idx" ON "Opportunity"("dailyCostMinor");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
