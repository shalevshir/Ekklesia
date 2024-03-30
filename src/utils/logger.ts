import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { envVars } from './envVars';

const logtail = new Logtail('UwXx2pbs8fhNhLK3NfGz4pgQ');
const transports = [
  new winston.transports.Console({
    format: winston.format.simple()
  })
];
const logtailTransport = new LogtailTransport(logtail);
if (envVars.NODE_ENV === 'production') {
  transports.push(logtailTransport as any);
}


const logger = winston.createLogger({

  format: winston.format.combine(
    winston.format.splat(),
    winston.format.json(),
  ),
  transports
});
logger.error('This is an error message');
logger.warn('This is a warning message');
logger.info('This is an info message');


export default logger;
