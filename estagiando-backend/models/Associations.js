const User = require("./User");
const Internship = require("./Internship");

User.hasMany(Internship, {
    foreignKey: "userId"
});

Internship.belongsTo(User, {
    foreignKey: "userId"
});