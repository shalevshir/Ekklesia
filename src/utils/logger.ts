import winston from 'winston';

const logger = winston.createLogger({

  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })

  ]
});

logger.level = 'error';

logger.error('This is an error message');
// logger.warn('This is a warning message');
logger.info('This is an info message');


export default logger;
