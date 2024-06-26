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
const logtail = new Logtail(envVars.LOGTAIL_KEY as string);
const logtailTransport = new LogtailTransport(logtail);
if (envVars.NODE_ENV === 'production') {
  transports.push(logtailTransport);
} else {
  transports.push(consoleTransport);
}
const logger = winston.createLogger({
  transports
});


export default logger;
