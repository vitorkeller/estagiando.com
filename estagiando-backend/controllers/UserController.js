const UserService =
    require("../services/UserService");

class UserController {

    async create(req, res) {

        try {

            const result =
                await UserService.create(
                    req.body
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

    async findAll(req, res) {

        try {

            const result =
                await UserService.findAll();

            return res.json(result);

        } catch (err) {

            return res
                .status(500)
                .json({
                    message: err.message
                });
        }
    }

    async findById(req, res) {

        try {

            const result =
                await UserService.findById(
                    req.params.id
                );

            return res.json(result);

        } catch (err) {

            return res
                .status(404)
                .json({
                    message: err.message
                });
        }
    }

    async update(req, res) {

        try {

            const result =
                await UserService.update(
                    req.params.id,
                    req.body
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

    async activate(req, res) {

        try {

            const result =
                await UserService.setActive(
                    req.params.id,
                    true
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

    async deactivate(req, res) {

        try {

            const result =
                await UserService.setActive(
                    req.params.id,
                    false
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
    new UserController();