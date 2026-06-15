const AuthService =
    require("../services/AuthService");

class AuthController {

    async register(req, res) {

        try {

            const result =
                await AuthService.register(
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

    async login(req, res) {

        try {

            const result =
                await AuthService.login(
                    req.body
                );

            return res.json(result);

        } catch (err) {

            return res
                .status(401)
                .json({
                    message: err.message
                });

        }
    }

    async refresh(req, res) {

        try {

            const result =
                await AuthService.refresh(
                    req.body.refreshToken
                );

            return res.json(result);

        } catch (err) {

            return res
                .status(401)
                .json({
                    message: err.message
                });

        }
    }

    async logout(req, res) {

        try {

            const result =
                await AuthService.logout(
                    req.body.refreshToken
                );

            return res.json(result);

        } catch (err) {

            return res
                .status(500)
                .json({
                    message: err.message
                });

        }
    }
}

module.exports =
    new AuthController();