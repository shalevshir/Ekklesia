import queryRepo from "./query.repo";
import knessetApiService from "../../utils/knesset-api.service";
import logger from "../../utils/logger";


class queriesWorker {
    async fetchQueries(job:any){
        try {
            logger.info({message:"Fetch queries process started", jobId: job.id});
            await queryRepo.fetchQueriesFromKnesset();
            logger.info("Fetching queries process finished");
            return true;
        } catch (error) {
            logger.error("Error in fetchQueries", error);
            throw error;
        }
    }
}

export default new queriesWorker();