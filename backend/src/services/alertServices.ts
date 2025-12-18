import { prisma } from "../lib/prisma.js";

// Passa productId, para saber qual produto procurar
export async function checkAndCreateLowStockAlert(productId: number) {
  const findProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!findProduct) {
    return null;
  }

  

}
