const connectDB = require("./config/db");
const routers = require("./routes");

connectDB();

const express = require("express");
const app = express();
const port = 3000;

app.get("/fetchMks", routers.fetchMks);
app.get("/updateCommittees", routers.updateCommittees);
app.get("/updateCommitteesMembers", routers.updateCommitteesMembers);
app.get("/fetchCommitteesSessions", routers.fetchCommitteesSessions);
app.get("/updateSessionsInCommittees", routers.updateSessionsInCommittees);
app.get("/fetchQueries", routers.fetchQueries);
app.get("/fetchBills", routers.fetchBills);
app.get("/updateBills", routers.updateBills);

app.listen(port, () => {
  console.log(`Ekklesia app listening at http://localhost:${port}`);
});