import prisma from '../modules/db';


// const alertProductOwner = async (productId, remainingStock) => {
//     const product = await prisma.product.findUnique({
//         where: { id: productId },
//         include: { creator: true }
//     });

//     if (product && product.stock <= 5) {
//         console.log(`Alert: Stock for product ${product.name} is low. Remaining stock: ${remainingStock}.`);
//         // Here you would put your actual alert logic, such as sending an email notification.
//         // e.g., sendEmail(product.creator.email, `Stock for ${product.name} is low`, `Remaining stock: ${remainingStock}`);
//     }
// };


export const listOrders = async (req, res) => {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
        where: { userId: userId },
        include: { orderItems: true }
    });
    res.formattedJson(200, orders);
};


export const getOrderById = async (req, res) => {
    const userId = req.user.id;
    const order = await prisma.order.findUnique({
        where: { id: req.params.id, userId: userId },
        include: { orderItems: true }
    });
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }
    res.formattedJson(200, order);
};


export const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { orderItems } = req.body;

    const products = await prisma.product.findMany({
        where: {
            id: { in: orderItems.map(item => item.productId) }
        }
    });

    let totalPrice = 0;
    const itemsData = [];

    for (const item of orderItems) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }

        if (product.stock < item.quantity) {
            return res.status(400).json({ message: `Not enough stock for product with ID ${item.productId}` });
        }

        totalPrice += product.price * item.quantity;
        itemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
        });
    }

    // Create order and order items
    const newOrder = await prisma.order.create({
        data: {
            userId,
            status: 'PENDING',
            totalPrice,
            orderItems: {
                create: itemsData,
            },
        },
        include: {
            orderItems: true,
        },
    });

    // Update stock for each product
    await Promise.all(itemsData.map(item => {
        return prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
        });
    }));

    res.formattedJson(201, newOrder, 'Order successfully created');
};


export const updateOrder = async (req, res) => {
    const userId = req.user.id;
    const { orderItems: updatedOrderItems } = req.body;

    const existingOrder = await prisma.order.findUnique({
        where: { id: req.params.id, userId: userId },
        include: { orderItems: true }
    });

    if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const originalOrderItems = new Map(existingOrder.orderItems.map(item => [item.productId, item]));
    const updatedProductIds = updatedOrderItems.map(item => item.productId);

    const allProductIds = [...Array.from(originalOrderItems.keys()), ...updatedProductIds];
    const products = await prisma.product.findMany({
        where: { id: { in: allProductIds } }
    });

    // Stock adjustments initialization with original quantities (add back first)
    let stockAdjustments = new Map();
    originalOrderItems.forEach((item, productId) => {
        stockAdjustments.set(productId, item.quantity);
    });

    // Calculate new total price and update stock adjustments based on the updated order
    let totalPrice = 0;
    for (const item of updatedOrderItems) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }

        if (product.stock + (stockAdjustments.get(item.productId) || 0) < item.quantity) {
            return res.status(400).json({ message: `Not enough stock for product with ID ${item.productId}` });
        }

        // Update stock adjustment: subtract new item quantity
        stockAdjustments.set(item.productId, (stockAdjustments.get(item.productId) || 0) - item.quantity);

        totalPrice += product.price * item.quantity;
    }

    // Update the order with new total price
    const updateData = {
        totalPrice,
        orderItems: {
            deleteMany: {},
            create: updatedOrderItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: products.find(p => p.id === item.productId).price,
            })),
        },
    };

    const updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: updateData,
    });

    // Adjust stock for all affected products
    await Promise.all(Array.from(stockAdjustments.entries()).map(([productId, adjustment]) => {
        return prisma.product.update({
            where: { id: productId },
            data: { stock: { increment: adjustment } },
        });
    }));

    res.formattedJson(200, updatedOrder, 'Order successfully updated');
};


export const deleteOrder = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id;

    const result = await prisma.$transaction(async (prisma) => {
        // Find the order including order items
        const order = await prisma.order.findUnique({
            where: { id: orderId, userId: userId },
            include: { orderItems: true }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found or you're not authorized to delete this order" });
        }

        // Update the stock for each product based on the order items
        await Promise.all(order.orderItems.map(item => {
            return prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
            });
        }));

        await prisma.orderItem.deleteMany({
            where: { orderId: order.id }
        });

        await prisma.order.delete({
            where: { id: order.id }
        });

        return order;
    });

    res.formattedJson(204, null, 'Order successfully deleted');
};
