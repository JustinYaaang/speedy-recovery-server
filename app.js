const http = require('http');
const port=process.env.PORT || 3000
var url = require('url')
var fs = require('fs')
var mysql = require('mysql');


// const server = http.createServer((req, res) => {
// res.statusCode = 200;
// res.setHeader('Content-Type', 'text/html');
// res.end('<h1>Hello World</h1>');
// });
// server.listen(port,() => {
// console.log(`Server running at port `+port);
// });


var server = http.createServer(function(request, response){   
  var parsedUrl = url.parse(request.url, true)
  var path = request.url 
  var query = ''
  if(path.indexOf('?') >= 0){ query = path.substring(path.indexOf('?')) }
  var pathNoQuery = parsedUrl.pathname
  var queryObject = parsedUrl.query
  var method = request.method


  console.log('HTTP PATH: ' + path)
  if(path == '/page1.html'){
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end('<h1>Hello World</h1>');

  }else if(path == '/page2.html'){
    response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });
    let fake_data = [
      {
        "avatar": "https://institutogoldenprana.com.br/wp-content/uploads/2015/08/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg",
        "alt": "alt",
        "title": "Donald Trump",
        "userId": 1,
        "subtitle" : "I'm gonna build a wall",
        "date": "2014-08-04T00:00:00Z",
        "unread": 0
      },
      {
        "avatar": "https://institutogoldenprana.com.br/wp-content/uploads/2015/08/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg",
        "alt": "alt",
        "title": "Jens Krinke",
        "userId": 2,
        "subtitle" : "Are there any more questions????",
        "date": "2014-08-04T00:00:00Z",
        "unread": 0
      },
      {
        "avatar": "https://institutogoldenprana.com.br/wp-content/uploads/2015/08/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg",
        "alt": "alt",
        "title": "Graham Collins",
        "userId": 3,
        "subtitle" : "Win this book in 5 simple steps!",
        "date": "2014-08-04T00:00:00Z",
        "unread": 3
      }
    ]
    response.write(JSON.stringify(fake_data));
    response.end()
  }else if(path == '/page3'){
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.write('<!DOCTYPE>\n<html>'  + 
      '<head><link rel="stylesheet" href="/style.js">' +
      '</head><body>'  +
      '<h1>This is page 3</h1>' +
      '<script src="/script.html"></script>' +
      '</body></html>')
    response.end()
  }else{
    response.statusCode = 404
    response.end()
  }
})

server.listen(port)


