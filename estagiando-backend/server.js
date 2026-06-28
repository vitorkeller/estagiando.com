require("dotenv").config();

require("./models/User");
require("./models/Internship");
require("./models/Associations");
require("./models/Report");
require("./models/AuditLog");
const app =
  require("./app");

const sequelize =
  require("./config/database");

require("./models/User");
require("./models/RefreshToken");

sequelize
  .sync({ alter: true })
  .then(() => {

    console.log(
      "Banco conectado"
    );

    app.listen(
      process.env.PORT,
      () => {

        console.log(
          `Servidor rodando na porta ${process.env.PORT}`
        );

      }
    );

  })
  .catch(console.error);