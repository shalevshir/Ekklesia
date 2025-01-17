import _ from 'lodash';
import BaseRepo from '../../abstracts/repo.abstract';
import knessetApiService from '../../utils/knesset-api.service';
import logger from '../../utils/logger';
import committeeRepo from '../committee/committee.repo';
import personRepo from '../person/person.repo';
import AgendaModel, { Agenda } from './agenda.model';


const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
class AgendaRepo extends BaseRepo<Agenda> {
  constructor() {
    super(AgendaModel);
  }

  async fetchAgendasFromKnesset(): Promise<any[]> {
    const agendasList = await knessetApiService.getAgendas();
    if (!agendasList || !agendasList.length) {
      return [];
    }
    const chunks = _.chunk(agendasList, 200);
    const allAgendas: any[] = [];
    let chunkNum = 1;
    for (const chunk of chunks) {
      logger.info(`Fetching agendas chunk #${chunkNum++} out of ${chunks.length}`);
      const agendas = await this.arrangeAgendas(chunk);
      const data = await this.updateMany(agendas,{ upsert: true });
      allAgendas.push(...data);
    }
    const toPromise = allAgendas.map((agenda) => {
      if(!agenda?.initiator) {
        logger.info('No initiator found for agenda', { agendaId: agenda?.originId });
        return Promise.resolve();
      }
      return personRepo.findAndUpdate({ _id: agenda.initiator }, { $addToSet: { agendas: agenda._id } });
    });
    await Promise.all(toPromise);
    return allAgendas.map(this.mapUpsert);
  }

  async arrangeAgendas(agendasList: any[]): Promise<Agenda[]> {
    const agendas = [];
    let agendaNum = 1;
    for(const agenda of agendasList) {
      const agendaId = agenda.AgendaID || agenda.Id;
      logger.info(`Fetching agenda #${agendaNum++} out of ${agendasList.length}`, { agendaId });
      const committeeOriginId = agenda.CommitteeID || agenda.RecommendCommitteeID
      const committee = await committeeRepo.findOne({ originId:  committeeOriginId});
      const initiator = await personRepo.findOne({ originId: agenda.InitiatorPersonID });
      const minister = await personRepo.findOne({ originId: agenda.MinisterPersonID });
      const agendaDocuments = await knessetApiService.getAgendasDocuments(agendaId);
      agendas.push({
        originId: agendaId,
        name: agenda.name,
        classificationDesc: agenda.classificationDesc,
        committee: committee?._id,
        type: agenda.SubTypeDesc,
        status: agenda?.KNS_Status?.Desc,
        initiator: initiator?._id,
        govRecommendation: agenda.GovRecommendationDesc,
        presidentDecisionDate: agenda.PresidentDecisionDate,
        postponementReasonDesc: agenda.PostponementReasonDesc,
        minister: minister?.minister,
        knessetNum: agenda.KnessetNum,
        leadingAgenda: agenda.LeadingAgendaID,
        documents: agendaDocuments.map((document: any) => ({
          url: document.FilePath,
          type: document.GroupTypeDesc,
        }))
      } as Agenda);
      await wait(1000);
    }
    return agendas;
  }
}

export default new AgendaRepo();
