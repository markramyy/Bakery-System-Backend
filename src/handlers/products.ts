import prisma from '../modules/db';
import ImageKit from 'imagekit';
import fs from 'fs';
import multer from 'multer';


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const upload = multer({ storage: storage });


const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});


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
    const { name, description } = req.body;
    let { price, stock } = req.body;
    const creatorId = req.user.id;
    const images = req.files;

    try {
        price = parseFloat(price);
        stock = parseInt(stock);

        if (isNaN(price) || isNaN(stock)) {
            return res.status(400).json({ message: "Invalid price or stock value" });
        }

        const uploadedImages = await Promise.all(images.map(async image => {
            const buffer = image.buffer || fs.readFileSync(image.path);
            const uploadResponse = await imageKit.upload({
                file: buffer,
                fileName: image.originalname,
            });
            return uploadResponse;
        }));

        const imageUrls = uploadedImages.map(upload => upload.url);

        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                images: imageUrls,
                creatorId,
            },
        });

        res.formattedJson(201, newProduct, 'Product successfully created');
    } catch (error) {
        console.error('Failed to create product:', error);
        res.status(400).json({ message: 'Failed to create product', error: error.message });
    }
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
