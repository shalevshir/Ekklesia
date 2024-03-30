import { Logtail } from '@logtail/node';
import winston, { transport } from 'winston';
import { envVars } from './envVars';
import { LogtailTransport } from '@logtail/winston';

const transports: transport[] = [];
const consoleTransport =
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    )
  });
transports.push(consoleTransport);
const logtail = new Logtail('UwXx2pbs8fhNhLK3NfGz4pgQ');
const logtailTransport = new LogtailTransport(logtail);
if (envVars.NODE_ENV === 'production') {
  transports.push(logtailTransport);
}
const logger = winston.createLogger({
  transports
});


export default logger;
