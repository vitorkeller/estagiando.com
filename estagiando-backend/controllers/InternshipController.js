const InternshipService =
    require("../services/InternshipService");

class InternshipController {

    async create(req, res) {

        try {

            const result =
                await InternshipService.create(
                    req.body,
                    req.user.id
                );

            return res
                .status(201)
                .json(result);

        } catch (err) {

            return res
                .status(400)
                .json({
                    message:
                        err.message
                });
        }
    }
    async findAll(req, res) {

        try {

            const result =
                await InternshipService.findAll(
                    req.user
                );

            return res.json(
                result
            );

        } catch (err) {

            return res
                .status(500)
                .json({
                    message:
                        err.message
                });
        }
    }

    async findById(req, res) {

        try {

            const result =
                await InternshipService.findById(
                    req.params.id,
                    req.user
                );

            return res.json(
                result
            );

        } catch (err) {

            return res
                .status(403)
                .json({
                    message:
                        err.message
                });
        }
    }

    async findPending(req, res) {

        try {

            const result =
                await InternshipService.findPending();

            return res.json(result);

        } catch (err) {

            return res.status(500).json({
                message: err.message
            });

        }
    }

    async approve(req, res) {

        try {

            const result =
                await InternshipService.approve(
                    req.params.id
                );

            return res.json(result);

        } catch (err) {

            return res.status(400).json({
                message: err.message
            });

        }
    }

    async reject(req, res) {

        try {

            const result =
                await InternshipService.reject(
                    req.params.id
                );

            return res.json(result);

        } catch (err) {

            return res.status(400).json({
                message: err.message
            });

        }
    }

    async delete(req, res) {

        try {

            const result =
                await InternshipService.delete(
                    req.params.id
                );

            return res.json(result);

        } catch (err) {

            return res.status(400).json({
                message: err.message
            });

        }
    }
}

module.exports =
    new InternshipController();