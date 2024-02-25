import logger from "../../utils/logger";
import committeeRepo from "../committee/committee.repo";
import billRepo from "./bill.repo";


class billWorker {
    async updateBillsMainCategory(job:any){
        try {
            logger.info({message:"Update bills main category process started", jobId: job.id});
            const bills = await billRepo.find({});
            for(const bill of bills){
                if(!bill.committee){
                    continue;
                }
                const category = committeeRepo.categoryByCommitteeId(bill.committee.toString());
                if(!category){
                    continue;
                }
                await billRepo.update({_id: bill._id}, {categories: [category]});
            }
            // await billRepo.updatebillsMainCategory();
            logger.info("Update bills main category process finished");
            return true;
        } catch (error) {
            logger.error("Error in updatebillsMainCategory", error);
            throw error;
        }
    }

    async updateBillStages(job:any){
        logger.info({message:"Update bill stages process started", jobId: job.id});
        await billRepo.updateBillStages();
        logger.info("Update bill stages process finished");
        return true;
    }
}

export default new billWorker();