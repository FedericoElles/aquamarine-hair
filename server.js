// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var schulen_de = require('./schulen_de.json');
var addressen_dir = require('./adressen.json');
var BASE_URL = 'http://www.waldorfschule.de/organisation/schulen/schulprofil/?tx_stellen_pi10%5Bschule%5D=';
var ID_START = 401;


var unxml = {
 '&#xE4;': 'ä',
 '&#xFC;': 'ü',
 '&#xF6;': 'ö',
 '&#xDC;': 'Ü',
 '&#xDF;': 'ß'
};

function fixXMLChars(str) {
  var re = new RegExp(Object.keys(unxml).join("|"),"gi");
  str = str.replace(re, function(matched){
    return unxml[matched];
  });
  return str;
}



// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
//app.use(express.static('public'));

function extractData(html, debug, id){
  debug = debug || false;
  var r = '';
  var json = {};
  
  id ? json.id=id : undefined;
  var parts, part;
  
  var $ = cheerio.load(html);
  $profil = $('.schulprofil');
  
  if ($profil.length === 0){
    return {error: true, reason: 'id invalid'};
  }
  
  json.name = $profil.find('h2').text();
  json.website = $profil.find('.schule_link').attr('href');
  
  
  $profil.find('p').each(function(i, elem) {
    if (i===0){
      json.address = $(this).html().replace('<br>',', ');
      json.address = fixXMLChars(json.address);
    } else {
      parts = $(this).html().split('<br>');
      parts.forEach(function(elem){
        part = elem.split(':');
        if (part.length === 2 && elem[0] !== '<'){
          json[part[0]] = part[1].trim();
        }
      });
      
    }
  });
  
  $profil.find('li').each(function(i, elem) {
    part = $(this).text().split(':');
    if (part.length === 2 && elem[0] !== '<'){
      json[part[0]] = part[1].trim();
    }
  });
  
  r = $profil.html() + '<pre>' + JSON.stringify(json, undefined, 2) + '</pre>';
  
  return debug ? r : json;
}



app.get("/", function (req, res) {
  var id = req.query.id || ID_START;
  
  request.get(BASE_URL + id, {
    
  },function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //res.send(JSON.stringify(response.request.uri.href));
      res.send(extractData(body, true)); // Show the HTML for the Google homepage.
    } else {
      res.send(error);
    }
    });  
});

var IDS = [
107,103,108,101,104,105,102,106,110,
206,203,204,207,205,202,201,209,251,222,253,208,259,257,258,255,256,254,260,252,261,262,
307,304,306,318,303,301,323,324,310,302,327,313,325,305,319,328,312,316,320,321,317,309,308,331,326,314,315,311,330,322,329,
407,416,405,423,427,406,414,435,403,419,421,411,430,410,422,438,424,445,415,418,402,437,432,413,440,439,425,408,409,429,426,420,404,443,434,442,412,431,433,417,447,446,401,428,441,436,444,
501,503,506,502,505,508,504,507,
604,605,610,609,601,606,602,608,603,611,653,654,612,655,607,651,652,
715,724,707,719,720,728,717,730,708,711,704,701,725,731,703,723,733,735,706,705,712,709,716,721,741,714,713,737,727,743,742,722,726,702,732,752,718,745,750,710,734,753,748,729,738,757,736,740,749,756,754,746,758,755,739,751,747,744,
815,811,807,859,805,806,809,804,810,822,802,858,817,824,803,823,814,812,874,818,819,820,813,851,801,867,855,870,816,862,853,808,856,864,857,863,854,871,866,877,869,861,852,873,872,876,860,821,868,865,
910,926,906,928,903,904,905,922,909,902,925,923,927,908,907,955,921,931,901,960,967,972,961,963,977,979,924,965,973,978,993,995,957,997,964,929,956,974,953,958,969,975,971,952,962,966,970,980,981,930,954,982,968,959,999,992,996,998,
1008,1017,1001,1013,1023,1020,1016,1018,1015,1019,1006,1009,1007,1022,1011,1012,1050,1004,1002,1021,1010,1005,1014,1024,1003,
1128,1106,1120,1101,1124,1102,1119,1136,1111,1118,1103,1132,1129,1131,1112,1105,1107,1109,1122,1126,1138,1104,1108,1113,1114,1125,1134,1135,1110,1127,1133,1139,1130,1117,1123,1137,1116,112,
1214,1212,1203,1219,1201,1207,1210,1208,1209,1223,1222,1205,1211,1204,1224,1206,1220,1202,1217,1221,1218,1225,1213,1215,1300,
1301,1311,1304,1317,1330,1333,1305,1314,1312,1327,1322,1319,1309,1328,1320,1325,1343,1308,1306,1336,1303,1335,1315,1307,1326,1323,1310,1318,1334,1302,1331,1321,1340,1338,1342,1332,1337,1324,1313,1316,1339,1329,1300,1341,
1419,1410,1426,1405,1424,1420,1427,1403,1416,1421,1415,1401,1409,1404,1417,1418,1425,1408,1402,1412,1411,1406,1413,1407,1423,1500,
1527,1516,1522,1505,1511,1519,1512,1523,1500,1503,1535,1514,1540,1528,1515,1510,1504,1508,1524,1520,1529,1507,1539,1536,1502,1509,1531,1521,1513,1530,1533,1518,1526,1517,1600,1537,1538,1534,1525,
1600,1602,1605,1603,1604,1601,1700,
1700,1752,1701,1702,1705,1703,1800,1751,1750,
1803,1814,1806,1811,1804,1807,1801,1802,1809,1812,1805,1810,1800,1815,1808,1813
];

