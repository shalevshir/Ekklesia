import winston from 'winston';
import { Logtail } from '@logtail/node';

const logtail = new Logtail('UwXx2pbs8fhNhLK3NfGz4pgQ');
const transports = [
  new winston.transports.Console({
    format: winston.format.simple()
  })
];
const logger = winston.createLogger({

  format: winston.format.combine(
    winston.format.splat(),
    winston.format.json(),
  ),
  transports
});
logger.error('This is an error message');
// // logger.warn('This is a warning message');
// logger.info('This is an info message');


export default logger;
