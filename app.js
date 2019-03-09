const http = require('http');
const port=process.env.PORT || 3000
var url = require('url')
var fs = require('fs')
var mysql = require('mysql');
var authData = JSON.parse(fs.readFileSync('./auth_folder/azure_auth.json', 'utf8'))[0];


var server = http.createServer(function(request, response){   
  var parsedUrl = url.parse(request.url, true)
  var path = request.url 
  var query = ''
  if(path.indexOf('?') >= 0){ query = path.substring(path.indexOf('?')) }
  var pathNoQuery = parsedUrl.pathname
  var queryObject = parsedUrl.query
  var method = request.method
  var connection = mysql.createConnection({
    host: authData.host,
    port: 3306,
    user: authData.user,
    password: authData.password,
    database: authData.database,
    ssl: fs.readFileSync(authData.ssl_file),
    insecureAuth: true
  });

  console.log('HTTP PATH: ' + path)
  // GET /conversations?userId=$userId
  console.log(path.substring(path.indexOf("/"), path.indexOf("?")))
  // practitioners?userid=$userid
  if (path.substring(path.indexOf("/"), path.indexOf("?")) == "/conversation"){
    response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'

    });
    let userid1 = '\'' + path.substring(path.indexOf("userid1=")+8, path.indexOf("&")) + '\''
    let userid2 = '\'' + path.substring(path.indexOf("&userid2=")+9) + '\''
    console.log(userid1)
    console.log(userid2)
    let select_sql1 = "(SELECT ID FROM conversations where (Recipient1_Id=" + userid1 + "and Recipient2_Id=" + userid2 + ") or (Recipient1_Id=" + userid2 + " and Recipient2_Id=" +userid1 + "))"
    let select_sql2 = "SELECT * from messages where Conversation_Id=" + select_sql1;


    connection.query(select_sql2, function (error, results, fields) {
        if (error){
            console.log("error when selecting")
            console.log(error)
        }
        else{
          // conversation_id = results[0].ID;
          // console.log(results)
          response.write(JSON.stringify(results));
          // console.log(conversation_id)
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
      response.end()
    });




  }else if (path.substring(path.indexOf("/"), path.indexOf("?")) == "/practitioners"){
    response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });

    let target_user = path.substring(path.indexOf("=") + 1)
    let select_sql = "SELECT * FROM practitionerextrainformation WHERE ID=" + '\'' + target_user + '\''
    
    connection.query(select_sql, function (error, results, fields) {
        if (error){
            console.log("error when selecting")
            console.log(error)
        }
        let ans = [{"id": results[0].ID, "favouriteFootballTeam": results[0].FavouriteFootballTeam, "hometown": results[0].Hometown, "favouriteFood": results[0].FavouriteFood, "favouriteAnimal": results[0].FavouriteAnimal}]
        console.log(ans);
        
        response.write(JSON.stringify(ans));

    });

    connection.end(function(err) {
      if (err){
          console.log("error when disconnectiong")
      }
      else{
          console.log("successfully disconnectiong")        
      }
      // response.write(fs.readFileSync("./test_files/conversations.json", 'utf8'));
      response.end()
    });



  }else if (path.substring(path.indexOf("/"), path.indexOf("?")) == "/conversations"){
    response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });

    let target_user = path.substring(path.indexOf("=") + 1)
    var select_sql_unread = "SELECT * from conversations WHERE (Recipient1_Id=\'" + target_user + "\' or Recipient2_Id=\'" + target_user + "\')"
    var select_sql = "SELECT * FROM messages WHERE (sender = \'" + target_user + "\' or recipient = \'" + target_user + "\') AND NOT EXISTS (SELECT * FROM messages as M2 WHERE M2.Conversation_Id = messages.Conversation_Id AND M2.Id > messages.Id) ORDER BY time"
    var ans = [];


    connection.query(select_sql_unread, function (err, res, flds) {
      if (!err){
        console.log(res)
        dict = []
        for (var j = 0; j < res.length; j++){
          dict[res[j].ID] = [res[j].Recipient1_Id, res[j].Recipient2_Id, res[j].unread1, res[j].unread2]
        }
        connection.query(select_sql, function (error, results, fields) {
            if (error){
                console.log("error when selecting")
                console.log(error)
            }
            else{
                console.log('The answer is: ', results);
                for (var i = 0; i < results.length; i++){
                  unread = 0;
                  if (dict[results[i].Conversation_Id][0] == target_user && dict[results[i].Conversation_Id][2]){
                    unread = dict[results[i].Conversation_Id][2];
                  }
                  else if (dict[results[i].Conversation_Id][1] == target_user && dict[results[i].Conversation_Id][3]){
                    unread = dict[results[i].Conversation_Id][3];
                  }
                  ans.push({"alt":"alt",
                    'Conversation_Id': results[i].Conversation_Id,
                    'userid1': results[i].Sender,
                    'userid2': results[i].Recipient,
                    'subtitle': results[i].Message,
                    'date': results[i].time,
                    'unread': unread
                  });

                }
                // console.log(ans);
            }
        });

      }

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

    });




    

  }else if (path.substring(path.indexOf("/"), path.indexOf("?")) == "/messages"){
    console.log("aaa")
    response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    "Access-Control-Allow-Headers": "Content-Type,Sender,Recipient"
    });
    var headers = request.headers

    var sender = '\'' + headers.sender + '\'';
    var recipient = '\'' + headers.recipient + '\'';

    console.log(sender)
    console.log(recipient)

    var body = '';
    var message = '';
    let message_start_token = "<message_start>";
    let message_end_token = "<message_end>";

    request.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    request.on('end', () => {
        message = '\'' + body.substring(body.indexOf(message_start_token) + message_start_token.length, body.indexOf(message_end_token)) + '\'';
        console.log(message);


        var fetch_conversation_id = "SELECT ID from conversations where (Recipient1_Id=" + sender + " and Recipient2_Id=" + recipient + ") or (Recipient1_Id=" + recipient + " and Recipient2_Id=" + sender + ")"
        console.log(fetch_conversation_id)
        connection.query(fetch_conversation_id, function (error, results, fields) {
            if (!error){
                // console.log(results)
                // response.write(JSON.stringify(results));
                if (results.length){
                console.log("has result")
                let conversation_id = results[0].ID;
                console.log(conversation_id);
                let insert_message = "INSERT INTO messages (Conversation_Id, Sender, Recipient, Message) VALUES (" + conversation_id + ", " + sender + ", " + recipient + ", " + message + ");"
                console.log(insert_message);
                connection.query(insert_message, function (err, new_results, flds) {
                    if (err){
                        console.log(err)
                    }
                    else{
                        response.write('success');
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
                    response.end()
                });


              }
              else{
                console.log("no result")
                let insert_conversation_sql = "INSERT INTO conversations (Recipient1_Id, Recipient2_Id) VALUES (" + sender + ", " + recipient + ")";
                console.log(insert_conversation_sql);

                connection.query(insert_conversation_sql, function (err, new_results, flds) {
                    if (err){
                        console.log(err)
                    }
                    else{
                        console.log(new_results);                        
                        let conversation_id = new_results.insertId;
                        console.log(conversation_id);
                        let insert_message = "INSERT INTO messages (Conversation_Id, Sender, Recipient, Message) VALUES (" + conversation_id + ", " + sender + ", " + recipient + ", " + message + ");"
                        console.log(insert_message);
                        connection.query(insert_message, function (errs, new_result, fld) {
                            if (err){
                                console.log(err)
                            }
                            else{
                                response.write('success');
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
                            response.end()
                        });

                    }
                });

              }
            }
        });


        

    });

  }else if(path == '/page1.html'){
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end('<h1>Hello World</h1>');

  }else if(path == '/page2.html'){
    response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
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


