-- NomadFree passa a ser um catálogo de estações de esqui.
-- Remove o catálogo antigo (destinos e oportunidades de demonstração) e cria o novo modelo.
-- Os dados de demonstração são recriados com `npm run db:seed`.

-- DropTable
DROP TABLE IF EXISTS "Opportunity";

-- DropTable
DROP TABLE IF EXISTS "Destination";

-- DropEnum
DROP TYPE IF EXISTS "Category";

-- DropEnum
DROP TYPE IF EXISTS "Region";

-- CreateEnum
CREATE TYPE "Tag" AS ENUM ('FAMILY', 'BEGINNERS', 'ADVANCED', 'FREERIDE', 'LARGE_AREA', 'HIGH_ALTITUDE', 'APRES_SKI', 'LUXURY', 'BUDGET', 'PARK');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('ALPS', 'EUROPE_OTHER', 'NORTH_AMERICA', 'ASIA', 'SOUTH_AMERICA', 'OCEANIA');

-- CreateTable
CREATE TABLE "Resort" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "mountainRange" TEXT NOT NULL,
    "tags" "Tag"[],
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "curatedRank" INTEGER NOT NULL,
    "topElevationM" INTEGER NOT NULL,
    "areaLabel" TEXT NOT NULL,
    "sizeRank" INTEGER NOT NULL,
    "seasonLabel" TEXT NOT NULL,
    "dailyBudgetMinor" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "priceKind" "PriceKind" NOT NULL DEFAULT 'ESTIMATE',
    "verifiedAt" TIMESTAMP(3),
    "sourceLabel" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resort_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resort_slug_key" ON "Resort"("slug");

-- CreateIndex
CREATE INDEX "Resort_region_idx" ON "Resort"("region");

-- CreateIndex
CREATE INDEX "Resort_country_idx" ON "Resort"("country");

-- CreateIndex
CREATE INDEX "Resort_dailyBudgetMinor_idx" ON "Resort"("dailyBudgetMinor");

-- CreateIndex
CREATE INDEX "Resort_curatedRank_idx" ON "Resort"("curatedRank");
