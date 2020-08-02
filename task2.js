const cvs = require("csvtojson");
const fs = require("fs");
const pathToCvsFile = "./csv/test.csv";

cvs()
  .fromFile(pathToCvsFile)
  .then((jsonObject) => {
    fs.writeFileSync("./text1.txt", JSON.stringify(jsonObject));
  })
  .catch((err) => {
    console.error("error: ", err);
  });
