import cors from 'cors';
import { connectDB } from './utils/db';

import logger from './utils/logger';
import express from 'express';
import { getFileAsHtml } from './utils/files.service';
import { handleError } from './utils/errors.utils';
import { envVars } from './utils/envVars';

connectDB();

const app = express();
const port = envVars.PORT || 3000;
app.use(cors({
  origin: 'http://www.ekklesia.co.il',
  methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS' ]
}));
app.use(express.json());

app.use(express.static('public'));
app.get('/health', (req, res) => {
  res.send('ok');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// app.use('/query', queryRouter);
// app.use('/category', categoriesRouter);

// app.get("/fetchMks", routers.fetchMks);
// app.get("/fetchCommittees", routers.fetchCommittees);
// app.get("/updateCommitteesMembers", routers.updateCommitteesMembers);
// app.get("/fetchCommitteesSessions", routers.fetchCommitteesSessions);
// app.get("/updateSessionsInCommittees", routers.updateSessionsInCommittees);
// app.get("/fetchQueries", routers.fetchQueries);
// app.get("/fetchBills", routers.fetchBills);
// app.get("/updateBills", routers.updateBills);


app.get('/fileContent', async (req, res) => {
  try {
    const url = req.query.url as string;

    const content = await getFileAsHtml(url);

    res.send(content);
  } catch (error) {
    handleError( 'error in download file', error, res);
  }
});

app.listen(port, () => {
  logger.info(`Ekklesia app listening at port ${ port }`);
});
