
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
//app.engine('ejs', require('ejs').__express);

const uri = "mongodb+srv://todoapp:todoapp@cluster0.fg8v9nz.mongodb.net/?retryWrites=true&w=majority";

let count = 1;
let db;
let collectionPost;
let collectionCounter;
MongoClient.connect(uri, function(에러, client){
  if (에러) return console.log(에러);

  db = client.db("todoapp");

  collectionPost = db.collection('post');
  collectionCounter = db.collection('counter');


  app.listen(8080, function() {
    console.log('listening on 8080');
  });
})


app.get('/', function(요청, 응답) { 
  응답.sendFile(__dirname +'/index.html');
})

app.get('/write', function(요청, 응답) { 
    응답.sendFile(__dirname +'/write.html');
});

app.get('/list', function(요청, 응답) { 
    collectionPost.find().toArray(function(에러, 결과){
        //console.log(결과);
        응답.render('list.ejs', {posts : 결과});
    });

    
});

let 총게시물갯수;
app.post('/add', function(요청, 응답){
  console.log(요청.body);
  응답.send('전송완료');

  collectionCounter.findOne({name : '게시물갯수'}, function(에러, 결과){
    
    총게시물갯수 = 결과.totalPost;

    let title = 요청.body.title;
    let date = 요청.body.date;
  
    let obj = {_id : 총게시물갯수 + 1, 제목 : title, 날짜 : date};
  
    // collectionCounter(obj, function(에러, 결과){
    //   console.log('넘어온 데이터 저장완료 : ', obj);
    // });    
    collectionPost.insertOne(obj, function(에러, 결과){
      console.log('넘어온 데이터 저장완료 : ', obj);
    });    
  });


});

