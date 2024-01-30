const { request, response } = require('express');
const bcryptjs = require('bcryptjs');

const User = require('../models/user');

const getUsers = async (req = request, res = response) => {
    // const { query, name, apikey, page = 1, limit = 10 } = req.query;

    const { offset = 0, limit = 10 } = req.query;
    const queryStatus = { status: true };

    try {
        const [totalUsers, users] = await Promise.all([
            User.countDocuments(queryStatus),
            User.find(queryStatus)
                .skip(Number(offset))
                .limit(Number(limit))
                .sort({ createdAt: -1 })
        ]);

        res.json({
            ok: true,
            totalUsers,
            users
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}

const getUserById = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);


        res.json({
            ok: true,
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}

const postUsers = async (req, res = response) => {

    const { name, lastname, phone, email, password, role } = req.body;

    const data = {
        name,
        lastname,
        email,
        password
    }

    if (phone) {
        data.phone = phone;
    }

    if (role) {
        data.role = role;
    }

    try {
        const user = new User(data);

        // Encrypt password
        const salt = bcryptjs.genSaltSync();
        user.password = bcryptjs.hashSync(password, salt);

        // Save to DB
        await user.save();

        res.json({
            ok: true,
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}

const putUsers = async (req, res = response) => {

    const { id } = req.params;
    const { _id, password, google, email, ...data } = req.body;

    if (password) {
        // Encrypt password
        const salt = bcryptjs.genSaltSync();
        data.password = bcryptjs.hashSync(password, salt);
    }
    try {
        const user = await User.findByIdAndUpdate(id, data, { new: true });

        res.json({
            ok: true,
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        });
    }
}

const patchUsers = (req, res = response) => {
    res.json({
        ok: true,
        msg: 'Patch API - Controller'
    });
}

const deleteUsers = async (req, res = response) => {

    const { id } = req.params;

    try {
        const user = await User.findByIdAndUpdate(id, { status: false }, { new: true });

        res.json({
            ok: true,
            user
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
    getUsers,
    getUserById,
    postUsers,
    putUsers,
    patchUsers,
    deleteUsers
}