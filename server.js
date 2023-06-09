// 코드 변경 될때마다 서버를 재시작 하는것이 귀찮을때 (★★★★★설치 필요 : npm install -g nodemon)


// 서버를 쉽게 짤수있게 도와주는 라이브러리 (★★★★★설치 필요 : npm install express)
const express = require('express');
const app = express();

// body-parser 사용하기 위해서 (★★★★★설치 필요 : npm install body-parser)
app.use(express.urlencoded({ extended: true }));

// 몽고 DB를 사용하기 위해서 
//(★★★★★설치 필요 : npm install mongoose)
//(★★★★★설치 필요 : npm install mongodb --save)
const MongoClient = require('mongodb').MongoClient;

// ejs 엔진을 사용하기 위해서 (★★★★★설치 필요 : npm install ejs)
app.set('view engine', 'ejs');

// 나는 Static 파일을 보관하기위해서 public 폴더를 쓸거다
app.set('/public', express.static('public'));

// PUT/DELETE 요청을 사용하기 위해서 Method Override를 사용한다.(★★★★★설치필요 : npm install methode-override)
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// 환경변수를 사용하기 위해서 (★★★★★설치 필요 : npm i dotenv)
require('dotenv').config();

// 현재시간 받아오기 위해 (★★★★★설치 필요 : npm install date-util)
//require('date-util');                 // 동작하지 않아서 주석으로 처리 

// 몽고DB 접속 URI
const uri = "mongodb+srv://todoapp:todoapp@cluster0.fg8v9nz.mongodb.net/?retryWrites=true&w=majority";


let count = 1;
let db;
let collectionPost;
let collectionCounter;
let collectionLogin;
let collectionChatroom;

// Answer

let db_Evaluate;
let Evaluate_People;        // Evaluate.People
let Evaluate_Counter;
let Evaluate_Answer;
let Evaluate_Login;
let Evaluate_Multiple_Choice;
let Evaluate_Multiple_Choice_Detail;
let Evaluate_SubjectiveExpression;


//let Evaluate_Counter;
// // env 파일 적용하는 몽고DB 접속 구문
MongoClient.connect(process.env.DB_URL, function(err, client){
    if (err) 
        return console.log(err)
    
    // db = client.db('todoapp');
    
    // collectionPost = db.collection('post');
    // collectionCounter = db.collection('counter');
    // collectionLogin = db.collection('login');
    // collectionChatroom = db.collection('chatroom');


    db_Evaluate = client.db('evaluate');
    
    Evaluate_People = db_Evaluate.collection('people');
    Evaluate_Counter = db_Evaluate.collection('counter');
    Evaluate_Answer = db_Evaluate.collection('Answer');
    Evaluate_Login = db_Evaluate.collection('login');
    Evaluate_Multiple_Choice = db_Evaluate.collection('MultipleChoice');
    Evaluate_Multiple_Choice_Detail = db_Evaluate.collection('MultipleChoice_Detail');
    Evaluate_SubjectiveExpression = db_Evaluate.collection('SubjectiveExpression');
    

    
    app.listen(process.env.PORT, function() {
      console.log('listening on' + process.env.PORT);
    })
  }) 
//-----------------------------------------------------------------------------------------------

// 세션 방식의 로그인 기능
// 로그인 기능을 사용하기 위해서 3개의 라이브러리를 설치한다.
// npm install passport passport-local express-session
// (★★★★★설치 필요 : npm install passport)
// (★★★★★설치 필요 : npm install passport-local)
// (★★★★★설치 필요 : npm install express-session)
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
    //var id = parseInt(요청.user.id);
    console.log(요청.user);
    응답.render('index.ejs', {loginUser : 요청.user});
    //응답.redirect('/');
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
    Evaluate_Login.findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러);
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' });
      if (입력한비번 == 결과.pw) {                                  //비번 암호과가 필요함
        return done(null, 결과);
      } else {
        return done(null, false, { message: '비번틀렸어요' });
      }
    })
  }));


// 세션을 만들어야 한다. - 새션을 만들때 user.id를 암호화하여 저장(브라우져상의 쿠키로)한다.  
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// 세션에서 사용자 정보를 가져온다 - user.id를 새션을 통해서 가져올때 복호화하여 불러온다.  
passport.deserializeUser(function(아이디, done){
    // db에서 위에 있는 user.id를 유저를 찾은 뒤에 유저 정보를 
    Evaluate_Login.findOne({ id: 아이디 }, function (에러, 결과) {
        done(null, 결과);
    });
});



















