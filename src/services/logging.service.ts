import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

console.log('logger created');
// Example usage
logger.info('This is an informational message');
logger.error('This is an error message');

export default logger;