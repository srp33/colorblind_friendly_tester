const express = require('express');
const app = express();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const path = require('path');
var bodyParser = require('body-parser')
const fs = require('fs');
var exec = require('child_process').exec;
const { v4: uuidv4 } = require('uuid');

let imageID;
const e = require('express');
const { type } = require('os');

const colorblindPrefix = "colorblind_friendly_tester"

app.use("/" + colorblindPrefix + '/public', express.static(process.cwd() + '/public'));
app.use("/" + colorblindPrefix + '/uploads', express.static(process.cwd() + '/uploads'));

app.use(bodyParser.urlencoded({limit: '5mb', extended: false}));


app.post("/" + colorblindPrefix + '/upload', async function (req, res) {

  if (!req.body.file) {
    res.status(404).json({ error: 'Please provide an image' });
    return;
  }

  const directory = "uploads";
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });

  //Read base64 into buffer then create new file in /uploads
  imageID =  uuidv4();
  let file = req.body.file.replace(/^data:image\/(png|jpeg);base64,/,"");
  const targetPath = path.join(__dirname, `uploads/${imageID}.png`);
  fs.writeFileSync(targetPath, file, {'encoding': 'base64'});


  if(imageID){
    exec('Rscript simulateImage.R '+imageID, function (error, stdout, stderr) {
      if (error) {
        res.send(error);
        return;
      }
      else if (stderr) {
        res.send(stderr);
        return;
      }
      else if (stdout) {
        console.log(stdout);
      }
    });
  } else {
    res.status(404).json({ error: 'No ImageID' });
    return;
  }

  res.status(200).json({ id: imageID });
  return;
});



// app.post("/" + colorblindPrefix + "/convert", async(req, res)=> {
//   if(imageID){
//     exec('Rscript simulateImage.R '+imageID, function (error, stdout, stderr) {
//       if (error) {
//         res.send(error);
//         return;
//       }
//       else if (stderr) {
//         res.send(stderr);
//         return;
//       }
//       else if (stdout) {
//         res.status(204).send();
//         return;
//       }
//       res.status(204).send();
//       return;
//     });
//   } else {
//     res.status(204).send();
//   }
// });

app.get("/" + colorblindPrefix + "uploads/" + imageID + ".png", (req, res) => {
  res.sendFile(path.join(__dirname, "/uploads/" + imageID + ".png"));
});

app.get("/" + colorblindPrefix + "/", function (req, res) {
  res.sendFile(process.cwd() + "/index.html");
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log("Server is running on " + port);
});
