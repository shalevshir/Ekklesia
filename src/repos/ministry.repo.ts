import BaseRepo from "../abstracts/repo.abstract";
import MinistryModel, { Ministry } from "../models/ministry.model";

class MinistryRepo extends BaseRepo<Ministry> {
    constructor() {
      super(MinistryModel);
    }
}

export default new MinistryRepo();

  