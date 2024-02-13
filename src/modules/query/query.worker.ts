import queryRepo from "./query.repo";
import knessetApiService from "../../utils/knesset-api.service";
import logger from "../../utils/logger";


class queriesWorker {
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

export default new queriesWorker();