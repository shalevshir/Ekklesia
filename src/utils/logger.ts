import winston from 'winston';

const logger = winston.createLogger({

  // level: 'error',
  // format: winston.format.json(),
  // transports: [
  //   new winston.transports.Console({
  //     format: winston.format.simple()
  //   }),
  //   new winston.transports.File({ filename: 'error.log', level: 'error' }),
  //   new winston.transports.File({ filename: 'combined.log' })

  // ]
});
winston.error('This is an error message');
// class Logger {
//   logger: winston.Logger;
//   constructor() {
//     this.logger = winston.createLogger({
//       format: winston.format.json(),
//       transports: [
//         new winston.transports.Console({
//           format: winston.format.simple()
//         }),
//         new winston.transports.File({ filename: 'error.log', level: 'error' }),
//         new winston.transports.File({ filename: 'combined.log' })

//       ]
//     });
//   }
//   public error(message: string) {
//     logger.error(message);
//   }

//   public warn(message: string) {
//     logger.warn(message);
//   }

//   public info(message: string) {

// logger.level = 'error';

// logger.error('This is an error message');
// // logger.warn('This is a warning message');
// logger.info('This is an info message');


export default logger;
