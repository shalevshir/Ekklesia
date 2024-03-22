import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { FilterQuery, PipelineStage } from 'mongoose';

class BaseRepo <T> {
  model: ReturnModelType<AnyParamConstructor<T>>;
  constructor(model: ReturnModelType<AnyParamConstructor<T>>) {
    this.model = model;
  }

  async create(data: FilterQuery<T>) {
    const item = new this.model(data);
    return await item.save();
  }

  async createMany(data: FilterQuery<T>[]) {
    return await this.model.insertMany(data);
  }

  async find(query: FilterQuery<T>, options: { populate?: any } = {}): Promise<Array<DocumentType<T & { populate?: any }>>> {
    return await this.model.find(query, null, { populate: options.populate });
  }

  async findOne(query: FilterQuery<T>, options: { populate?: any } = {}): Promise<DocumentType<T>|null> {
    return await this.model.findOne(query, null, { populate: options.populate });
  }

  async update(query: FilterQuery<T>, data: any) {
    return await this.model.findOneAndUpdate(query, data, { new: true });
  }

  async updateMany(data: FilterQuery<T>[], options: { upsert?: boolean } = {}) {
    const toPromise: Promise<any>[] = [];
    for (const item of data) {
      toPromise.push(
        this.model.findOneAndUpdate({ originId: item.originId }, item, {
          new: true,
          upsert: options.upsert
        }).exec()
      );
    }
    return await Promise.all(toPromise);
  }

  async delete(query: FilterQuery<T>) {
    return await this.model.findOneAndDelete(query);
  }

  async findOrCreate(criteria: FilterQuery<T>, data: FilterQuery<T>) {
    const result = await this.model.findOne(criteria);
    if (result) {
      return { doc: result, created: false };
    } else {
      const newDoc = await this.model.create(data);
      return { doc: newDoc, created: true };
    }
  }

  async findAndUpdate(criteria: FilterQuery<T>, data: FilterQuery<T>) {
    const result = await this.model.findOneAndUpdate(criteria, data, {
      new: true
    });
    return result;
  }

  async aggregate(pipeline: PipelineStage[]) {
    return await this.model.aggregate(pipeline);
  }
}

export default BaseRepo;
