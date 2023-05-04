// 라이브러리를 쓰기 위해서 Require를 사용한다. 
var router = require('express').Router();

function 로그인했니(요청, 응답, next){
    if(요청.user) {
        next();
    } else {
        응답.send('로그인이 필요합니다.');
    }
}

// shirts일때만 로그인 검사를 진행함!
router.use('/shirts', 로그인했니);

router.get('/shirts', function(req, res) {
    res.send('셔츠 파는 페이지 입니다');
});
router.get('/pants', function(req, res) {
    res.send('바지 파는 페이지 입니다');
});

// 배출 문법(Return 의 개념?)
module.exports = router;
