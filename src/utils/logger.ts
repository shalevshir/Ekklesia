import winston from 'winston';
import { Logtail } from '@logtail/node';

const logtail = new Logtail('UwXx2pbs8fhNhLK3NfGz4pgQ');
const transports = [];
// if (envVars.NODE_ENV === 'production') {
//   const logtailTransport = new LogtailTransport(logtail, {
//   });
//   transports.push(logtailTransport as any);
// } else {
transports.push(new winston.transports.Console());
// }


const logger = winston.createLogger({

  format: winston.format.combine(
    winston.format.splat(),
    winston.format.json(),
  ),
  transports
});


export default logger;
