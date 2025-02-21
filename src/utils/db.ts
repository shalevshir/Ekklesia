import { Connection } from 'mongoose';
import { mongoose } from '@typegoose/typegoose';
import { envVars } from './envVars';

const dbName = envVars.DB_NAME;
const dbPass = envVars.DB_PASSWORD;
const connectionUri = envVars.NODE_ENV === 'production' ?
   `mongodb+srv://${ dbName }:${ dbPass }@ekklesia.xyo4j4r.mongodb.net/EkklesiaDB?retryWrites=true&w=majority` :
  'mongodb://localhost:27018/testNew';
export let connection: Connection;
const connectDB = async () => {
  try {
    const connectionObj = await mongoose.connect(
      connectionUri, { connectTimeoutMS: 5000, socketTimeoutMS: 3000, waitQueueTimeoutMS: 120000 }
    );
    console.log('MongoDB Connected...');
    connection = connectionObj.connections[0];
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export { connectDB };
