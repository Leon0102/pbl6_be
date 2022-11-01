/*
  Warnings:

  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_property_id_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_room_id_fkey";

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "photos" TEXT[];

-- AlterTable
ALTER TABLE "room_types" ADD COLUMN     "photos" TEXT[];

-- DropTable
DROP TABLE "images";
