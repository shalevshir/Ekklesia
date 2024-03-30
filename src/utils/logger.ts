import winston from 'winston';

const transports =
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.simple(),
    )
  });

const logger = winston.createLogger({
  transports
});


export default logger;
