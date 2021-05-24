var express = require('express');

var app = express();

app.use(express.json());
app.use(express.static(__dirname + "/"));
app.post('', function (request, response) {

    let fs = require("fs")
    fs.writeFileSync('./sets/tableRecords.json', JSON.stringify(request.body));
    response.json(request.body);
});

app.listen(3000);
