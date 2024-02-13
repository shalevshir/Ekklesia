import { Response } from "express";
import logger from "./logger";


 const handleError = (title:string, error: any, res:Response)=>{
    logger.error(error);
    res.status(500).send({title, message: error.message});
}

export {handleError}

