const Internship =
    require("../models/Internship");

const User =
    require("../models/User");

class InternshipService {

    async create(data, userId) {

        return await Internship.create({

            ...data,

            userId,

            status:
                "UNDER_REVIEW"

        });
    }

    async findAll(user) {

        if (
            user.role === "COORDINATOR"
        ) {
            return await Internship.findAll({
                include: User
            });
        }

        return await Internship.findAll({
            where: {
                userId: user.id
            },
            include: User
        });
    }

    async findById(id, user) {

        const internship =
            await Internship.findByPk(
                id,
                {
                    include: User
                }
            );

        if (!internship) {
            throw new Error(
                "Estágio não encontrado"
            );
        }

        if (
            user.role !== "COORDINATOR" &&
            internship.userId !== user.id
        ) {
            throw new Error(
                "Acesso negado"
            );
        }

        return internship;
    }

    async findPending() {

        return await Internship.findAll({

            where: {
                status:
                    "UNDER_REVIEW"
            },

            include: User
        });
    }

    async approve(id) {

        const internship =
            await Internship.findByPk(id);

        internship.status =
            "APPROVED";

        await internship.save();

        return internship;
    }

    async reject(id) {

        const internship =
            await Internship.findByPk(id);

        internship.status =
            "REJECTED";

        await internship.save();

        return internship;
    }
}

module.exports =
    new InternshipService();