app.get('/', function(요청, 응답) { 
    var id = parseInt(요청.params.id);
    console.log('/에서 id : ', 요청.user);
    //console.log('/에서 id : ',id);
    
    응답.render('index.ejs');      // 응답값을 브라우져로 던지지 않음!
})

app.get('/write', function(요청, 응답) { 
    응답.render('write.ejs');   // 응답값을 브라우져로 던지지 않음!
});

app.get('/list', function(요청, 응답) { 
    Evaluate_People.find().toArray(function(에러, 결과){
        console.log(결과);
        응답.render('list.ejs', {people : 결과});
    });
});

 
// Search 요청이 왔을 때 
app.get('/search', function(요청, 응답) { 
    //console.log(요청.query);
 
    var 검색조건 = [
        { 
            $search: {
                index: 'titleName',
                text:{
                    query : 요청.query.value,
                    path : "name"
                }
            }
        },
        {$sort : {_id : 1} },                                           // 소팅 기능(id 순으로)
        {$limit : 10},                                                  // 데이터수 제한
        {$project : { _id : 1, name : 1, score : {$meta : 'searchScore'}, },},    // 특정 조건에 맞게 찾아오기(제목 표시하고, 검색점수를 표시한다. )
    ];
    // 정규식 : 비슷한거 찾을 때 => /찾을내용/
    // 빨리 찾고 싶으면 인덱스를 DB에 추가하고 아래와 같은 방식으로 명령을 주면 빨리 찾는다. 
    // find가 아닌 aggregate사용한다(검색조건에 배열로 검색이 가능하다.)
    Evaluate_People.aggregate(검색조건).toArray(function(에러, 결과){
        console.log(결과);
        응답.render('search.ejs', {posts : 결과});
    });
});











let totalPeople;
app.post('/add', function(req, res){
  //console.log(요청.body);
//  res.send('전송완료');      // => 맨 밑에서 함!
//    res.redirect('/list'); 

  var item = { name : 'totalPeople' };
  Evaluate_Counter.findOne(item, function(err1, result1) {
    
    // if (err1) 
    //     return console.log(err1);

    console.log(result1);

    totalPeople = result1.totalCount;

    //console.log(req.body);
    // let title = req.body.title;
    // let date = req.body.institution;
  
//    let objInsert = {_id : totalPeople + 1, name : req.body.name, institution : req.body.institution, age : req.body.age, 작성자_id : req.user._id, 작성자 : req.user.id, 작성자비번 : req.user.pw};
    let objInsert = {_id : totalPeople + 1, name : req.body.name, institution : req.body.institution, age : req.body.age, counter : 0};

  
    Evaluate_People.insertOne(objInsert, function(err2, result2){
        console.log('넘어온 데이터 저장완료 : ', objInsert);
    
        Evaluate_Counter.updateOne(item, {$inc : {totalCount : 1} }, function(err3, result3){
            if (err3)       return console.log(err3);
    
            //console.log("게시물 Counter가 수정되었습니다 => 결과 : ", 결과);
        });
    });        
  });
  res.redirect('/list'); 
});

