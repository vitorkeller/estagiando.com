const Internship =
    require("../models/Internship");

const User =
    require("../models/User");

const AuditLogService =
    require("./AuditLogService");

class InternshipService {

    async create(data, user) {

        const internship = await Internship.create({

            ...data,

            userId: user.id,

            status:
                "UNDER_REVIEW"

        });

        await AuditLogService.log({
            entity: "Internship",
            entityId: internship.id,
            action: "CREATE",
            user
        });

        return internship;
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

    async findReadyForFinalDecision() {

        return await Internship.findAll({

            where: {
                status: "ACTIVE"
            },

            include: User
        });
    }

    async approve(id, user) {

        const internship =
            await Internship.findByPk(id);

        internship.status =
            "APPROVED";

        await internship.save();

        await AuditLogService.log({
            entity: "Internship",
            entityId: internship.id,
            action: "APPROVE",
            user
        });

        return internship;
    }

    async reject(id, user) {

        const internship =
            await Internship.findByPk(id);

        internship.status =
            "REJECTED";

        await internship.save();

        await AuditLogService.log({
            entity: "Internship",
            entityId: internship.id,
            action: "REJECT",
            user
        });

        return internship;
    }

    async finalize(id, { comment }, user) {

        const internship =
            await Internship.findByPk(id);

        if (!internship) {
            throw new Error(
                "Estágio não encontrado"
            );
        }

        if (internship.status !== "ACTIVE") {

            throw new Error(
                "Apenas estágios ativos podem ser encerrados"
            );
        }

        internship.status = "CLOSED";
        internship.coordinatorComment = comment || null;
        internship.coordinatorId = user.id;
        internship.finalDecisionAt = new Date();

        await internship.save();

        await AuditLogService.log({
            entity: "Internship",
            entityId: internship.id,
            action: "FINALIZE",
            user,
            details: { comment: comment || null }
        });

        return internship;
    }

    async deny(id, { comment }, user) {

        const internship =
            await Internship.findByPk(id);

        if (!internship) {
            throw new Error(
                "Estágio não encontrado"
            );
        }

        if (internship.status !== "ACTIVE") {

            throw new Error(
                "Apenas estágios ativos podem ser indeferidos"
            );
        }

        internship.status = "DENIED";
        internship.coordinatorComment = comment || null;
        internship.coordinatorId = user.id;
        internship.finalDecisionAt = new Date();

        await internship.save();

        await AuditLogService.log({
            entity: "Internship",
            entityId: internship.id,
            action: "DENY",
            user,
            details: { comment: comment || null }
        });

        return internship;
    }
}

module.exports =
    new InternshipService();