const User = require("./User");
const Internship = require("./Internship");

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