var IDS = [
107,103,108,101,104,105,102,106,110,
206,203,204,207,205,202,201,209,251,222,253,208,259,257,258,255,256,254,260,252,261,262,
307,304,306,318,303,301,323,324,310,302,327,313,325,305,319,328,312,316,320,321,317,309,308,331,326,314,315,311,330,322,329,
407,416,405,423,427,406,414,435,403,419,421,411,430,410,422,438,424,445,415,418,402,437,432,413,440,439,425,408,409,429,426,420,404,443,434,442,412,431,433,417,447,446,401,428,441,436,444,
501,503,506,502,505,508,504,507,
604,605,610,609,601,606,602,608,603,611,653,654,612,655,607,651,652,
715,724,707,719,720,728,717,730,708,711,704,701,725,731,703,723,733,735,706,705,712,709,716,721,741,714,713,737,727,743,742,722,726,702,732,752,718,745,750,710,734,753,748,729,738,757,736,740,749,756,754,746,758,755,739,751,747,744,
815,811,807,859,805,806,809,804,810,822,802,858,817,824,803,823,814,812,874,818,819,820,813,851,801,867,855,870,816,862,853,808,856,864,857,863,854,871,866,877,869,861,852,873,872,876,860,821,868,865,
910,926,906,928,903,904,905,922,909,902,925,923,927,908,907,955,921,931,901,960,967,972,961,963,977,979,924,965,973,978,993,995,957,997,964,929,956,974,953,958,969,975,971,952,962,966,970,980,981,930,954,982,968,959,999,992,996,998,
];

// var IDS = [
// 1008,1017,1001,1013,1023,1020,1016,1018,1015,1019,1006,1009,1007,1022,1011,1012,1050,1004,1002,1021,1010,1005,1014,1024,1003,
// 1128,1106,1120,1101,1124,1102,1119,1136,1111,1118,1103,1132,1129,1131,1112,1105,1107,1109,1122,1126,1138,1104,1108,1113,1114,1125,1134,1135,1110,1127,1133,1139,1130,1117,1123,1137,1116,1120,
// ];


app.get("/all", function (req, res) {
  var all = [];
  var total = IDS.length;
  var errors = 0;  
  var iDelay = 0;
  var DELAY = 100;
  async.map(IDS, function(id, callback) {
    setTimeout(function(id){
      
      request.get(BASE_URL + id, function (error, response, body) {
        total--;
        console.log('Processing', id, 'Progress: ', 100 - Math.round(total/IDS.length*100), '%');
        if (!error && response.statusCode == 200) {
          //res.send(JSON.stringify(response.request.uri.href));
          var data = extractData(body, undefined, id);
          if (typeof data.error === 'undefined'){
            all.push(data); 
          } else {
            console.error('Error with id', id, data);
            errors++;
          }
        } else {
          all.push({error: error});
          console.error('Error with id', id, error);
          errors++;
        }
        callback(null, !error);
      });
    }, iDelay+=DELAY, id);  
  }, function() {
    res.send(JSON.stringify(all, undefined, 2));
    console.log('Errors', errors);    
  });    
});


app.get("/ids", function (req, res) {
  var startid = parseInt(req.query.startid, 10) || 0;

  var ids= [];
  var valid = [];
  var countInvalid = 0;
  for (var i = startid, ii = i + 100;i<=ii;i+=1){
    ids.push(i);
  }
  
  async.map(ids, function(id, callback) {
    request.get(BASE_URL + id, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (response.request.uri.href !== "http://www.waldorfschule.de/organisation/schulen/schule-suchen/"){
          valid.push(id);
        } else {
          countInvalid++;
        }
      } else {
        console.log(error);
      }
      callback(null, !error);
    });  
  }, function() {
    res.send(valid.join(',') + '\n\n DONE. Invalid:' + countInvalid);

  });

});

app.get("/schulen", function (req, res) {
  res.send(schulen_de);
});

app.get("/schulen_addressen", function (req, res) {
  var addressen = [];
  schulen_de.forEach(function(schule){
    if (schule.address){
      addressen.push(schule.address);
    } else {
      console.error('Keine Adresse', schule.id, schule.address);
    }
  });
  res.send(addressen.join('\n'));
});

app.get("/schulen_full", function (req, res) {
  var addressen = [];
  schulen_de.forEach(function(schule){
    if (addressen_dir[schule.address]){
      schule.coordinates = addressen_dir[schule.address];
    } else {
      console.error('Keine Adresse geocodiert', schule.id, schule.address);
    }
  });
  res.send(schulen_de);
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});