app.delete('/delete', function(요청, 응답) { 
    //console.log(요청.body);

    요청.body._id = parseInt(요청.body._id);

    // var 삭제할데이터 = {_id: 요청.body._id, 작성자_id : 요청.user._id};
    var 삭제할데이터 = {_id: 요청.body._id};

    Evaluate_People.deleteOne(삭제할데이터, function(err, 결과){
        if (err)       return console.log('에러 : ', err);

        console.log('삭제완료');

        //console.log('에러 : ',에러);

        응답.status(200).send({message : '성공했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  

    });    
});

// 목록페이지(List.ejs) 수정버튼이 눌러졌을 때 수정 페이지(해당 글번호의 값을 불러와서 폼)를 띄우는 기능 구현
app.get('/edit/:id', function(요청, 응답) { 
    // var id = parseInt(요청.body._id);
    var id = parseInt(요청.params.id);
    console.log('id : ',id);

    Evaluate_People.findOne({_id : id}, function(에러, 피플결과){
        if (에러) 
            return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
        
        //console.log('결과1 : ', 피플결과);
        if (!피플결과)
        {
            console.log('피플결과가 없습니다');

            //return 응답.redirect('/list');
            return 응답.status(400).send({message : '피플결과가 없습니다.'});
        }

        var Result = {People : 피플결과};

        //console.log('결과2 : ', Result);

        Evaluate_Multiple_Choice.find().toArray(function(에러, 객관식결과){
            //console.log(객관식결과);
            if (!객관식결과)
            {
                console.log('객관식 결과가 없습니다');
    
                // 일단 피플의 결과만 표시할것 
                응답.render('edit.ejs', {data : Result});
            }

            Result = { ...Result, MC: 객관식결과 };
            //console.log('결과3 : ', Result);

            Evaluate_Multiple_Choice_Detail.find().toArray(function(에러, 객관식디테일결과){
                //console.log(객관식디테일결과);
                if (!객관식디테일결과)
                {
                    console.log('객관식 결과가 없습니다');
        
                    // 일단 객관식의 결과만 표시할것 
                    응답.render('edit.ejs', {data : Result});
                }
    
                Result = { ...Result, MCD: 객관식디테일결과 };
                //console.log('결과4 : ', Result);
    
                Evaluate_SubjectiveExpression.find().toArray(function(에러, 주관식결과){
                    //console.log(주관식결과);
                    if (!주관식결과)
                    {
                        console.log('객관식 디테일 결과가 없습니다');
            
                        // 일단 객관식 디테일의 결과만 표시할것 
                        응답.render('edit.ejs', {data : Result});
                    }
        
                    Result = { ...Result, SE: 주관식결과 };
                    //console.log('결과5 : ', Result);
        
                    응답.render('edit.ejs', {data : Result});
                    //console.log('결과6 : ', Result);
                });                
                // 응답.render('edit.ejs', {data : Result});
            });
            // 응답.render('edit.ejs', {data : Result});
        });
        // 응답.render('edit.ejs', {data : Result});
    });
});


// 수정 페이지(edit.ejs)에서 수정 버튼이 해당 글번호의 값을 불러와서 데이터를 업데이트 하는 기능 구현 
app.put('/edit', function(요청, 응답) { 
    console.log(요청.body);


    var id = parseInt(요청.body.id);
    var counter = parseInt(요청.body.counter);
    var name = 요청.body.name;
    // var age = 요청.body.age;
    // var institution = 요청.body.institution;

    


    //var newDate = new Date();
    //var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    if (    요청.body.WSL === undefined
        ||  요청.body.DBPL=== undefined
        ||  요청.body.WDPL=== undefined
        ||  요청.body.PRPL=== undefined
        ||  요청.body.DNL === undefined
        ||  요청.body.AAP === undefined
        ||  요청.body.DPC === undefined
        ||  요청.body.DVC === undefined
        ||  요청.body.RPD === undefined
        ||  요청.body.ECM === undefined
        ||  요청.body.MDR === undefined
        ||  요청.body.TMM === undefined
        ||  요청.body.HLM === undefined
        ||  요청.body.RPA === undefined
        ||  요청.body.RFP === undefined
        ||  요청.body.RCR === undefined
        ||  요청.body.RAP === undefined
        ||  요청.body.CSA === undefined
        ||  요청.body.OBJ === undefined
        ||  요청.body.RTN === undefined
        ||  요청.body.UDS === undefined
        ||  요청.body.DCM === undefined
        ||  요청.body.CRT === undefined
        ||  요청.body.LDS === undefined ){
            return 응답.status(400).send({message : '선택되지 않은 객관식 항목이 있습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
        }
    // 1. Answer 에다가 Row 하나 Insert하기(날짜를 집어넣어야 할 것)
    //    let objInsert = {_id : totalPeople + 1, name : req.body.name, institution : req.body.institution, age : req.body.age, 작성자_id : req.user._id, 작성자 : req.user.id, 작성자비번 : req.user.pw};
    let objInsert = {   //evaluate_time : time, 
                        people_id : id, people_name : name, 
                        WSL : 요청.body.WSL, 
                        DBPL: 요청.body.DBPL,
                        WDPL: 요청.body.WDPL,
                        PRPL: 요청.body.PRPL,
                        DNL : 요청.body.DNL ,
                        AAP : 요청.body.AAP ,
                        DPC : 요청.body.DPC ,
                        DVC : 요청.body.DVC ,
                        RPD : 요청.body.RPD ,
                        ECM : 요청.body.ECM ,
                        MDR : 요청.body.MDR ,
                        TMM : 요청.body.TMM ,
                        HLM : 요청.body.HLM ,
                        RPA : 요청.body.RPA ,
                        RFP : 요청.body.RFP ,
                        RCR : 요청.body.RCR ,
                        RAP : 요청.body.RAP ,
                        CSA : 요청.body.CSA ,
                        OBJ : 요청.body.OBJ ,
                        RTN : 요청.body.RTN ,
                        UDS : 요청.body.UDS ,
                        DCM : 요청.body.DCM ,
                        CRT : 요청.body.CRT ,
                        LDS : 요청.body.LDS 
                    };

    
    Evaluate_Answer.insertOne(objInsert, function(err2, result2){
        console.log('넘어온 데이터 저장완료 : ', objInsert);

        // 2. People 에 다가 카운트 증가 시키기
        Evaluate_People.updateOne({_id : id, name : name}, {$inc : {counter : 1} }, function(err3, result3){
            if (err3)       
                return console.log(err3);
    
            //console.log("게시물 Counter가 수정되었습니다 => 결과 : ", 결과);
        });

    });        
    응답.redirect('/list'); 
});


app.get('/chart/:id', function(요청, 응답) { 
    var id = parseInt(요청.params.id);
    console.log('id : ', id);
    // DB의 data를 가져와서 해당 항목1,2,3,4,5와, 데이터1에 실제 값을 입력할것
    Evaluate_Answer.find({people_id : id}).toArray(function(에러, 결과){
        //Evaluate_People.find({_id : id}, function(에러, 피플결과){
        if (에러) 
            return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
        
        // console.log('결과1 : ', 결과);
        if (!결과)
        {
            console.log('피플결과가 없습니다');

            //return 응답.redirect('/list');
            return 응답.status(400).send({message : '피플결과가 없습니다.'});
        }
        var Result = {Answer : 결과};

        const feildName = Object.keys(결과);

        console.log('필드이름 : ', feildName);   

        // Evaluate_Multiple_Choice.find().toArray(function(에러, 객관식결과){
        //     //console.log(객관식결과);
        //     if (!객관식결과)
        //     {
        //         console.log('객관식 결과가 없습니다');
    
        //         // 일단 피플의 결과만 표시할것 
        //         응답.render('edit.ejs', {data : Result});
        //     }

        //     Result = { ...Result, MC: 객관식결과 };
        //     //console.log('결과3 : ', Result);

        //     Evaluate_Multiple_Choice_Detail.find().toArray(function(에러, 객관식디테일결과){
        //         //console.log(객관식디테일결과);
        //         if (!객관식디테일결과)
        //         {
        //             console.log('객관식 결과가 없습니다');
        
        //             // 일단 객관식의 결과만 표시할것 
        //             응답.render('edit.ejs', {data : Result});
        //         }
    
        //         Result = { ...Result, MCD: 객관식디테일결과 };
        //         //console.log('결과4 : ', Result);
    
        //         var sum = 0;
        //         for (var i = 0; i <객관식결과.length; i++) {
        //             for (var j = 0; j <객관식디테일결과.length; j++) {
        //                 if (객관식결과[i].LargeQuestion_Code === 객관식디테일결과[j].LQ_Code) {
                            
        //                     sum = sum + 
        //                 }        
        //             }
        //         }
                



        //         Evaluate_SubjectiveExpression.find().toArray(function(에러, 주관식결과){
        //             //console.log(주관식결과);
        //             if (!주관식결과)
        //             {
        //                 console.log('객관식 디테일 결과가 없습니다');
            
        //                 // 일단 객관식 디테일의 결과만 표시할것 
        //                 응답.render('edit.ejs', {data : Result});
        //             }
        
        //             Result = { ...Result, SE: 주관식결과 };
        //             //console.log('결과5 : ', Result);
        
        //             응답.render('edit.ejs', {data : Result});
        //             //console.log('결과6 : ', Result);
        //         });                
        //         // 응답.render('edit.ejs', {data : Result});
        //     });
        //     // 응답.render('edit.ejs', {data : Result});
        // });
        // 응답.render('edit.ejs', {data : Result});
    });




    const data = {
        labels: ['항목1', '항목2', '항목3', '항목4', '항목5'],
        datasets: [
          {
            label: '데이터1',
            data: [3, 5, 2, 4, 1],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          // 추가 데이터셋을 필요에 따라 설정할 수 있습니다.
        ],
    };
    console.log('챠트로 들어왔음');

    응답.render('chart.ejs', { data });
});