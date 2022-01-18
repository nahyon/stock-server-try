const express = require('express');
const router = express.Router();
const connection = require("../config/dbconnection.js");
const request = require('request'); //request모듈 사용

// temp/
router.get("/", function (req, res) {
    function symbolCreator() {
      return new Promise(function (resolve, reject) {
        request("https://www.tradingview.com/markets/stocks-usa/market-movers-large-cap/", (error, response, html) => {
          if (!error && response.statusCode === 200) {
            const $ = cheerio.load(html)
            const $symbolResults = $(".tv-data-table__row.tv-data-table__stroke.tv-screener-table__result-row")
            $symbolResults.each(function (i, result) {
              List[i] = {
                title: $(this).find("div").find("div").find("a").text(),
                company: $(this)
                  .find("div")
                  .find("div")
                  .find("span")
                  .text()
                  .replace(/[\n\t\r]/g, ""),
                price: $(this).find("td:nth-of-type(2)").text(),
                percent: $(this).find("td:nth-of-type(3)").text(),
              }
              if (List[i].percent !== "0.00%" && List[i].percent[0] !== "-") {
                List[i].percent = "+" + List[i].percent
              }
            })
            const data = List.filter((n) => n.title) // 같이 바꾸기
            // console.log(data)
            const jsonData = JSON.stringify(data)
            jsonData2 = "{" + '"' + "symbols" + '"' + ":" + jsonData + "}"
            fs.writeFileSync("./symbol.json", jsonData2)
            console.log("JSON created")
            resolve(data)
          } else {
            reject(error)
          }
          // console.log($.text())
        })
      })
    }
  
    // cron.schedule("0 * * * *", symbolCreator)
    async function getSymbol() {
      var data = await symbolCreator()
      // data2 = fs.readFileSync("./symbol.json")
      // parsedData = JSON.stringify(parsedData)
      for (var key in data) {
        // console.log(data[key].title)
        var symbol = data[key].title
        // console.log(symbol)
        url = new Array()
        url[
          key
        ] = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`
        console.log(url[key])  
        }   
    }
    getSymbol();
});

module.exports = router;
