-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "experienceType",
ADD COLUMN     "categoryId" TEXT;

-- DropEnum
DROP TYPE "ExperienceType";

-- CreateTable
CREATE TABLE "ExperienceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceCategory_name_key" ON "ExperienceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceCategory_slug_key" ON "ExperienceCategory"("slug");

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExperienceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

