const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", routes);
app.use(express.static(__dirname));

app.listen(5000, () => console.log("Server running on port 5000"));
