const User = require("./User");
const Internship = require("./Internship");
const Report = require("./Report");

User.hasMany(Internship, {
    foreignKey: "userId"
});

Internship.belongsTo(User, {
    foreignKey: "userId"
});

User.belongsTo(User, {
    as: "advisor",
    foreignKey: "advisorId"
});

User.hasMany(User, {
    as: "students",
    foreignKey: "advisorId"
});

// Relatórios periódicos do estágio
Internship.hasMany(Report, {
    foreignKey: "internshipId"
});

Report.belongsTo(Internship, {
    foreignKey: "internshipId"
});

// Quem avaliou o relatório (ADVISOR ou COORDINATOR)
Report.belongsTo(User, {
    as: "evaluator",
    foreignKey: "evaluatorId"
});