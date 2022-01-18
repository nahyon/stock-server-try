const express = require('express');
const router = express.Router();
const connection = require("../config/dbconnection.js");
const request = require('request'); //request모듈 사용

//info테이블 조회----------------------------------------------------------------------------------------------------------------------
const symbols = ['AAPL', 'MSFT', 'GOOG', 'GOOGL', 'AMZN', 'TSLA', 'FB', 'NVDA', 'PYPL', 'ADBE'];
const names_kr = ['애플', '마이크로소프트', '구글-알파벳 클래스 C', '구글-알파벳 클래스 A', '아마존', '테슬라', '페이스북', '엔비디아', '페이팔', '어도비' ]
// /get/info/ info 테이블 조회
router.get('/info', (req, res) => {
    var company=req.params.company;
    connection.query(`SELECT * FROM info`, (err, results, fields) => {
      if (err) throw err;
      res.json(results); // json
    });
});


//symbol_day테이블 조회----------------------------------------------------------------------------------------------------------------------
// /get/day/aapl aapl_day 테이블 조회
router.get('/day/:symbolname', (req, res) => {
  var symbol=req.params.symbolname;
  //특정날짜(오늘-4일)와 같은 날`SELECT * FROM ${symbol}_day WHERE date(date) = date(now())-4 ` , >= -6이면 6일전~최근거까지
  connection.query(`SELECT * FROM ${symbol}_day WHERE date(date) >= date(UTC_TIMESTAMP)-8 ORDER BY date DESC`, (err, results, fields) => { 
    res.json(results); // json
  });
});


module.exports = router;