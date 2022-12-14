-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'HOST', 'GUEST');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED', 'COMPLETED');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" "RoleType" NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "point" INTEGER NOT NULL DEFAULT 0,
    "avatar" TEXT,
    "role_id" TEXT NOT NULL DEFAULT 'guest',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "ward_code" VARCHAR(20) NOT NULL,
    "street_address" TEXT NOT NULL,
    "facilities" JSONB,
    "room_count" INTEGER NOT NULL,
    "photos" TEXT[],
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "property_id" INTEGER NOT NULL,
    "room_count" INTEGER NOT NULL,
    "photos" TEXT[],
    "description" TEXT NOT NULL,
    "facilities" JSONB,
    "max_guests" INTEGER NOT NULL,
    "size" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "room_type_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "check_in" TIMESTAMP(3) NOT NULL,
    "check_out" TIMESTAMP(3) NOT NULL,
    "special_request" TEXT,
    "status" "ReservationStatus" NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_reserved" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_reserved_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrative_regions" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "code_name" VARCHAR(255),
    "code_name_en" VARCHAR(255),

    CONSTRAINT "administrative_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrative_units" (
    "id" INTEGER NOT NULL,
    "full_name" VARCHAR(255),
    "full_name_en" VARCHAR(255),
    "short_name" VARCHAR(255),
    "short_name_en" VARCHAR(255),
    "code_name" VARCHAR(255),
    "code_name_en" VARCHAR(255),

    CONSTRAINT "administrative_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "full_name" VARCHAR(255) NOT NULL,
    "full_name_en" VARCHAR(255),
    "code_name" VARCHAR(255),
    "administrative_unit_id" INTEGER NOT NULL,
    "administrative_region_id" INTEGER NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "districts" (
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "full_name_en" VARCHAR(255),
    "code_name" VARCHAR(255),
    "province_code" VARCHAR(20) NOT NULL,
    "administrative_unit_id" INTEGER NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "wards" (
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "full_name" VARCHAR(255),
    "full_name_en" VARCHAR(255),
    "code_name" VARCHAR(255),
    "district_code" VARCHAR(20) NOT NULL,
    "administrative_unit_id" INTEGER NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "room_types_name_key" ON "room_types"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ward_code_fkey" FOREIGN KEY ("ward_code") REFERENCES "wards"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_reserved" ADD CONSTRAINT "room_reserved_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_reserved" ADD CONSTRAINT "room_reserved_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provinces" ADD CONSTRAINT "provinces_administrative_unit_id_fkey" FOREIGN KEY ("administrative_unit_id") REFERENCES "administrative_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provinces" ADD CONSTRAINT "provinces_administrative_region_id_fkey" FOREIGN KEY ("administrative_region_id") REFERENCES "administrative_regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "provinces"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_administrative_unit_id_fkey" FOREIGN KEY ("administrative_unit_id") REFERENCES "administrative_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_district_code_fkey" FOREIGN KEY ("district_code") REFERENCES "districts"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_administrative_unit_id_fkey" FOREIGN KEY ("administrative_unit_id") REFERENCES "administrative_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
