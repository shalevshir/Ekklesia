import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
  levels: winston.config.syslog.levels
});

logger.error('This is an error message');
logger.warn('This is a warning message');
logger.info('This is an info message');


export default logger;
