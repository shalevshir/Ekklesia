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

  async findOrCreateMany(data) {
    const toPromise = [];
    for (const item of data) {
      toPromise.push(this.findOrCreate(item));
    }
    return await Promise.all(toPromise);
  }

  async find(query, options = {}) {
    return await this.model.find(query,null, { populate: options.populate });
  }

  async findOne(query) {
    return await this.model.findOne(query);
  }

  async update(query, data) {
    return await this.model.findOneAndUpdate(query, data, { new: true });
  }

  async updateMany(data) {
    const toPromise = [];
    for (const item of data) {
      toPromise.push(
        this.model.findOneAndUpdate({ originId: item.originId }, item, {
          new: true,
        })
      );
    }
    return await Promise.all(toPromise);
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

  async findAndUpdate(criteria, data) {
    const result = await this.model.findOneAndUpdate(criteria, data, {
      new: true,
    });
    return result;
  }
}

module.exports = BaseRepo;
