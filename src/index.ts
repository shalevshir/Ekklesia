import fs from 'fs';
import cors from 'cors';
if(process.env.NODE_ENV !== "production"){
  require("dotenv").config();
} 
import { connectDB } from "./config/db";
connectDB();
import routers from "./routes";

import logger from "./services/logging.service";
import express from "express";
import { downloadAndSaveFile } from './services/files.service';
import mammoth from 'mammoth';
const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
  origin: 'http://www.ekklesia.co.il',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(express.static('public'));
app.get('/health', (req, res) => {
  res.send('ok');
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

app.get("/getNextQuery", routers.getNextQuery);
app.post("/addCategoryToQuery", routers.addCategoryToQuery);

app.get("/fetchMks", routers.fetchMks);
app.get("/fetchCommittees", routers.fetchCommittees);
app.get("/updateCommitteesMembers", routers.updateCommitteesMembers);
app.get("/fetchCommitteesSessions", routers.fetchCommitteesSessions);
app.get("/updateSessionsInCommittees", routers.updateSessionsInCommittees);
app.get("/fetchQueries", routers.fetchQueries);
app.get("/fetchBills", routers.fetchBills);
app.get("/updateBills", routers.updateBills);


app.get("/categories", routers.getCategories);
app.get("/subCategories/:categoryName", routers.getSubCategories);
app.get("/downloadFile", async (req, res) => {
  try {
    const url = req.query.url as string;
    const response = await downloadAndSaveFile(url);
    const data = await mammoth.convertToHtml({path: response});

    fs.unlink(response, (err) => {
      if (err) {
        logger.error(err)
        return
      }
    })
    res.send(data.value);
  } catch (error) {
    logger.error("Error downloading file:", error);
    res.status(500).send
      ("Error downloading file:" + error);
  }
});

app.listen(port, () => {
  logger.info(`Ekklesia app listening at port ${port}`);
});