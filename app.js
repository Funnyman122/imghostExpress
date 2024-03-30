const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs").promises;
const multer = require("multer")

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/upload", multer().single("file"))





// Connect to MongoDB
mongoose.connect("MongoDbConnectionURL")
  .then(async (client) =>  {

    console.log("Connected to MongoDB!");
    
    const users = client.connection.db.collection("Users");

    const allUsers = await users.find({}).toArray();
    
    allUsers.forEach((user) => {
        console.log(user.username)
    app.use("/"+user.username , async (req,res,next) => {
        const url = new URL(req.originalUrl, `http://${req.get("host")}`)
        const filename = url.pathname.split("/")
        console.log(filename)
        const dirs = await fs.readdir("./"+filename[1]+"/")
        for (let i = 0; i < dirs.length; i++) {
            let dir = dirs[i]
            console.log(dir)
            const dirsplit = dir.split(".")
            dirsplit.pop()
            if (dirsplit.join("") == filename[2]) {
                res.status(200).sendFile((__dirname+"\\"+filename[1]+"\\"+dir))
                return;
            }
        }
        res.status(404).send("File Not Found... :(")
            
    })
})



    const AIDS = require("./routes")(client, users);

    app.use("/api/", [AIDS]);

    app.listen(80, () => {
      console.log("Successfully began listening on " + 80);
    });
  })
  .catch(error => {
    console.error("Failure to connect to DB:", error);
  });
