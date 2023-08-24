const { Model } = require("mongoose");

class BaseRepo {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const item = new this.model(data);
    return await item.save();
  }

  async createMany(data) {
    return await this.model.insertMany(data);
  }

  async get(query) {
    return await this.model.find(query);
  }

  async update(query, data) {
    return await this.model.findOneAndUpdate(query, data, { new: true });
  }

  async delete(query) {
    return await this.model.findOneAndDelete(query);
  }

  async findOrCreate(criteria) {
    const result = await this.model.findOne(criteria);
    if (result) {
      return { doc: result, created: false };
    } else {
      const newDoc = await this.model.create(criteria);
      return { doc: newDoc, created: true };
    }
  }
}

module.exports = BaseRepo;
