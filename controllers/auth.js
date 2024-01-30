const { request, response } = require("express");
const bcryptjs = require("bcryptjs");

const User = require("../models/user");
const { generateJWT } = require("../helpers/generateJWT");
const { googleVerify } = require("../helpers/google-verify");



const login = async (req = request, res = response) => {
    try {
        const { email, password } = req.body;

        // Check if the email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Email no resgistrado.'
            });
        }

        // Check if the user is active
        if (!user.status) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario en estado inactivo'
            });
        }

        // Check if the password matches
        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'UPassword incorrecto.'
            });
        }

        // Generate the JWT
        const token = await generateJWT(user.id);

        res.json({
            ok: true,
            user,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error de servidor.'
        });
    }

}


const revalidateToken = async (req, res = response) => {
    const { _id, name } = req.authenticatedUser;

    const token = generateJWT(_id, name);
    res.json({
        ok: true,
        uid: name,
        token
    });
}


const googleSignIn = async (req = request, res = response) => {
    const { id_token } = req.body;

    try {
        const { name, picture, email } = await googleVerify(id_token);

        let user = await User.findOne({ email });

        if (!user) {
            const data = {
                name,
                email,
                password: ':)',
                img: picture,
                role: 'USER_ROLE',
                google: true
            };

            user = new User(data);
            await user.save();
        }

        if (!user.status) {
            return res.status(401).json({
                ok: false,
                msg: 'Usuario bloqueado, comunicarse con el administrador.'
            });
        }

        // Generate the JWT
        const token = await generateJWT(user.id);

        res.json({
            ok: true,
            user,
            token
        });


    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'El Token no se pudo verificar.'
        });
    }

}

module.exports = {
    login,
    googleSignIn,
    revalidateToken
}