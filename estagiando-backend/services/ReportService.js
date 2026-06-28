const Report = require("../models/Report");
const Internship = require("../models/Internship");
const User = require("../models/User");
const AuditLogService = require("./AuditLogService");

// Serviços de nuvem onde o link não revela a extensão real do arquivo.
// Para esses, confiamos que o aluno selecionou o arquivo certo —
// não há como confirmar o formato sem abrir o link.
const TRUSTED_CLOUD_DOMAINS = [
    "drive.google.com",
    "docs.google.com",
    "1drv.ms",
    "onedrive.live.com",
    "dropbox.com",
    "www.dropbox.com"
];

class ReportService {

    isValidUrl(value) {

        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    validateAttachmentUrl(attachmentUrl) {

        if (!this.isValidUrl(attachmentUrl)) {
            throw new Error(
                "URL do anexo inválida"
            );
        }

        const { hostname } = new URL(attachmentUrl);

        const isTrustedCloud =
            TRUSTED_CLOUD_DOMAINS.some(
                (domain) =>
                    hostname === domain ||
                    hostname.endsWith(`.${domain}`)
            );

        if (isTrustedCloud) {
            // Link de Drive/OneDrive/Dropbox: confiamos no aluno
            // quanto ao formato, já que o link não expõe a extensão.
            return;
        }

        if (
            !attachmentUrl
                .toLowerCase()
                .endsWith(".pdf")
        ) {
            throw new Error(
                "Apenas arquivos no formato PDF são aceitos, ou um link do Google Drive / OneDrive / Dropbox"
            );
        }
    }

    async create({ internshipId, description, attachmentUrl }, user) {

        const internship = await Internship.findByPk(
            internshipId
        );

        if (!internship) {
            throw new Error(
                "Estágio não encontrado"
            );
        }

        if (internship.userId !== user.id) {
            throw new Error(
                "Acesso negado"
            );
        }

        if (attachmentUrl) {
            this.validateAttachmentUrl(attachmentUrl);
        }

        const report = await Report.create({
            internshipId,
            description,
            attachmentUrl: attachmentUrl || null,
            status: "PENDING"
        });

        await AuditLogService.log({
            entity: "Report",
            entityId: report.id,
            action: "CREATE",
            user
        });

        return report;
    }

    async findByInternship(internshipId, user) {

        const internship = await Internship.findByPk(
            internshipId,
            {
                include: User
            }
        );

        if (!internship) {
            throw new Error(
                "Estágio não encontrado"
            );
        }

        const isOwner =
            internship.userId === user.id;

        const isAdvisor =
            user.role === "ADVISOR" &&
            internship.User.advisorId === user.id;

        const isCoordinator =
            user.role === "COORDINATOR";

        const isAdmin =
            user.role === "ADMIN";

        if (
            !isOwner &&
            !isAdvisor &&
            !isCoordinator &&
            !isAdmin
        ) {
            throw new Error(
                "Acesso negado"
            );
        }

        return await Report.findAll({
            where: { internshipId },
            include: {
                model: User,
                as: "evaluator",
                attributes: ["id", "name", "email"]
            }
        });
    }

    async findPending(user) {

        if (
            user.role !== "ADVISOR" &&
            user.role !== "COORDINATOR"
        ) {
            throw new Error(
                "Acesso negado"
            );
        }

        const include = {
            model: Internship,
            include: {
                model: User,
                attributes: ["id", "name", "email", "advisorId"]
            }
        };

        const reports = await Report.findAll({
            where: { status: "PENDING" },
            include
        });

        if (user.role === "COORDINATOR") {
            return reports;
        }

        return reports.filter(
            (report) =>
                report.Internship.User.advisorId === user.id
        );
    }

    async evaluate(id, { approve, comment }, user) {

        const report = await Report.findByPk(id, {
            include: {
                model: Internship,
                include: User
            }
        });

        if (!report) {
            throw new Error(
                "Relatório não encontrado"
            );
        }

        const studentAdvisorId =
            report.Internship.User.advisorId;

        const isAdvisorInCharge =
            user.role === "ADVISOR" &&
            studentAdvisorId === user.id;

        const isCoordinator =
            user.role === "COORDINATOR";

        if (!isAdvisorInCharge && !isCoordinator) {
            throw new Error(
                "Acesso negado"
            );
        }

        if (report.status !== "PENDING") {
            throw new Error(
                "Relatório já avaliado"
            );
        }

        report.status = approve
            ? "APPROVED"
            : "REJECTED";

        report.evaluatorComment = comment || null;
        report.evaluatorId = user.id;
        report.evaluatedAt = new Date();

        await report.save();

        await AuditLogService.log({
            entity: "Report",
            entityId: report.id,
            action: approve ? "APPROVE" : "REJECT",
            user,
            details: { comment: comment || null }
        });

        return report;
    }
}

module.exports = new ReportService();