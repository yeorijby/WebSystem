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
let Evaluate_Answer_SUM;
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
    Evaluate_Answer_SUM = db_Evaluate.collection('Answer_SUM');
    Evaluate_Login = db_Evaluate.collection('login');
    Evaluate_Multiple_Choice = db_Evaluate.collection('MultipleChoice');
    Evaluate_Multiple_Choice_Detail = db_Evaluate.collection('MultipleChoice_Detail');
    Evaluate_SubjectiveExpression = db_Evaluate.collection('SubjectiveExpression');
    
    Evaluate_Answer_SUM
    
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
    // console.log(요청.user);


    //let people = {};
    //people.length = 0;
    //응답.render('list.ejs', {people, loginUser : 요청.user});
    
    응답.redirect('/list');
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

app.get('/list', 로그인했니, function(요청, 응답) { 
    Evaluate_People.find().toArray(function(에러, 결과){
        console.log(요청.user);
        응답.render('list.ejs', {people : 결과, loginUser : 요청.user});
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
app.get('/edit/:id', 로그인했니, function(요청, 응답) { 
    // var id = parseInt(요청.body._id);
    var id = parseInt(요청.params.id);
    //console.log('id : ',id);
    //console.log('edit/:id로 들어왔음 - original');

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

        //console.log('edit/:id로 들어왔음 - 피플검색완료');
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

            //console.log('edit/:id로 들어왔음 - 객관식검색완료');

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

                //console.log('edit/:id로 들어왔음 - 객관식디테일검색완료');
    
                Evaluate_SubjectiveExpression.find().toArray(function(에러, 주관식결과){
                    //console.log(주관식결과);
                    if (!주관식결과)
                    {
                        console.log('주관식 결과가 없습니다');
            
                        // 일단 객관식 디테일의 결과만 표시할것 
                        응답.render('edit.ejs', {data : Result});
                    }
        
                    Result = { ...Result, SE: 주관식결과 };
                    //console.log('결과5 : ', Result);
        
                    //console.log('edit/:id로 들어왔음 - 주관식 검색완료');
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
app.put('/edit', 로그인했니, function(요청, 응답) { 
    //console.log(요청.body);


    var id = parseInt(요청.body.id);
    var counter = parseInt(요청.body.counter);
    var name = 요청.body.name;
    // var age = 요청.body.age;
    // var institution = 요청.body.institution;

    let bTemp01 = (요청.body.SL_WSL === undefined);
    let bTemp02 = (요청.body.SL_DBPL=== undefined);
    let bTemp03 = (요청.body.SL_WDPL=== undefined);
    let bTemp04 = (요청.body.SL_PRPL=== undefined);
    let bTemp05 = (요청.body.SL_DNL === undefined);
    let bTemp06 = (요청.body.CR_AAP === undefined);
    let bTemp07 = (요청.body.CR_DPC === undefined);
    let bTemp08 = (요청.body.CR_DVC === undefined);
    let bTemp09 = (요청.body.CR_RPD === undefined);
    let bTemp10 = (요청.body.SC_ECM === undefined);
    let bTemp11 = (요청.body.SC_MDR === undefined);
    let bTemp12 = (요청.body.SC_TMM === undefined);
    let bTemp13 = (요청.body.SC_HLM === undefined);
    let bTemp14 = (요청.body.PF_CSA === undefined);
    let bTemp15 = (요청.body.PF_OBJ === undefined);
    let bTemp16 = (요청.body.PF_RTN === undefined);
    let bTemp17 = (요청.body.PF_UDS === undefined);
    let bTemp18 = (요청.body.PF_DCM === undefined);
    let bTemp19 = (요청.body.PF_CRT === undefined);
    let bTemp20 = (요청.body.PF_LDS === undefined);
    let bTemp21 = (요청.body.RS_RPA === undefined);
    let bTemp22 = (요청.body.RS_RFP === undefined);
    let bTemp23 = (요청.body.RS_RCR === undefined);
    let bTemp24 = (요청.body.RS_RAP === undefined); 


    //var newDate = new Date();
    //var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    if (    bTemp01
        ||  bTemp02
        ||  bTemp03
        ||  bTemp04
        ||  bTemp05
        ||  bTemp06
        ||  bTemp07
        ||  bTemp08
        ||  bTemp09
        ||  bTemp10
        ||  bTemp11
        ||  bTemp12
        ||  bTemp13
        ||  bTemp14
        ||  bTemp15
        ||  bTemp16
        ||  bTemp17
        ||  bTemp18
        ||  bTemp19
        ||  bTemp20
        ||  bTemp21
        ||  bTemp22
        ||  bTemp23
        ||  bTemp24 ){
            console.log("요청.body :", 요청.body);
            // console.log("01 요청.body.SL_WSL :", bTemp01);
            // console.log("02 요청.body.SL_DBPL:", bTemp02);
            // console.log("03 요청.body.SL_WDPL:", bTemp03);
            // console.log("04 요청.body.SL_PRPL:", bTemp04);
            // console.log("05 요청.body.SL_DNL :", bTemp05);
            // console.log("06 요청.body.CR_AAP :", bTemp06);
            // console.log("07 요청.body.CR_DPC :", bTemp07);
            // console.log("08 요청.body.CR_DVC :", bTemp08);
            // console.log("09 요청.body.CR_RPD :", bTemp09);
            // console.log("10 요청.body.SC_ECM :", bTemp10);
            // console.log("11 요청.body.SC_MDR :", bTemp11);
            // console.log("12 요청.body.SC_TMM :", bTemp12);
            // console.log("13 요청.body.SC_HLM :", bTemp13);
            // console.log("14 요청.body.PF_CSA :", bTemp14);
            // console.log("15 요청.body.PF_OBJ :", bTemp15);
            // console.log("16 요청.body.PF_RTN :", bTemp16);
            // console.log("17 요청.body.PF_UDS :", bTemp17);
            // console.log("18 요청.body.PF_DCM :", bTemp18);
            // console.log("19 요청.body.PF_CRT :", bTemp19);
            // console.log("20 요청.body.PF_LDS :", bTemp20);
            // console.log("21 요청.body.RS_RPA :", bTemp21);
            // console.log("22 요청.body.RS_RFP :", bTemp22);
            // console.log("23 요청.body.RS_RCR :", bTemp23);
            // console.log("24 요청.body.RS_RAP :", bTemp24);
            return 응답.send("<script>alert('선택되지 않은 객관식 항목이 있습니다.'); location.href = document.referrer; </script>");
            //return 응답.status(400).send({message : '선택되지 않은 객관식 항목이 있습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
        }
    
        
        


    // 1. Answer 에다가 Row 하나 Insert하기(날짜를 집어넣어야 할 것)
    //    let objInsert = {_id : totalPeople + 1, name : req.body.name, institution : req.body.institution, age : req.body.age, 작성자_id : req.user._id, 작성자 : req.user.id, 작성자비번 : req.user.pw};
    let objInsert = {   //evaluate_time : time, 
                        people_id : id, people_name : name, 
                        SL_WSL :parseInt(요청.body.SL_WSL) , 
                        SL_DBPL:parseInt(요청.body.SL_DBPL),
                        SL_WDPL:parseInt(요청.body.SL_WDPL),
                        SL_PRPL:parseInt(요청.body.SL_PRPL),
                        SL_DNL :parseInt(요청.body.SL_DNL) ,
                        CR_AAP :parseInt(요청.body.CR_AAP) ,
                        CR_DPC :parseInt(요청.body.CR_DPC) ,
                        CR_DVC :parseInt(요청.body.CR_DVC) ,
                        CR_RPD :parseInt(요청.body.CR_RPD) ,
                        SC_ECM :parseInt(요청.body.SC_ECM) ,
                        SC_MDR :parseInt(요청.body.SC_MDR) ,
                        SC_TMM :parseInt(요청.body.SC_TMM) ,
                        SC_HLM :parseInt(요청.body.SC_HLM) ,
                        PF_CSA :parseInt(요청.body.PF_CSA) ,
                        PF_OBJ :parseInt(요청.body.PF_OBJ) ,
                        PF_RTN :parseInt(요청.body.PF_RTN) ,
                        PF_UDS :parseInt(요청.body.PF_UDS) ,
                        PF_DCM :parseInt(요청.body.PF_DCM) ,
                        PF_CRT :parseInt(요청.body.PF_CRT) ,
                        PF_LDS :parseInt(요청.body.PF_LDS) ,
                        RS_RPA :parseInt(요청.body.RS_RPA) ,
                        RS_RFP :parseInt(요청.body.RS_RFP) ,
                        RS_RCR :parseInt(요청.body.RS_RCR) ,
                        RS_RAP :parseInt(요청.body.RS_RAP) 
                    };
                    
    Evaluate_Answer.insertOne(objInsert, function(err2, result2){
        console.log('넘어온 데이터 저장완료 : ', objInsert);

        // 2. People 에 다가 카운트 증가 시키기
        Evaluate_People.updateOne({_id : id, name : name}, {$inc : {counter : 1} }, function(err3, result3){
            if (err3)       
                return console.log(err3);
    
            // // 3. 섬에 저장   
            // if (counter === 0){
            //     // 3.1. 처음 평가하게 되는 사람 => Insert
            //     Evaluate_Answer_SUM.insertOne(objInsert, function(err2, result2){
            //         console.log('넘어온 데이터 저장완료 : ', objInsert);
            //     });
            // } else { 
            //     // 3.2. 이미 평가했던 사람 => SUM

            // }
            //console.log("게시물 Counter가 수정되었습니다 => 결과 : ", 결과);
        });

    });        
    응답.redirect('/list'); 
});

let chart_data = null;
let MakeChartData_LogString;
/*
function MakeChartData(PeopleId){
    MakeChartData_LogString = "";
    var id = parseInt(PeopleId);
    // DB의 data를 가져와서 해당 항목1,2,3,4,5와, 데이터1에 실제 값을 입력할것
    Evaluate_Answer.find({people_id : id}).toArray(function(에러, 피플파인드결과){
        //Evaluate_People.find({_id : id}, function(에러, 피플결과){
        if (에러) {
            MakeChartData_LogString += "ID가" + id + "인 사람의 답변항목을 가져오지 못했습니다.";
            console.log(MakeChartData_LogString);
            // return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
            return null;
        }
        
        if (!피플파인드결과)
        {
            //console.log('피플파인드결과가 없습니다');
            MakeChartData_LogString += "ID가" + id + "인 사람의 피플파인드 결과가 없습니다.";
            console.log(MakeChartData_LogString);
            //return 응답.send("<script>alert('피플 파인드 결과가 없습니다.'); location.href = document.referrer; </script>");
            return null;
        }

        //console.log('피플파인드결과.SL_WSL : ', 피플파인드결과.SL_WSL, '피플파인드결과.SL_DBPL : ', 피플파인드결과.SL_DBPL);
        //console.log('피플파인드결과 : ', 피플파인드결과);

        //console.log('챠트/:id로 들어왔음-피플파인드 성공');
        MakeChartData_LogString = "[ID가 " + id + "이면  "  + 피플파인드결과[0].people_name + " 입니다.]";

        var 평가합계 = [
            {$match : { people_id : id}}, 
            {$group : { _id : id,
                        "name": { "$first": "$people_name" },
                        TOT_SL_WSL : { $sum : '$SL_WSL'}, 
                        TOT_SL_DBPL: { $sum : '$SL_DBPL'},
                        TOT_SL_WDPL: { $sum : '$SL_WDPL'},
                        TOT_SL_PRPL: { $sum : '$SL_PRPL'},
                        TOT_SL_DNL : { $sum : '$SL_DNL'},
                        TOT_CR_AAP : { $sum : '$CR_AAP'},
                        TOT_CR_DPC : { $sum : '$CR_DPC'},
                        TOT_CR_DVC : { $sum : '$CR_DVC'},
                        TOT_CR_RPD : { $sum : '$CR_RPD'},
                        TOT_SC_ECM : { $sum : '$SC_ECM'},
                        TOT_SC_MDR : { $sum : '$SC_MDR'},
                        TOT_SC_TMM : { $sum : '$SC_TMM'},
                        TOT_SC_HLM : { $sum : '$SC_HLM'},
                        TOT_PF_CSA : { $sum : '$PF_CSA'},
                        TOT_PF_OBJ : { $sum : '$PF_OBJ'},
                        TOT_PF_RTN : { $sum : '$PF_RTN'},
                        TOT_PF_UDS : { $sum : '$PF_UDS'},
                        TOT_PF_DCM : { $sum : '$PF_DCM'},
                        TOT_PF_CRT : { $sum : '$PF_CRT'},
                        TOT_PF_LDS : { $sum : '$PF_LDS'},
                        TOT_RS_RPA : { $sum : '$RS_RPA'},
                        TOT_RS_RFP : { $sum : '$RS_RFP'},
                        TOT_RS_RCR : { $sum : '$RS_RCR'},
                        TOT_RS_RAP : { $sum : '$RS_RAP'}
                      }}
        ];

        Evaluate_Answer.aggregate(평가합계).toArray(function (에러1, 결과) {
            if (에러1) {
                MakeChartData_LogString += "Aggregete 하지 못했습니다.";
                console.log(MakeChartData_LogString);
                // return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
                return null;

            }
                
            let SumObj = 결과[0];
            //console.log('결과.name : ', SumObj.name);

            // 항목을 자동으로 구분해 내는 로직이 필요하다!!!! - 지금은 하드코딩으로 .....
            let SL = (SumObj.SL_DBPL + SumObj.SL_DNL + SumObj.SL_PRPL + SumObj.SL_WSL + SumObj.SL_WDPL) / 5;
            let CR = (SumObj.CR_AAP + SumObj.CR_DPC + SumObj.CR_DVC + SumObj.CR_RPD) / 4;
            let SC = (SumObj.SC_ECM + SumObj.SC_HLM + SumObj.SC_MDR + SumObj.SC_TMM) / 4;
            let PF = (SumObj.PF_CRT + SumObj.PF_CSA + SumObj.PF_DCM + SumObj.PF_LDS + SumObj.PF_OBJ + SumObj.PF_RTN + SumObj.PF_UDS) / 7;
            let RS = (SumObj.RS_RAP + SumObj.RS_RCR + SumObj.RS_RFP + SumObj.RS_RPA) / 4;

            //console.log('챠트/:id로 들어왔음-데이터 합산 성공');

            //return 응답.send("<script>alert('정상합계가 되었나 봅니다.'); location.href = document.referrer; </script>");
            //return 응답.redirect('/list'); 
            chart_data = {
                labels: ['영적생활', '자질', '규모', '사역수행능력', '사역관계'],           // 지금은 하드코딩으로 
                //labels: ['SL', 'CR', 'SC', 'PF', 'RS'],
                datasets: [
                    {
                    label: SumObj.name,
                    data: [SL, CR, SC, PF, RS],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    },
                    // 추가 데이터셋을 필요에 따라 설정할 수 있습니다.
                ],
            };

            MakeChartData_LogString += "챠트데이터 만들기 성공하였습니다.";
            console.log(MakeChartData_LogString);

            console.log(chart_data);
        
            //응답.render('chart.ejs', { data });    // ★★★★★★★★★★★ Ajax로 요청시에는 응답.render가 동작하지 않음 !
            //응답.status(200).send({message : '성공했습니다.', res_data : data});      // 이렇게 해야함!

            //응답.redirect('/persnal_chart?chart_data=' + chart_data);       
            //응답.redirect('/persnal_chart'); 
            return chart_data;   
        });       
    });

    console.log('왜 일로 빠지는 거야');
    return null;
}
//*/
// app.get('/chart/:id', function(요청, 응답) { 
//     var id = parseInt(요청.params.id);
//     console.log('id : ', id);
//     //console.log('챠트/:id로 들어왔음-original');

//     // // DB의 data를 가져와서 해당 항목1,2,3,4,5와, 데이터1에 실제 값을 입력할것
//     // Evaluate_Answer.find({people_id : id}).toArray(function(에러, 피플파인드결과){
//     //     //Evaluate_People.find({_id : id}, function(에러, 피플결과){
//     //     if (에러) 
//     //         return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
        
//     //     if (!피플파인드결과)
//     //     {
//     //         console.log('피플파인드결과가 없습니다');

//     //         //return 응답.redirect('/list');
//     //         // return 응답.status(400).send({message : '피플파인드결과가 없습니다.'});
//     //         return 응답.send("<script>alert('피플 파인드 결과가 없습니다.'); location.href = document.referrer; </script>");
//     //     }

//     //     //console.log('피플파인드결과.SL_WSL : ', 피플파인드결과.SL_WSL, '피플파인드결과.SL_DBPL : ', 피플파인드결과.SL_DBPL);
//     //     //console.log('피플파인드결과 : ', 피플파인드결과);

//     //     //console.log('챠트/:id로 들어왔음-피플파인드 성공');

//     //     var 평가합계 = [
//     //         {$match : { people_id : id}}, 
//     //         {$group : { _id : id,
//     //                     "name": { "$first": "$people_name" },
//     //                     TOT_SL_WSL : { $sum : '$SL_WSL'}, 
//     //                     TOT_SL_DBPL: { $sum : '$SL_DBPL'},
//     //                     TOT_SL_WDPL: { $sum : '$SL_WDPL'},
//     //                     TOT_SL_PRPL: { $sum : '$SL_PRPL'},
//     //                     TOT_SL_DNL : { $sum : '$SL_DNL'},
//     //                     TOT_CR_AAP : { $sum : '$CR_AAP'},
//     //                     TOT_CR_DPC : { $sum : '$CR_DPC'},
//     //                     TOT_CR_DVC : { $sum : '$CR_DVC'},
//     //                     TOT_CR_RPD : { $sum : '$CR_RPD'},
//     //                     TOT_SC_ECM : { $sum : '$SC_ECM'},
//     //                     TOT_SC_MDR : { $sum : '$SC_MDR'},
//     //                     TOT_SC_TMM : { $sum : '$SC_TMM'},
//     //                     TOT_SC_HLM : { $sum : '$SC_HLM'},
//     //                     TOT_PF_CSA : { $sum : '$PF_CSA'},
//     //                     TOT_PF_OBJ : { $sum : '$PF_OBJ'},
//     //                     TOT_PF_RTN : { $sum : '$PF_RTN'},
//     //                     TOT_PF_UDS : { $sum : '$PF_UDS'},
//     //                     TOT_PF_DCM : { $sum : '$PF_DCM'},
//     //                     TOT_PF_CRT : { $sum : '$PF_CRT'},
//     //                     TOT_PF_LDS : { $sum : '$PF_LDS'},
//     //                     TOT_RS_RPA : { $sum : '$RS_RPA'},
//     //                     TOT_RS_RFP : { $sum : '$RS_RFP'},
//     //                     TOT_RS_RCR : { $sum : '$RS_RCR'},
//     //                     TOT_RS_RAP : { $sum : '$RS_RAP'}
//     //                   }}
//     //     ];

//     //     Evaluate_Answer.aggregate(평가합계).toArray(function (에러1, 결과) {
//     //         if (에러1) {
//     //             return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
//     //         }
                
//     //         let SumObj = 결과[0];
//     //         //console.log('결과.name : ', SumObj.name);

//     //         // 항목을 자동으로 구분해 내는 로직이 필요하다!!!! - 지금은 하드코딩으로 .....
//     //         let SL = (SumObj.SL_DBPL + SumObj.SL_DNL + SumObj.SL_PRPL + SumObj.SL_WSL + SumObj.SL_WDPL) / 5;
//     //         let CR = (SumObj.CR_AAP + SumObj.CR_DPC + SumObj.CR_DVC + SumObj.CR_RPD) / 4;
//     //         let SC = (SumObj.SC_ECM + SumObj.SC_HLM + SumObj.SC_MDR + SumObj.SC_TMM) / 4;
//     //         let PF = (SumObj.PF_CRT + SumObj.PF_CSA + SumObj.PF_DCM + SumObj.PF_LDS + SumObj.PF_OBJ + SumObj.PF_RTN + SumObj.PF_UDS) / 7;
//     //         let RS = (SumObj.RS_RAP + SumObj.RS_RCR + SumObj.RS_RFP + SumObj.RS_RPA) / 4;

//     //         //console.log('챠트/:id로 들어왔음-데이터 합산 성공');

//     //         //return 응답.send("<script>alert('정상합계가 되었나 봅니다.'); location.href = document.referrer; </script>");
//     //         //return 응답.redirect('/list'); 
//     //         chart_data = {
//     //             labels: ['영적생활', '자질', '규모', '사역수행능력', '사역관계'],           // 지금은 하드코딩으로 
//     //             //labels: ['SL', 'CR', 'SC', 'PF', 'RS'],
//     //             datasets: [
//     //                 {
//     //                 label: SumObj.name,
//     //                 data: [SL, CR, SC, PF, RS],
//     //                 backgroundColor: 'rgba(255, 99, 132, 0.2)',
//     //                 borderColor: 'rgba(255, 99, 132, 1)',
//     //                 borderWidth: 1,
//     //                 },
//     //                 // 추가 데이터셋을 필요에 따라 설정할 수 있습니다.
//     //             ],
//     //         };

//     //         console.log('챠트/:id로 들어왔음-챠트 데이터 만들기 성공!');
        
//     //         //응답.render('chart.ejs', { data });    // ★★★★★★★★★★★ Ajax로 요청시에는 응답.render가 동작하지 않음 !
//     //         //응답.status(200).send({message : '성공했습니다.', res_data : data});      // 이렇게 해야함!

//     //         //응답.redirect('/persnal_chart?chart_data=' + chart_data);       
//     //         응답.redirect('/persnal_chart');      
//     //     });       
//     // });

//     chart_data = MakeChartData(id);

//     if (chart_data === null || chart_data === undefined){
//         응답.status(400).send({message : MakeChartData_LogString});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
//     }

//     응답.redirect('/personal_chart/' + id);
//     //응답.status(200).send({message : '성공했습니다.', data : chart_data});      // 이렇게 해야함!

// });


app.get('/personal_chart/:id', 로그인했니, function(요청, 응답) { 
    var id = parseInt(요청.params.id);
    console.log('퍼스널 챠트로 들어왔음-original');

    MakeChartData_LogString = "";

    Evaluate_Answer.find({people_id : id}).toArray(function(에러, 피플파인드결과){
        //Evaluate_People.find({_id : id}, function(에러, 피플결과){
        if (에러) {
            MakeChartData_LogString += "ID가" + id + "인 사람의 답변항목을 가져오지 못했습니다.";
            console.log(MakeChartData_LogString);
            // return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
            return null;
        }
        
        if (!피플파인드결과)
        {
            //console.log('피플파인드결과가 없습니다');
            MakeChartData_LogString += "ID가" + id + "인 사람의 피플파인드 결과가 없습니다.";
            console.log(MakeChartData_LogString);
            //return 응답.send("<script>alert('피플 파인드 결과가 없습니다.'); location.href = document.referrer; </script>");
            return null;
        }

        //console.log('피플파인드결과.SL_WSL : ', 피플파인드결과.SL_WSL, '피플파인드결과.SL_DBPL : ', 피플파인드결과.SL_DBPL);
        //console.log('피플파인드결과 : ', 피플파인드결과);

        //console.log('챠트/:id로 들어왔음-피플파인드 성공');
        counter = 피플파인드결과.length;

        MakeChartData_LogString = "[ID가 " + id + "이면  "  + 피플파인드결과[0].people_name + " 입니다.]";

        var 평가합계 = [
            {$match : { people_id : id}}, 
            {$group : { _id : id,
                        "name": { "$first": "$people_name" },
                        TOT_SL_WSL : { $sum : '$SL_WSL'}, 
                        TOT_SL_DBPL: { $sum : '$SL_DBPL'},
                        TOT_SL_WDPL: { $sum : '$SL_WDPL'},
                        TOT_SL_PRPL: { $sum : '$SL_PRPL'},
                        TOT_SL_DNL : { $sum : '$SL_DNL'},
                        TOT_CR_AAP : { $sum : '$CR_AAP'},
                        TOT_CR_DPC : { $sum : '$CR_DPC'},
                        TOT_CR_DVC : { $sum : '$CR_DVC'},
                        TOT_CR_RPD : { $sum : '$CR_RPD'},
                        TOT_SC_ECM : { $sum : '$SC_ECM'},
                        TOT_SC_MDR : { $sum : '$SC_MDR'},
                        TOT_SC_TMM : { $sum : '$SC_TMM'},
                        TOT_SC_HLM : { $sum : '$SC_HLM'},
                        TOT_PF_CSA : { $sum : '$PF_CSA'},
                        TOT_PF_OBJ : { $sum : '$PF_OBJ'},
                        TOT_PF_RTN : { $sum : '$PF_RTN'},
                        TOT_PF_UDS : { $sum : '$PF_UDS'},
                        TOT_PF_DCM : { $sum : '$PF_DCM'},
                        TOT_PF_CRT : { $sum : '$PF_CRT'},
                        TOT_PF_LDS : { $sum : '$PF_LDS'},
                        TOT_RS_RPA : { $sum : '$RS_RPA'},
                        TOT_RS_RFP : { $sum : '$RS_RFP'},
                        TOT_RS_RCR : { $sum : '$RS_RCR'},
                        TOT_RS_RAP : { $sum : '$RS_RAP'}
                      }}
        ];

        Evaluate_Answer.aggregate(평가합계).toArray(function (에러1, 결과) {
            if (에러1) {
                MakeChartData_LogString += "Aggregete 하지 못했습니다.";
                console.log(MakeChartData_LogString);
                // return 응답.status(400).send({message : '실패했습니다.'});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
                return null;

            }
                
            let SumObj = 결과[0];
            //console.log('결과.SL_DBPL : ', SumObj);

            // 항목을 자동으로 구분해 내는 로직이 필요하다!!!! - 지금은 하드코딩으로 .....
            let ChartValue = new Array(5);

            let ChartQuestionCount = [5, 4, 4, 7, 4];
            let GradeCount = 5;
            SUM_SL = SumObj.TOT_SL_DBPL + SumObj.TOT_SL_DNL + SumObj.TOT_SL_PRPL + SumObj.TOT_SL_WSL + SumObj.TOT_SL_WDPL;
            SUM_CR = SumObj.TOT_CR_AAP + SumObj.TOT_CR_DPC + SumObj.TOT_CR_DVC + SumObj.TOT_CR_RPD;
            SUM_SC = SumObj.TOT_SC_ECM + SumObj.TOT_SC_HLM + SumObj.TOT_SC_MDR + SumObj.TOT_SC_TMM;
            SUM_PF = SumObj.TOT_PF_CRT + SumObj.TOT_PF_CSA + SumObj.TOT_PF_DCM + SumObj.TOT_PF_LDS + SumObj.TOT_PF_OBJ + SumObj.TOT_PF_RTN + SumObj.TOT_PF_UDS;
            SUM_RS = SumObj.TOT_RS_RAP + SumObj.TOT_RS_RCR + SumObj.TOT_RS_RFP + SumObj.TOT_RS_RPA;

            AGV_SL = parseInt(SUM_SL / ChartQuestionCount[0]) ;
            AGV_CR = parseInt(SUM_CR / ChartQuestionCount[1]) ;
            AGV_SC = parseInt(SUM_SC / ChartQuestionCount[2]) ;
            AGV_PF = parseInt(SUM_PF / ChartQuestionCount[3]) ;
            AGV_RS = parseInt(SUM_RS / ChartQuestionCount[4]) ;
            
            let denominator = GradeCount * counter;
            ChartValue[0] = parseInt(AGV_SL / denominator * 100);
            ChartValue[1] = parseInt(AGV_CR / denominator * 100);
            ChartValue[2] = parseInt(AGV_SC / denominator * 100);
            ChartValue[3] = parseInt(AGV_PF / denominator * 100);
            ChartValue[4] = parseInt(AGV_RS / denominator * 100);

            console.log(SUM_SL, SUM_CR, SUM_SC, SUM_PF, SUM_RS);
            console.log(AGV_SL, AGV_CR, AGV_SC, AGV_PF, AGV_RS);
            console.log(ChartValue);

            //console.log('챠트/:id로 들어왔음-데이터 합산 성공');

            //return 응답.send("<script>alert('정상합계가 되었나 봅니다.'); location.href = document.referrer; </script>");
            //return 응답.redirect('/list'); 

            data = {
                labels: ['영적생활', '자질', '규모', '사역수행능력', '사역관계'],           // 지금은 하드코딩으로 
                //labels: ['SL', 'CR', 'SC', 'PF', 'RS'],
                value : ChartValue,
                labelName : SumObj.name, 
                datasets: [
                    {
                    label: SumObj.name,
                    data: ChartValue,                                       ////
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    },
                    // 추가 데이터셋을 필요에 따라 설정할 수 있습니다.
                ],
            };

            MakeChartData_LogString += "챠트데이터 만들기 성공하였습니다.";
            console.log(MakeChartData_LogString);

            
        
            응답.render('chart.ejs', { data });    // ★★★★★★★★★★★ Ajax로 요청시에는 응답.render가 동작하지 않음 !
            //응답.status(200).send({message : '성공했습니다.', res_data : data});      // 이렇게 해야함!

            //응답.redirect('/persnal_chart?chart_data=' + chart_data);       
            //응답.redirect('/persnal_chart'); 
            //return chart_data;   
        });       
    });
    
    // if (chart_data === null || chart_data === undefined){

    //     응답.status(400).send({message : MakeChartData_LogString});       // 2XX : 요청 성공, 4XX : 잘못된 요청으로 실패, 5XX : 서버의 문제  
    // }

    // 응답.render('chart.ejs', { data : chart_data });
});
