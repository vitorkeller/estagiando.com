const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

class AuthService {

    async register({ name, email, password}) {

        const exists = await User.findOne({
            where: { email }
        });

        if (exists) {
            throw new Error("Email já cadastrado");
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hash,
            role: "STUDENT"
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
    }

    async login({ email, password }) {

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            throw new Error("Credenciais inválidas");
        }

        const valid = await bcrypt.compare(
            password,
            user.password
        );

        if (!valid) {
            throw new Error("Credenciais inválidas");
        }

        if (!user.isActive) {
            throw new Error("Usuário inativo");
        }

        const accessToken = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        const refreshToken = jwt.sign(
            {
                id: user.id
            },
            process.env.REFRESH_SECRET,
            {
                expiresIn: process.env.REFRESH_EXPIRES_IN
            }
        );

        await RefreshToken.create({
            token: refreshToken,
            UserId: user.id
        });

        return {
            accessToken,
            refreshToken
        };
    }

    async refresh(refreshToken) {

        if (!refreshToken) {
            throw new Error("Refresh token obrigatório");
        }

        const exists = await RefreshToken.findOne({
            where: {
                token: refreshToken
            }
        });

        if (!exists) {
            throw new Error("Refresh token inválido");
        }

        try {

            const payload = jwt.verify(
                refreshToken,
                process.env.REFRESH_SECRET
            );

            const user = await User.findByPk(
                payload.id
            );

            const accessToken = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn:
                        process.env.JWT_EXPIRES_IN
                }
            );

            return {
                accessToken
            };

        } catch {

            throw new Error(
                "Refresh token expirado"
            );
        }
    }

    async logout(refreshToken) {

        await RefreshToken.destroy({
            where: {
                token: refreshToken
            }
        });

        return {
            message: "Logout realizado"
        };
    }
}

module.exports = new AuthService();
