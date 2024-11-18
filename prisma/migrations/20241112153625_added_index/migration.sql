/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Category` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Product` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_productId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingCart" DROP CONSTRAINT "ShoppingCart_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_userId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "id",
ADD COLUMN     "category_id" SERIAL NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id");

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "id",
ADD COLUMN     "product_id" SERIAL NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "user_id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");

-- CreateIndex
CREATE INDEX "idx_categoryName" ON "Category"("categoryName");

-- CreateIndex
CREATE INDEX "idx_order_userId" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "idx_productName" ON "Product"("productName");

-- CreateIndex
CREATE INDEX "idx_vendorId" ON "Product"("vendorId");

-- CreateIndex
CREATE INDEX "idx_username" ON "User"("username");

-- CreateIndex
CREATE INDEX "idx_vendor_userId" ON "Vendor"("userId");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "Category"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCart" ADD CONSTRAINT "ShoppingCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
