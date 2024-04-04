import prisma from '../modules/db';


export const listProducts = async (req, res) => {
    const products = await prisma.product.findMany();
    res.formattedJson(200, products);
};


export const getProductById = async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: req.params.id },
    });
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.formattedJson(200, product);
};


export const createProduct = async (req, res) => {
    const { name, description, price, stock } = req.body;
    const creatorId = req.user.id;
    const newProduct = await prisma.product.create({
        data: {
            name,
            description,
            price,
            stock,
            creatorId,
        },
    });
    res.formattedJson(201, newProduct, 'Product successfully created');
};


export const updateProduct = async (req, res) => {
    const updatedProduct = await prisma.product.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.formattedJson(200, updatedProduct, 'Product successfully updated');
};


export const deleteProduct = async (req, res) => {
    await prisma.product.delete({
        where: { id: req.params.id },
    });
    res.formattedJson(204, null, 'Product successfully deleted');
};
