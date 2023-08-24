const BaseRepo = require("../abstracts/repo.abstract");
const Person = require("../models/person.model");
const knessetApiService = require("../services/knesset-api.service");

class PersonRepo extends BaseRepo {
  constructor() {
    super(Person);
  }

  async createPersonFromKnessetApi() {
    const persons = await knessetApiService.getKMs();
    await this.createMany(persons);
  }
}

module.exports = new PersonRepo();
