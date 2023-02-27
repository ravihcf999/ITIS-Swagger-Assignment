const express = require("express");
const app = express();
const axios = require("axios");
const https = require("https");
const port = 3001;

app.get("/say", function (req, res) {
  console.log(req.query.keyword);
  https.get(
    "https://m95iitk8oh.execute-api.us-east-2.amazonaws.com/say?keyword=" +
      req.query.keyword,
    (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        data += chunk;
        res.write(data);
        res.end();
      });
    }
  );
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
