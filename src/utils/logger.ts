import winston from 'winston';

const transports =
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.json(),
    )
  });

const logger = winston.createLogger({
  transports
});


export default logger;
