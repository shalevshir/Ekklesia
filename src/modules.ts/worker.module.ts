import queryRepo from "../repos/query.repo";
import knessetApiService from "../services/knesset-api.service";
import logger from "../services/logging.service";


class WorkerModule {
    async fetchQueries(){
        try {
            logger.info("Fetching queries from knesset started");
            await queryRepo.fetchQueriesFromKnesset();
            logger.info("Fetching queries from knesset finished");
        } catch (error) {
            logger.error("Error in fetchQueries", error);
            throw error;
        }
    }
}

export default new WorkerModule();