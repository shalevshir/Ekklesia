const connectDB = require("./config/db");
const routers = require("./routes");
const cors = require("cors");
connectDB();

const express = require("express");
const app = express();
const port = 3000;
app.use(cors());
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
  console.log(`Ekklesia app listening at http://localhost:${port}`);
});