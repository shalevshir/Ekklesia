import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  level: 'error',
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'error'
    })
  ]
});

logger.error('This is an error message');
// logger.warn('This is a warning message');
logger.info('This is an info message');


export default logger;
