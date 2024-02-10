import fs from 'fs';
import cors from 'cors';
if(process.env.NODE_ENV !== "production"){
  require("dotenv").config();
} 
import { connectDB } from "./config/db";
import routers from "./routes";
connectDB();

import express from "express";
import { downloadAndSaveFile } from './services/files.service';
import mammoth from 'mammoth';
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
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
    const data = await mammoth.convertToHtml({path: response}).catch((err) => {
      console.log(err);
    }) as any;
    // delete te file after converting
    fs.unlink(response, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
    res.send(data.value);
  } catch (error) {
    res.status(500).send
      ("Error downloading file:" + error);
  }
});

app.listen(port, () => {
  console.log(`Ekklesia app listening at port ${port}`);
});