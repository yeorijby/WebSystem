
const express = require('express');
const app = express();

// body-parser 사용하기 위해서 
app.use(express.urlencoded({ extended: true }));

// 몽고 DB를 사용하기 위해서 (설치 필요 : npm install mongoose)
const MongoClient = require('mongodb').MongoClient;

// ejs 엔진을 사용하기 위해서 (설치 필요 : npm install ejs)
app.set('view engine', 'ejs');

// 나는 Static 파일을 보관하기위해서 public 폴더를 쓸거다
app.set('/public', express.static('public'));

// PUT/DELETE 요청을 사용하기 위해서 Method Override를 사용한다.(설치필요 : npm install methode-override)
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// 환경변수를 사용하기 위해서 
require('dotenv').config();



// 몽고DB 접속 URI
const uri = "mongodb+srv://todoapp:todoapp@cluster0.fg8v9nz.mongodb.net/?retryWrites=true&w=majority";


let count = 1;
let db;
let collectionPost;
let collectionCounter;
let collectionLogin;

//===============================================================================================
// 몽고DB 접속 구문 
//===============================================================================================
// // 기존 접속 구문
// MongoClient.connect(uri, function(에러, client){
//   if (에러) return console.log(에러);

//   db = client.db("todoapp");

//   collectionPost = db.collection('post');
//   collectionCounter = db.collection('counter');


//   app.listen(8080, function() {
//     console.log('listening on 8080');
//   });
// })

// // env 파일 적용하는 몽고DB 접속 구문
MongoClient.connect(process.env.DB_URL, function(err, client){
    if (err) return console.log(err)
    
    db = client.db('todoapp');
    
    collectionPost = db.collection('post');
    collectionCounter = db.collection('counter');
    collectionLogin = db.collection('login');
    
    app.listen(process.env.PORT, function() {
      console.log('listening on' + process.env.PORT);
    })
  }) 
//-----------------------------------------------------------------------------------------------


app.get('/', function(요청, 응답) { 
  응답.render('index.ejs');      // 응답값을 브라우져로 던지지 않음!
})

app.get('/write', function(요청, 응답) { 
    응답.render('write.ejs');   // 응답값을 브라우져로 던지지 않음!
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

  var item = { name : '게시물갯수' };
  collectionCounter.findOne(item, function(에러, 결과){
    
    총게시물갯수 = 결과.totalPost;

    let title = 요청.body.title;
    let date = 요청.body.date;
  
    let objInsert = {_id : 총게시물갯수 + 1, 제목 : title, 날짜 : date};
    let objUpdate = { 제목 : title, 날짜 : date};
  
    collectionPost.insertOne(objInsert, function(에러, 결과){
        console.log('넘어온 데이터 저장완료 : ', objInsert);
    
        collectionCounter.updateOne(item, {$inc : {totalPost : 1} }, function(에러, 결과){
            if (에러)       return console.log(에러);
    
            //console.log("게시물 Counter가 수정되었습니다 => 결과 : ", 결과);
        });
    });        
  });
});


app.delete('/delete', function(요청, 응답) { 
    console.log(요청.body);

    요청.body._id = parseInt(요청.body._id);
    collectionPost.deleteOne(요청.body, function(에러, 결과){
        console.log('삭제완료');

        응답.status(200).send({message : '성공했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  

    });    
});


app.get('/detail/:id', function(요청, 응답) { 

    var id = parseInt(요청.params.id);
    collectionPost.findOne({_id : id}, function(에러, 결과){
        if (에러) 
            return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
        
        응답.render('detail.ejs', {data : 결과});
    });
});

app.get('/edit/:id', function(요청, 응답) { 

    // 응답.render('edit.ejs');

    var id = parseInt(요청.params.id);
    collectionPost.findOne({_id : id}, function(에러, 결과){
        if (에러) 
            return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
        
            //console.log(결과);
        응답.render('edit.ejs', {data : 결과});
    });
});

app.put('edit', function(요청, 응답){
    var id = parseInt(요청.body.id);
    var title = 요청.body.title;
    var date = 요청.body.date;

    collectionPost.updateOne({_id : id}, {$set : {제목 : title, 날짜 : date} }, function(에러, 결과){
        console.log('수정완료');
        응답.redirect('/list');
    });
});



// 세션 방식의 로그인 기능
// 로그인 기능을 사용하기 위해서 3개의 라이브러리를 설치한다.
// npm install passport passport-local express-session
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// 미들 웨어 설치
app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login', function(요청, 응답){
    응답.render('login.ejs');
});

// passport.authenticate()는 인증하는 기능
// 인증할때 local 방식으로 인증한다. 
// failureRedirect : '/fail' 는 실패했을 때 '/fail'이라는 곳으로 간다. 
app.post('/login', passport.authenticate('local', { failureRedirect : '/fail' }), function(요청, 응답){
    응답.redirect('/');
});



app.get('/mypage', 로그인했니, function(요청, 응답){
    console.log(요청.user);
    응답.render('mypage.ejs', {사용자 : 요청.user});
});

function 로그인했니(요청, 응답, next){
    if(요청.user) {
        next();
    } else {
        응답.send('로그인이 필요합니다.');
    }
}


// id & pw를 검사해주는 코드 
// -- done(서버에러, 성공시 사용자 DB 데이터, 에러 메세지);
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러);
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' });
      if (입력한비번 == 결과.pw) {
        return done(null, 결과);
      } else {
        return done(null, false, { message: '비번틀렸어요' });
      }
    })
  }));


// 세션을 만들어야 한다. 
passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser(function(아이디, done){
    // db에서 위에 있는 user.id를 유저를 찾은 뒤에 유저 정보를 
    collectionLogin.findOne({ id: 아이디 }, function (에러, 결과) {
        done(null, 결과);
    });
});






// Search 요청이 왔을 때 
app.get('/search', function(요청, 응답) { 
    //console.log(요청.query);
    //응답.render('write.ejs');   // 응답값을 브라우져로 던지지 않음!
    collectionPost.find({제목 :요청.query.value}).toArray(function(에러, 결과){
        //console.log(결과);
        응답.render('search.ejs', {posts : 결과});
    });
});

