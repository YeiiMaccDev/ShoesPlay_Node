const { request, response } = require("express");
const { Product } = require("../models");


const getProducts = async (req = request, res = response) => {
    const { offset = 0, limit = 100 } = req.query;
    const queryStatus = { status: true };
    try {
        const [totalProducts, products] = await Promise.all([
            Product.countDocuments(queryStatus),
            Product.find(queryStatus)
                .populate('user', 'name')
                .populate('gender', 'name')
                .populate('category', 'name')
                .sort({ createdAt: -1 })
                .skip(Number(offset))
                .limit(Number(limit))
        ]);

        res.json({
            ok: true,
            totalProducts,
            products
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}


const getProductById = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id)
            .populate('user', 'name')
            .populate('gender', 'name')
            .populate('category', 'name');

        res.json({
            ok: true,
            product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}


const createProduct = async (req = request, res = response) => {
    const { status, user, name, ...body } = req.body;
    const nameUpperCase = name.toUpperCase();
    try {
        // const existsProduct = await Product.findOne({ name: nameUpperCase });
        // if (existsProduct) {
        //     return res.status(400).json({
        //          ok: false,
        //         msg: `El producto ${existsProduct.name} ya existe.`
        //     });
        // }

        const data = {
            name: nameUpperCase,
            user: req.authenticatedUser._id,
            ...body
        }

        const product = new Product(data);
        await product.save();

        res.status(201).json({
            ok: true,
            product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}


const updateProduct = async (req = request, res = response) => {
    const { id } = req.params;
    const { status, user, ...body } = req.body;

    const data = {
        user: req.authenticatedUser._id,
        ...body
    }

    if (body.name) {
        body.name = data.name.toUpperCase();
    }

    try {
        const product = await Product.findByIdAndUpdate(id, data, { new: true });

        res.json({
            ok: true,
            product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}


const deleteProduct = async (req = request, res = response) => {
    const { id } = req.params;
    const user = req.authenticatedUser._id;

    try {
        const product = await Product.findByIdAndUpdate(id, { status: false, user }, { new: true });

        res.json({
            ok: true,
            product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}