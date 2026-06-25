const Report = require("../models/Report");
const Internship = require("../models/Internship");
const User = require("../models/User");

class ReportService {

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

		return await Report.create({
			internshipId,
			description,
			attachmentUrl: attachmentUrl || null,
			status: "PENDING"
		});
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

		if (
			!isOwner &&
			!isAdvisor &&
			!isCoordinator
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

		return report;
	}
}

module.exports = new ReportService();
