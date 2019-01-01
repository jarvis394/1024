const express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/views/index.html'); 
});

app.get('/test', async (req, res) => {
  res.sendFile(__dirname + '/views/test.html'); 
});

app.get('/docs', async (req, res) => {
  res.sendFile(__dirname + '/docs/index.html'); 
});

var listener = app.listen(4000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});