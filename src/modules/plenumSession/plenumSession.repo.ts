import BaseRepo from '../../abstracts/repo.abstract';
import knessetApiService from '../../utils/knesset-api.service';
import _ from 'lodash';
import { PlenumSession, PlenumSessionModel } from './plenumSession.model';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
class PlenumSessionsRepo extends BaseRepo<PlenumSession> {
  constructor() {
    super(PlenumSessionModel);
  }

}


export default new PlenumSessionsRepo();
