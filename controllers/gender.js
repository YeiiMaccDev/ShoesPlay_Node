const { request, response } = require("express");

const { Gender } = require('../models');



const getGenders = async (req = request, res = response) => {
    const { offset = 0, limit = 10 } = req.query;
    const queryStatus = { status: true };
    try {
        const [totalGenders, genders] = await Promise.all([
            Gender.countDocuments(queryStatus),
            Gender.find(queryStatus)
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .skip(Number(offset))
                .limit(Number(limit))
        ]);


        res.json({
            ok: true,
            totalGenders,
            genders
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}



const getGenderById = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const gender = await Gender.findById(id).populate('user', 'name');

        res.json({
            ok: true,
            gender
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}


const createGender = async (req = request, res = response) => {
    const name = req.body.name.toUpperCase();

    const existsGender = await Gender.findOne({ name });

    if (existsGender) {
        return res.status(400).json({
            ok: false,
            msg: `El genero ${existsGender.name} ya existe.`
        });
    }

    // Generate data
    const data = {
        name,
        user: req.authenticatedUser._id
    }

    try {
        const gender = new Gender(data);
        await gender.save();

        res.status(201).json({
            ok: true,
            gender
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}


const updateGender = async (req = request, res = response) => {
    const { id } = req.params;
    const name = req.body.name.toUpperCase();
    const user = req.authenticatedUser._id;

    const data = {
        name,
        user
    }

    try {

        const gender = await Gender.findByIdAndUpdate(id, data, { new: true });
        res.json({
            ok: true,
            gender
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}


const deleteGender = async (req = request, res = response) => {
    const { id } = req.params;
    const user = req.authenticatedUser._id;

    try {
        const gender = await Gender.findByIdAndUpdate(id, { status: false, user }, { new: true })

        res.json({
            ok: true,
            gender
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
    getGenders,
    getGenderById,
    createGender,
    updateGender,
    deleteGender
}