import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { envVars } from './envVars';

const logtail = new Logtail('UwXx2pbs8fhNhLK3NfGz4pgQ');
const transports = [];
if (envVars.NODE_ENV === 'production') {
  const logtailTransport = new LogtailTransport(logtail);
  transports.push(logtailTransport);
} else {
  transports.push(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    )
  }));
}


const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      )
    }),
    new LogtailTransport(logtail)
  ]
});


export default logger;
