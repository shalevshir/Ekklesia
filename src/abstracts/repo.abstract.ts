import { ReturnModelType } from "@typegoose/typegoose";
import { DocumentType } from "@typegoose/typegoose";
import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";

export type ModelType<T> = ReturnModelType<AnyParamConstructor<T>>

class BaseRepo <T> {
  model: ModelType<T>;
  constructor(model: ModelType<T>) {
    this.model = model;
  }

  async create(data: any) {
    const item = new this.model(data);
    return await item.save();
  }

  async createMany(data: any[]) {
    return await this.model.insertMany(data);
  }

  async findOrCreateMany(data: any[]) {
    const toPromise: Promise<any>[] = [];
    for (const item of data) {
      toPromise.push(this.findOrCreate(item));
    }
    return await Promise.all(toPromise);
  }

  async find(query: any, options: { populate?: any } = {}): Promise<Array<DocumentType<T & { populate?: any }>>> {
    return await this.model.find(query, null, { populate: options.populate });
  }

  async findOne(query: any, options: { populate?: any } = {}): Promise<DocumentType<T>|null> {
    return await this.model.findOne(query, null, { populate: options.populate });
  }

  async update(query: any, data: any) {
    return await this.model.findOneAndUpdate(query, data, { new: true });
  }

  async updateMany(data: any[], options: { upsert?: boolean } = {}) {
    const toPromise: Promise<any>[] = [];
    for (const item of data) {
      toPromise.push(
        this.model.findOneAndUpdate({ originId: item.originId }, item, {
          new: true,
          upsert: options.upsert,
        }).exec()
      );
    }
    return await Promise.all(toPromise);
  }

  async delete(query: any) {
    return await this.model.findOneAndDelete(query);
  }

  async findOrCreate(criteria: any) {
    const result = await this.model.findOne(criteria);
    if (result) {
      return { doc: result, created: false };
    } else {
      const newDoc = await this.model.create(criteria);
      return { doc: newDoc, created: true };
    }
  }

  async findAndUpdate(criteria: any, data: any) {
    const result = await this.model.findOneAndUpdate(criteria, data, {
      new: true,
    });
    return result;
  }
}

export default BaseRepo;