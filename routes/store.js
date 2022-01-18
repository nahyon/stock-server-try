const express = require('express');
const router = express.Router();
const connection = require("../config/dbconnection.js");
const request = require('request'); //request모듈 사용

const alphavantagerequestUrl = 'https://www.alphavantage.co/query?';
//const apiKey = 'ZO8S591P8HTYI8LV' //바로바로 요청보냈을 때 값이 바로 안온다.
const apiKey = 'undefined'

//info테이블 insert----------------------------------------------------------------------------------------------------------------------
const symbols = ['AAPL', 'MSFT', 'GOOG', 'GOOGL', 'AMZN', 'TSLA', 'FB', 'NVDA', 'PYPL', 'ADBE'];
const names_kr = ['애플', '마이크로소프트', '구글-알파벳 클래스 C', '구글-알파벳 클래스 A', '아마존', '테슬라', '페이스북', '엔비디아', '페이팔', '어도비' ]
/*
// /store/info : 위 리스트에 있는 symbol들의 정보를 저장
router.get('/info', function(req, res) {   

    symbols.forEach( (value, index, array) => {
        let queryParams = `function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}` //얘가 밑으롣 들어가야함..
    })
    //for i in symbols :
    //    let queryParams = `function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
   
    request(
        {
            url : alphavantagerequestUrl + queryParams,
            method : "GET",
            json: true
        },
        function(error, response, body) {
            if (error) {throw new Error(error);}

            const allDateData = body['Time Series (Daily)'];
            const alldatelist = Object.keys(allDateData);
            const dateList = alldatelist.splice(0, 3); //데이터 몇개만 넣어보기
            //console.log(allDateData[dateList[0]]["5. volume"]);
            
            // Query to insert multiple rows
            let sqlquery = `INSERT IGNORE INTO daily (symbol, name_kr, name_en) VALUES ?;`;
            // Values to be inserted
            let values = [];
            for (let i = 0; i<symbols.length; i++) {
                values.push([symbol, dateList[i], allDateData[dateList[i]]["5. volume"]]);
            }
            console.log(values[0]);
            
            // Executing the query
            connection.query(sqlquery, [values], (err, rows) => {
                if (err) throw err;
                console.log(`${symbol} : All Rows Inserted !`);
                res.send(`${symbol} : All Rows Inserted !`);
            }); 
        }
    )
});
*/
/* 한글이름 수정
router.get('/info/rename', (req, res) =>{
    for (let i = 0; i<symbols.length; i++) {
        let query = `UPDATE info SET name_kr = ? WHERE symbol=?;`
        connection.query(query, [names_kr[i], symbols[i]], (err, rows) => {
            if (err) throw err;
            res.send('수정완료');
        }); 
    }

})
*/

// /store/info/AAPL ; AAPL정보 저장 
// 없으면(body에 내용 없으면(alphavantage에 존재X)) db저장 안되는 코드 필요
router.get('/info/:symbolname', function(req, res) {   
    let symbol = req.params.symbolname
    let queryParams = `function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
   
    request(
        {
            url : alphavantagerequestUrl + queryParams,
            method : "GET",
            json: true
        },
        function(error, response, body) {
            if (error) {throw new Error(error);}

            // Query to insert multiple rows
            let query = `INSERT IGNORE INTO info (symbol, name_kr, name_en, description) VALUES (?, ?, ?, ?);`;
            
            // Executing the query
            connection.query(query, [symbol, names_kr[0], body.Name, body.Description], (err, rows) => {
                if (err) throw err;
                console.log(`${symbol} : All Rows Inserted !`);
                res.send(`symbol 10가지 = ${symbols}`);
            }); 
        }
    )
});

// /store/day/AAPL ; AAPL day 데이터 저장-----------------------------------------------------
router.get('/day/:symbolname', function(req, res) {   
    let symbol = req.params.symbolname
    let queryParams = `function=TIME_SERIES_DAILY&outputsize=full&symbol=${symbol}&apikey=${apiKey}`
   
    //오늘날짜 -1 = 전날 날짜
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + (today.getDate()-1)).slice(-2); //전날 날짜 //(수정필요) 1일인경우?(ex 2022-02-01)
    const dateString = year + '-' + month  + '-' + day;

    request(
        {
            url : alphavantagerequestUrl + queryParams,
            method : "GET",
            json: true
        },
        function(error, response, body) {
            if (error) {throw new Error(error);}

            const last_refreshedDay = body["Meta Data"]["3. Last Refreshed"]; 

            const timeseries = body['Time Series (Daily)']; //"Meta Data", "Time Series(daily)" 중 두번째거 전부
            const alldatelist = Object.keys(timeseries); //날짜만 --밑코드지우고이거
            //const alldatelist = Object.keys(timeseries).splice(0,3) //3개만 뽑아서 테스트할겨
      
            //테이블 조회 후 저장된 데이터 중 가장 최근거 < last_refreshedDay일 경우 insert (매일 cron돌릴거니까 하나만 비교하면된다, 없어도 오류안나고 넘어가게하는 코드 필요)

            // Values to be inserted
            let values = [];
            for (let onedate of alldatelist) {
                //if (dateString == last_refreshedDay) { //최근 업데이트 된 데이터가 어제거라면 insert할 것이다. (매일 다음날새벽 cron돌림)
                    values.push([
                        onedate, 
                        timeseries[onedate]["1. open"],
                        timeseries[onedate]["2. high"],
                        timeseries[onedate]["3. low"],
                        timeseries[onedate]["4. close"],
                        timeseries[onedate]["5. volume"]
                    ]);
                //}
                //else {
                //    console.log(`${symbol} :오늘은 데이터가 업데이트되지 않았습니다.`) //(수정필요) 여기면 밑에 query문 실행안되게
                //}
            }
            // Query to insert multiple rows'
            let query = `INSERT IGNORE INTO ${symbol}_day (date, open, high, low, close, volume) VALUES ?;`;
            
            // Executing the query
            connection.query(query, [values], (err, rows) => {
                //console.log(rows);
                if (err) throw err;
                
                if(rows.affectedRows > 0){
                    console.log(`${symbol} : All Rows Inserted !`);
                    res.send(`요청 : /day/symbol 10가지 = ${symbols}`);  
                    //let updated = rows.insertId;
                    //res.redirect("/info_updated/" + updated); //info_updated의 해당 symbol을 update하러
                  }else{
                    console.error(rows.message);
                    res.send({resultCd:'E', msg: "새로 insert한 데이터가 없습니다. " + rows.message});
                  }
                
            }); 
   
        }
    )
});


module.exports = router;

