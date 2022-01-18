var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(`<p>/store/info/:symbloname : symbolname에 해당하는 정보 info테이블에 저장<p>
  <p>/get/info : info테이블 가져오기
  `);
});

module.exports = router;
