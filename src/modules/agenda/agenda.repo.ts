import BaseRepo from '../../abstracts/repo.abstract';
import knessetApiService from '../../utils/knesset-api.service';
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
    const agendas = await this.arrangeAgendas(agendasList);
    const data = await this.updateMany(agendas, { upsert: true });
    return data.map(this.mapUpsert);
  }

  async arrangeAgendas(agendasList: any[]): Promise<Agenda[]> {
    const agendas = [];
    for(const agenda of agendasList) {
      const committee = await committeeRepo.findOne({ originId: agenda.CommitteeID });
      const initiator = await personRepo.findOne({ originId: agenda.InitiatorPersonID });
      const minister = await personRepo.findOne({ originId: agenda.MinisterPersonID });
      const agendaDocuments = await knessetApiService.getAgendasDocuments(agenda.AgendaID);
      agendas.push({
        originId: agenda.AgendaID?? agenda.Id,
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
