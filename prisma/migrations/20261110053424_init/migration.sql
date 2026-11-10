-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardMeta" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL DEFAULT 'Program Kerja Prioritas Nasional (PKPN)',
    "subtitle" TEXT NOT NULL DEFAULT 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
    "cutoffDate" TEXT NOT NULL DEFAULT '18 Oktober 2026',
    "ministerTitle" TEXT NOT NULL DEFAULT 'Menteri Koordinator Bidang Pembangunan Manusia dan Kebudayaan (Menko PMK)',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PillarCard" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pillarId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'PKPN',
    "title" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '—',
    "unit" TEXT DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Menunggu Data Realisasi',
    "target" TEXT NOT NULL DEFAULT 'Target: Belum Ditetapkan',
    "percent" DOUBLE PRECISION,
    "subtext" TEXT,
    "description" TEXT,
    "picKementerian" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isMilestone" BOOLEAN NOT NULL DEFAULT false,
    "milestoneContent" TEXT,
    "annualTargets" JSONB,
    "monthlyData" JSONB,
    "kendalaList" JSONB,
    "updateLogs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PillarCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PillarAgregat" (
    "id" TEXT NOT NULL,
    "pillarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "indicators" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PillarAgregat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapIndicator" (
    "id" TEXT NOT NULL,
    "pillarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "nationalValue" TEXT NOT NULL,
    "target2026" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minVal" DOUBLE PRECISION NOT NULL,
    "maxVal" DOUBLE PRECISION NOT NULL,
    "isLowerBetter" BOOLEAN NOT NULL DEFAULT false,
    "colorScheme" TEXT NOT NULL DEFAULT 'blue',
    "isNationalOnly" BOOLEAN NOT NULL DEFAULT false,
    "customRegionType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SugLocation" (
    "id" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,
    "kodeBps" TEXT NOT NULL,
    "provinceName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SugLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BencanaReport" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "ringkasanUtama" JSONB NOT NULL,
    "pengkinianData" JSONB NOT NULL,
    "vervalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BencanaReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PillarCard_slug_key" ON "PillarCard"("slug");

-- CreateIndex
CREATE INDEX "PillarCard_pillarId_category_idx" ON "PillarCard"("pillarId", "category");

-- CreateIndex
CREATE INDEX "PillarCard_isActive_idx" ON "PillarCard"("isActive");

-- CreateIndex
CREATE INDEX "PillarAgregat_pillarId_idx" ON "PillarAgregat"("pillarId");

-- CreateIndex
CREATE INDEX "MapIndicator_pillarId_idx" ON "MapIndicator"("pillarId");

-- CreateIndex
CREATE INDEX "SugLocation_provinceId_idx" ON "SugLocation"("provinceId");

-- CreateIndex
CREATE INDEX "SugLocation_type_idx" ON "SugLocation"("type");
