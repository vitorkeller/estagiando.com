require("dotenv").config();

const express =
  require("express");

const helmet =
  require("helmet");

const cors =
  require("cors");

const rateLimit =
  require("express-rate-limit");

const AuthRoutes =
  require("./routes/AuthRoures");

const internshipRoutes =
  require("./routes/InternshipRoutes");

const UserRoutes =
  require("./routes/UserRoutes");

const ReportRoutes =
  require("./routes/ReportRoutes");


const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

const loginLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,
    max: 5,
    message:
      "Muitas tentativas de login"
  });

app.use(
  "/auth/login",
  loginLimiter
);

app.use(
    "/users",
    UserRoutes
);

app.use(
    "/",
    ReportRoutes
);

app.use(
    "/internships",
    internshipRoutes
);

app.use("/auth", AuthRoutes);

module.exports = app;