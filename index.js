const cors = require('cors')
if(process.env.NODE_ENV !== "production"){
  require("dotenv").config();
} 
const connectDB = require("./config/db");
const routers = require("./routes");
connectDB();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());
app.use(express.static('public'));
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


app.listen(port, () => {
  console.log(`Ekklesia app listening at port ${port}`);
});