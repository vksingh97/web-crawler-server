const mongoose = require('mongoose');

const blacklistJwtSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
  },
  { timestamps: true }
);

blacklistJwtSchema.index({ token: 1 }, { unique: true });

const blacklistJwtModel = mongoose.model(
  'blacklistjwt',
  blacklistJwtSchema,
  'blacklistjwt'
);

module.exports = {
  blacklistJwtModel,
  create: async ({ insertDict }) => new blacklistJwtModel(insertDict).save(),
  findOne: async ({ query, projection }) =>
    blacklistJwtModel.findOne(query, projection).lean(),
  find: async ({ query, projection }) =>
    blacklistJwtModel.find(query, projection).lean(),
  updateOne: ({ query, updateDict }) =>
    blacklistJwtModel.updateOne(query, updateDict),
  update: async ({ query, updateDict }) =>
    blacklistJwtModel.updateMany(query, updateDict),
};
