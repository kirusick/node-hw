import cvs from "csvtojson";
import fs from "fs";
const pathToCvsFile = "./csv/test.csv";

cvs()
  .fromFile(pathToCvsFile)
  .then((jsonObject) => {
    fs.writeFileSync("./text1.txt", JSON.stringify(jsonObject));
  })
  .catch((err) => {
    console.error("error: ", err);
  });
