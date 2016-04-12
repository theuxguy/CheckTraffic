
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  ,session=require('client-sessions');

var app = express();

var mysql,connection;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	  cookieName: 'session',
	  secret: 'junipertest',
	  duration: 30 * 60 * 1000,
	  activeDuration: 5 * 60 * 1000,
	}));


app.get('/', function(req, res) {
	 res.sendfile(__dirname + "/views/index.html"); 
	});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

mysql      = require('mysql');
connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'adiboy',
  database : 'juniper',
});

connection.connect(function(err) {
  console.log('Connected!');
});
  

app.use(express.bodyParser());

app.post('/', function(req, res){

   var src=req.body.src;
   var dest=req.body.dest;
   var day1=req.body.day1;
   var month1=req.body.month1;
   var year1=req.body.year1;
   var day2=req.body.day2;
   var month2=req.body.month2;
   var year2=req.body.year2;
   var minb=req.body.minbytes;
   var maxb=req.body.maxbytes;
   var minp=req.body.minpcks;
   var maxp=req.body.maxpcks;
   var flag=false;
   
   var query='select * from traffic_check where ';
   
   if(src.trim()!==""){
           query+=' srcip like "%'+src.trim()+'"';
           flag=true;
   }
   if(dest.trim()!==""){
	   if(flag)
	   query+=' and destip like "%'+dest.trim()+'"';
	   else{
		   query+=' destip like "%'+dest.trim()+'"';
		   flag=true;
	   }
   }
	
 /*  if(day1.trim()!=="" && month1.trim()!=="" && year1.trim()!=="" && day2.trim()!=="" && month2.trim()!=="" && year2.trim()!=="" ){
		var datefrom = new Date(year1+'-'+month1+'-'+day1+' 00:00:00'.split(' ').join('T'));
	    datefrom=datefrom.getTime()/1000;
	
	    var dateto = new Date(year2+'-'+month2+'-'+day2+' 00:00:00'.split(' ').join('T'));
        dateto=dateto.getTime()/1000;
	    
	    if(flag)
	    query+=' and '

		query+=' timestamp between '+dateto+' and '+datefrom;
	}*/
	
	if (flag){
		query+=' and ';
	}
	
      query+=' sum_bytes_kb between '+minb+' and '+maxb+' and sum_packets between '+minp+' and '+maxp+' order by timestamp desc limit 50';
     console.log(query);
     
     connection.query(query,function(err,rows){
    	  if(err) {throw err;}

    	  console.log('Data received from Db:\n');
    	  console.log(rows);
    	  res.contentType('json');
          res.send(rows);
    	});
});