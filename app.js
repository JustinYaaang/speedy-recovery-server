const http = require('http');
const port=process.env.PORT || 3000
var fs = require('fs')
var url = require('url')
var mysql = require('mysql');
var authData = JSON.parse(fs.readFileSync('./auth_folder/azure_auth.json', 'utf8'))[0];

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

  }else if(path == '/page2.html'){
    // response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
    response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });

    var connection = mysql.createConnection({
      host: authData.host,
      port: 3306,
      user: authData.user,
      password: authData.password,
      database: authData.database,
      ssl: fs.readFileSync(authData.ssl_file),
      insecureAuth: true
    });

    connection.connect(function(err) {
      if (err){
        console.log("error when connecting")
        console.log(err)
      }
      else{
        console.log("successfully connecting")        
      }
    });

    let target_user = '\'user1\''
    var select_sql = "SELECT * FROM messages WHERE (sender = " + target_user + " or recipient = " + target_user + ") AND NOT EXISTS (SELECT * FROM messages as M2 WHERE M2.Conversation_Id = messages.Conversation_Id AND M2.Id > messages.Id) ORDER BY time"
    var ans = [];

    connection.query(select_sql, function (error, results, fields) {
        if (error){
            console.log("error when selecting")
            console.log(error)
        }
        else{
            console.log('The answer is: ', results);
            for (var i = 0; i < results.length; i++){
              var username = results[i].Sender;
              if ("\'" + username + "\'" == target_user){
                username = results[i].Recipient;
              }
              ans.push({"alt":"alt",
                'title': username,
                'subtitle': results[i].Message,
                'date': results[i].time,
                'unread': 2
              });

            }
            console.log(ans);
        }
    });

    connection.end(function(err) {
      if (err){
          console.log("error when disconnectiong")
      }
      else{
          console.log("successfully disconnectiong")        
      }
      // response.write(fs.readFileSync("./test_files/conversations.json", 'utf8'));
      response.write(JSON.stringify(ans));
      response.end()
    });

    
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


