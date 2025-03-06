const fs = require("fs");

module.exports = {
  writeToFile: (updateData) => {
    fs.readFile("access.json", "utf8", function readFileCallback(err, data) {
      if (err) {
        fs.writeFile(
          "access.json",
          JSON.stringify(updateData({})),
          "utf8",
          () => {}
        );
      } else {
        obj = JSON.parse(data); //now it an object
        obj = { ...obj, ...updateData(obj) };
        json = JSON.stringify(obj); //convert it back to json
        fs.writeFile("access.json", json, "utf8", () => {}); // write it back
      }
    });
  },
  readFromFile: async () => {
    return new Promise((resolve, reject) => {
      fs.readFile("access.json", "utf8", function readFileCallback(err, data) {
        if (err) {
          // console.log(err);
          resolve({});
        } else {
          obj = JSON.parse(data); //now it an object
          resolve(obj);
        }
      });
    });
  },
};
