const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    password: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

const userModel = mongoose.model('user', userSchema, 'user');

module.exports = {
  userModel,
  create: async ({ insertDict }) => new userModel(insertDict).save(),
  findOne: async ({ query, projection }) =>
    userModel.findOne(query, projection).lean(),
  find: async ({ query, projection }) =>
    userModel.find(query, projection).lean(),
  updateOne: ({ query, updateDict }) => userModel.updateOne(query, updateDict),
  update: async ({ query, updateDict }) =>
    userModel.updateMany(query, updateDict),
};
