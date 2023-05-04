// 라이브러리를 쓰기 위해서 Require를 사용한다. 
var router = require('express').Router();

function 로그인했니(요청, 응답, next){
    if(요청.user) {
        next();
    } else {
        응답.send('로그인이 필요합니다.');
    }
}

//router.use(로그인했니);

// router.get('/sub/sports', function(req, res) {
//     res.send('스포츠 게시판');
// });
// router.get('/sub/game', function(req, res) {
//     res.send('게임 게시판');
// });

// app.use 미들 웨어를 사용하고 싶을때 쓰는 문법 
router.use('/sub', require('./sub/sub.js'));


// 배출 문법(Return 의 개념?)
module.exports = router;
