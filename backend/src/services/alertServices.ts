import { prisma } from "../lib/prisma.js";

// Passa productId, para saber qual produto procurar
export async function checkAndCreateLowStockAlert(productId: number) {
  const findProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!findProduct) {
    return null;
  }

  //Verify if stock is low or equal minimum
  if (findProduct.currentStock <= findProduct.minimumStock) {
    //Search if there is an unread alert
    const existingAlert = await prisma.alert.findFirst({
      where: {
        productId: productId,
        type: "LOW_STOCK",
        read: false,
      },
    });

    if (!existingAlert) {
      const alert = await prisma.alert.create({
        data: {
          productId: productId,
          type: "LOW_STOCK",
          message: `Low stock! The product “${findProduct.name}” has ${findProduct.currentStock} ${findProduct.unit}, below the minimum of ${findProduct.minimumStock} ${findProduct.unit}.`,
        },
      });

      return alert;
    }

    return existingAlert;
  } else {
    //If inventory has returned to normal, mark alerts as read.
    await prisma.alert.updateMany({
      where: {
        productId: productId,
        type: "LOW_STOCK",
        read: false,
      },
      data: {
        read: true,
      },
    });
    return null;
  }
}
