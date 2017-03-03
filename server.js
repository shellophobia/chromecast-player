var express = require('express'),
http = require('http'),
path = require('path'),
bodyParser = require('body-parser'),
fs = require('fs'),
srt2vtt = require('srt-to-vtt'),
multiparty = require('multiparty');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/static', express.static(path.join(__dirname, 'node_modules/video.js/dist')));

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.sendFile(__dirname +'/videoplayer.html');
});

app.post('/getvtt', function(req, res) {
  if (Object.keys(req.body).length == 0) {
    var form = new multiparty.Form();
    // form.parse(req, function(err, fields, files) {
    //   console.log(fields);
    //   console.log(files.data[0].headers);
    // });
    form.on('part', function(part) {
      var file = fs.createWriteStream("cast.srt");
      part.pipe(file);
      file.on('finish', function() {
        file.close(convertToVTT);
      });
    });
    form.parse(req);
    res.send("File is ready");
  } else {
    var type = req.body.type;
    if (type == "local") {
      res.send("Format not supported");
    } else {
      var url = req.body.url;
      console.log(url);
      var dest = "cast.srt";
      var file = fs.createWriteStream(dest);
      var request = http.get(url, function(response) {
        console.log(response);
        response.pipe(file);
        file.on('finish', function() {
          console.log('writing finished');
          file.close(convertToVTT);
        });
      }).on('error', function(err) {
        fs.unlink(dest);
      });
    }
  }
});

app.listen(8080, function() {
  console.log("listeninng on  port 8080");
});

function convertToVTT() {
  fs.createReadStream('cast.srt')
  .pipe(srt2vtt())
  .pipe(fs.createWriteStream('cast.vtt'));
}
