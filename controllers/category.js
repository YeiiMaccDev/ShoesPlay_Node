const { request, response } = require("express");

const { Category } = require('../models');


// Get Category - Pagination - total - populate
const getCategories = async (req = request, res = response) => {
    const { offset = 0, limit = 10 } = req.query;
    const queryStatus = { status: true };

    try {
        const [totalCategories, categories] = await Promise.all([
            Category.countDocuments(queryStatus),
            Category.find(queryStatus)
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .skip(Number(offset))
                .limit(Number(limit))
        ]);

        res.json({
            ok: false,
            totalCategories,
            categories
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }

}


// Get Category -  populate
const getCategoryById = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id).populate('user', 'name');

        res.json({
            ok: true,
            category
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}


const createCategory = async (req = request, res = response) => {
    const name = req.body.name.toUpperCase();

    try {

        const existsCategory = await Category.findOne({ name });

        if (existsCategory) {
            return res.status(400).json({
                ok: true,
                msg: `La categoría ${existsCategory.name} ya existe.`
            });
        }

        // Generate data
        const data = {
            name,
            user: req.authenticatedUser._id
        }

        const category = new Category(data);
        await category.save();

        res.status(201).json({
            ok: true,
            category
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }

}

// Update Category 
const updateCategory = async (req = request, res = response) => {
    const { id } = req.params;
    const name = req.body.name.toUpperCase();
    const user = req.authenticatedUser._id;

    const data = {
        name,
        user
    }

    try {
        const category = await Category.findByIdAndUpdate(id, data, { new: true });

        res.json({
            ok: true,
            category
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}

// Delete Category
const deleteCategory = async (req = request, res = response) => {
    const { id } = req.params;
    const user = req.authenticatedUser._id;

    try {
        const category = await Category.findByIdAndUpdate(id, { status: false, user }, { new: true })

        res.json({
            ok: true,
            category
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
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
}