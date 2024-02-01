const BaseRepo = require("../abstracts/repo.abstract");
const MinistryModel = require("../models/ministery.model");

class MinistryRepo extends BaseRepo {
    constructor() {
      super(MinistryModel);
    }
}

module.exports = new MinistryRepo();


  