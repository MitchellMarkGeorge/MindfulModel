import { ToxicDataType } from "./types";
import csv from "csv-parser";
import fs from "fs";
// ToxicDataType

let results: ToxicDataType[] = [];

(function main(filename: string) {
    fs.createReadStream(`data/${filename}.csv`)
      .pipe(csv())
      .on("data", (row) => {
        // console.log(row);
        let newRow = transformRow(row);
  
        results.push(newRow);
      })
      .on("end", () => {
        fs.writeFile(`data/${filename}.json`, JSON.stringify(results), (err => {
            if (err) return console.log(err);
            console.log("CSV file successfully processed");


        }));
        
      });
  })("test");



function transformRow({ id, comment_text, ...rest }): ToxicDataType {
  let newObject: ToxicDataType = {
    comment_text,
    prediction: Object.values(rest).map((item) => Number(item)),
  };

  return newObject;
}


