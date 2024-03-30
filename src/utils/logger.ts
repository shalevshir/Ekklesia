import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { envVars } from './envVars';

const logtail = new Logtail('UwXx2pbs8fhNhLK3NfGz4pgQ');
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    )
  })
] as winston.transport[];
console.log(envVars.NODE_ENV);
if (envVars.NODE_ENV === 'production') {
  const logtailTransport = new LogtailTransport(logtail);
  transports.push(logtailTransport);
}

const logger = winston.createLogger({
  transports
});


export default logger;
