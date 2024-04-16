-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VisitorLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "visitTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationSubscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "DeviceSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "componentName" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
