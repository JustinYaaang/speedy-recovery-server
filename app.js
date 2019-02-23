const http = require('http');
const port=process.env.PORT || 3000
var url = require('url')

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


