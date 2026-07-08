-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL,
    "sort_field" TEXT NOT NULL DEFAULT 'createdAt',
    "sort_direction" TEXT NOT NULL DEFAULT 'desc',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
