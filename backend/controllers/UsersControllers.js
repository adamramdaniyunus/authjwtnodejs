import Users from "../models/UsersModels.js";
import argon2 from 'argon2';
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    try {
        const response = await Users.findAll({
            attributes: ['id', 'name', 'email']
        })
        res.status(200).json(response);
    } catch (error) {
        res.status(404).json({ msg: "User Tidak Ditemukan" });
    }
}

export const Register = async (req, res) => {
    const { name, email, password, confpassword, } = req.body;
    if (password !== confpassword) return res.status(400).json({ msg: "Password tidak sesuai" });
    const hashPassword = await argon2.hash(password);
    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword,
            confpassword: confpassword
        });
        res.status(201).json({ msg: "Berhasil Register" });
    } catch (error) {
        res.status(400).json({ msg: "Ada kesalahan dalam server" });
    }
}

export const Login = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: {
                email: req.body.email
            }
        });
        const match = await argon2.verify(user.password, req.body.password);
        if (!match) return res.status(400).json({ msg: "Password salah" });
        const userId = user.id;
        const name = user.name;
        const email = user.email;
        const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s'
        });
        const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        await Users.update({ refresh_token: refreshToken }, {
            where: {
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            // secure: 'auto'
        });

        res.json({ accessToken });
    } catch (error) {
        res.status(400).json({ msg: "Email tidak ditemukan" });
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findOne({
        where: {
            refresh_token: refreshToken
        }
    });

    if (!user) return res.sendStatus(204);
    const userId = user.id;
    await Users.update({ refresh_token: null }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}