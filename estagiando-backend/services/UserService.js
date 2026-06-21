const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/User");

const VALID_ROLES = [
    "STUDENT",
    "ADVISOR",
    "COORDINATOR",
    "ADMIN"
];

class UserService {

    generateTempPassword() {

        return crypto
            .randomBytes(6)
            .toString("hex");
    }

    async create({ name, email, role, advisorId }) {

        const exists = await User.findOne({
            where: { email }
        });

        if (exists) {
            throw new Error(
                "Email já cadastrado"
            );
        }

        if (
            role &&
            !VALID_ROLES.includes(role)
        ) {
            throw new Error(
                "Role inválida"
            );
        }

        if (role === "STUDENT" && advisorId) {

            const advisor =
                await User.findByPk(advisorId);

            if (
                !advisor ||
                advisor.role !== "ADVISOR"
            ) {
                throw new Error(
                    "Orientador inválido"
                );
            }
        }

        const tempPassword =
            this.generateTempPassword();

        const hash = await bcrypt.hash(
            tempPassword,
            10
        );

        const user = await User.create({
            name,
            email,
            password: hash,
            role: role || "STUDENT",
            advisorId:
                role === "STUDENT"
                    ? advisorId || null
                    : null
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            advisorId: user.advisorId,
            tempPassword
        };
    }

    async findAll() {

        return await User.findAll({
            attributes: {
                exclude: ["password"]
            },
            include: {
                model: User,
                as: "advisor",
                attributes: ["id", "name", "email"]
            }
        });
    }

    async findById(id) {

        const user = await User.findByPk(id, {
            attributes: {
                exclude: ["password"]
            },
            include: {
                model: User,
                as: "advisor",
                attributes: ["id", "name", "email"]
            }
        });

        if (!user) {
            throw new Error(
                "Usuário não encontrado"
            );
        }

        return user;
    }

    async update(id, { name, email, role, advisorId }) {

        const user = await User.findByPk(id);

        if (!user) {
            throw new Error(
                "Usuário não encontrado"
            );
        }

        if (
            role &&
            !VALID_ROLES.includes(role)
        ) {
            throw new Error(
                "Role inválida"
            );
        }

        if (email && email !== user.email) {

            const exists = await User.findOne({
                where: { email }
            });

            if (exists) {
                throw new Error(
                    "Email já cadastrado"
                );
            }
        }

        const nextRole = role || user.role;

        if (nextRole === "STUDENT" && advisorId) {

            const advisor =
                await User.findByPk(advisorId);

            if (
                !advisor ||
                advisor.role !== "ADVISOR"
            ) {
                throw new Error(
                    "Orientador inválido"
                );
            }
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.role = nextRole;
        user.advisorId =
            nextRole === "STUDENT"
                ? advisorId ?? user.advisorId
                : null;

        await user.save();

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            advisorId: user.advisorId
        };
    }

    async setActive(id, isActive) {

        const user = await User.findByPk(id);

        if (!user) {
            throw new Error(
                "Usuário não encontrado"
            );
        }

        user.isActive = isActive;

        await user.save();

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        };
    }
}

module.exports = new UserService();