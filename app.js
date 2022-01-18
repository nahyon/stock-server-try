//패키지들 가져오기 
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config();  

//라우터들 (우리가 만들 부분)-------------------------------------------
const indexRouter = require('./routes/index');
const storeRouter = require('./routes/store');
const getRouter = require('./routes/getdata');
const tempRouter = require('./routes/deuk');


//express 불러오기
const app = express();
//port설정 
app.set('port', process.env.PORT || '3000'); 
//템플릿앤진 (중 nunjucks) 설정
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

//미들웨어들
app.use(morgan('dev'));
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

//만든 라우터 연결함-------------------------------------------
app.use('/', indexRouter);
app.use('/store', storeRouter);
app.use('/get', getRouter);
app.use('/temp', tempRouter);

//모든 라우터 뒤에 나오는 애 = 404처리 미들웨어 (에러처리라우터 ㄴㄴ)
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

//에러 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

//listen
app.listen(app.get('port'), () => { //port에서 대기
  console.log(app.get('port'), '번 포트에서 대기중');
});


module.exports = app;