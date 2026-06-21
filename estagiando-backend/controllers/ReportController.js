const ReportService =
    require("../services/ReportService");

class ReportController {

    async create(req, res) {

        try {

            const result =
                await ReportService.create(
                    req.body,
                    req.user
                );

            return res
                .status(201)
                .json(result);

        } catch (err) {

            return res
                .status(400)
                .json({
                    message: err.message
                });
        }
    }

    async findByInternship(req, res) {

        try {

            const result =
                await ReportService.findByInternship(
                    req.params.internshipId,
                    req.user
                );

            return res.json(result);

        } catch (err) {

            return res
                .status(403)
                .json({
                    message: err.message
                });
        }
    }

    async findPending(req, res) {

        try {

            const result =
                await ReportService.findPending(
                    req.user
                );

            return res.json(result);

        } catch (err) {

            return res
                .status(403)
                .json({
                    message: err.message
                });
        }
    }

    async evaluate(req, res) {

        try {

            const result =
                await ReportService.evaluate(
                    req.params.id,
                    req.body,
                    req.user
                );

            return res.json(result);

        } catch (err) {

            return res
                .status(400)
                .json({
                    message: err.message
                });
        }
    }
}

module.exports =
    new ReportController();