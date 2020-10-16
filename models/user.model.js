const bcrypt = require("bcryptjs");

const Sequelize = require("sequelize");
const db = require("../config/database");
const Post = require("./post.model");

async function hashPassword(user) {
  user.password = await bcrypt.hash(user.dataValues.password, 10);
}

const User = db.define(
  "user",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: "Incorrect email! Try another one" } },
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isAlpha: { msg: "Please type only letters" } },
    },

    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isAlpha: { msg: "Please type only letters" } },
    },

    role: {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ["admin", "user"],
      defaultValue: "user",
      validate: {
        isIn: { args: [["admin", "user"]], msg: "Only Admin or User roles!" },
      },
    },
  },
  {
    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword,
    },

    timestamps: false,
  }
);

//excludes password field in the return values
User.prototype.toJSON = function () {
  var values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

User.findByCredentials = async function (email, password) {
  const userExists = await this.findOne({ where: { email } });

  if (!userExists) {
    return false;
  }

  const passwordsEqual = await bcrypt.compare(password, userExists.password);

  if (!passwordsEqual) {
    return false;
  } else {
    return userExists;
  }
};

User.hasMany(Post, { foreignKey: "userId", onDelete: "cascade" });
Post.belongsTo(User, { targetKey: "id", onDelete: "cascade" });

module.exports = User;
