const { request, response } = require("express");
const { isValidObjectId } = require("mongoose");

const {
    Category,
    Product,
    User
} = require("../models");


const collectionsAuthorized = [
    'categories',
    'products',
    'productsByCategory',
    'roles',
    'users',
];


const searchCategories = async (query = '', res = response) => {
    try {
        const isMongoId = isValidObjectId(query);

        if (isMongoId) {
            const category = await Category.findById(query);
            return res.json({
                ok: true,
                results: (category) ? [category] : []
            });
        }

        const regex = new RegExp(query, 'i');

        const category = await Category.find({ name: regex, status: true });

        res.json({
            ok: true,
            results: category
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}


const searchProducts = async (query = '', res = response) => {
    try {
        const isMongoId = isValidObjectId(query);

        const regex = new RegExp(query, 'i');
        const products = await Product.find({
            $or: [{ name: regex }, { description: regex }, { reference: regex }],
            $and: [{ status: true }]
        })
            .populate('gender', 'name')
            .populate('category', 'name');

        if (!products && isMongoId) {
            const product = await Product.findById(query)
                .populate('gender', 'name')
                .populate('category', 'name');
            return res.json({
                ok: true,
                results: (product) ? [product] : []
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }

}

const searchProductsByCategory = async (query = '', res = response) => {
    try {
        const isMongoId = isValidObjectId(query);
        let category = '';

        const regex = new RegExp(query, 'i');
        category = await Category.findOne({ name: regex, status: true });

        if (!category && isMongoId) {
            category = await Category.findById(query);
        }

        if (category) {
            const products = await Product.find({ category: category._id, status: true })
                .populate('gender', 'name')
                .populate('category', 'name');

            return res.json({
                ok: true,
                results: products
            });
        }

        res.json({
            ok: true,
            results: []
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}

const searchUser = async (query = '', res = response) => {
    try {
        const isMongoId = isValidObjectId(query);

        if (isMongoId) {
            const user = await User.findById(query);
            return res.json({
                results: (user) ? [user] : []
            });
        }

        const regex = new RegExp(query, 'i');

        const users = await User.find({
            $or: [{ name: regex }, { email: regex }],
            $and: [{ status: true }]
        });

        res.json({
            ok: true,
            results: users
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}

const search = async (req = request, res = response) => {
    const { collection, query } = req.params;

    if (!collectionsAuthorized.includes(collection)) {
        return res.status(400).json({
            ok: false,
            msg: `Calecciones permitidas: ${collectionsAuthorized}`
        });
    }

    switch (collection) {
        case 'categories':
            searchCategories(query, res);
            break;
        case 'products':
            searchProducts(query, res);
            break;
        case 'productsByCategory':
            searchProductsByCategory(query, res);
            break;
        case 'users':
            searchUser(query, res);
            break;
        default:
            res.status(500).json({
                ok: false,
                msg: `Olvidé hacer esta búsqueda ${collection}`
            });
            break;
    }

}

module.exports = {
    search
}