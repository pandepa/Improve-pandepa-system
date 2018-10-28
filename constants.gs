//いくつかの定数と基礎的な関数を記述するファイル


//カレンダーを取得、名前は「"カレンダーを反映するシート名" + "Cal"」にする
var EventCal = CalendarApp.getCalendarById('9ocjo1bhkote67fd471l6cg8hc@group.calendar.google.com');//イベントカレンダーを取得
var ActorCal = CalendarApp.getCalendarById('b8pd4kib7k4ilcf3atosuhbu5o@group.calendar.google.com');
var BackseatplayerCal = CalendarApp.getCalendarById('7c9gfdvacreauvddo7eujld3do@group.calendar.google.com');


//スプレッドシートを取得
var sheetID = '1YJfJ0vZBOZudS9yJdtYt103MfPa7FFqLjPZPPN3U71A';
var spSheet = SpreadsheetApp.openById(sheetID);

/*各シートを取得*/
var Event = spSheet.getSheetByName("Event");
var Actor = spSheet.getSheetByName("Actor");
var AnswerSheet = spSheet.getSheetByName("Answer"); 
var PracticeSheet = spSheet.getSheetByName("PracticeDay");
var DeadSheet = spSheet.getSheetByName("Dead");
var ConstantsSheet = spSheet.getSheetByName("SystemConstants");


// シート上で定義する定数
var systemDat = ConstantsSheet.getDataRange().getValues();

var postUrl = systemDat[1][0];  //slackのreminder Webhook URL
var postChannel = systemDat[1][1];  //ポストするスラックのチャンネル
var username = systemDat[1][2];  //slackでリマインドするbotの表示名


//SlackにPostする際の設定を内包するパッケージクラス
var Envelope = function(){
  this.message = null;
  this.url = postUrl;
  this.channel = postChannel;
  this.username = username;
}


/* 

関数

*/
function formDate(date) {//Utilities.formatDate(date, timeZone, format)はDate型をフォーマットされた文字列に変換
  return Utilities.formatDate(date, "JST", "M月dd日");
}

function formTime(date) {//Utilities.formatDate(date, timeZone, format)はDate型をフォーマットされた文字列に変換
  return Utilities.formatDate(date, "JST", "HH:mm");
}

function zeroPadding(num,length){//numがlengthの長さになるように頭に0を入れる関数 「0埋め js」とかでググろう
  return ('0000000000' + num).slice(-length);
}

/* 
typeに"Date"などの型名を指定し、objにオブジェクトを渡すと、型が一致ならtrue、不一致ならfalseを返す
例: var now = new Date();
is("String",now)//false
is("Date",now)//true
*/
function is(type, obj) {
  var clas = Object.prototype.toString.call(obj).slice(8, -1);
  return obj !== undefined && obj !== null && clas === type;
}



/* 

オリジナルの関数

*/
function isActor(name){//役者などのSystemConstantsシートE列に登録したメンバーならtrueを返す
  for(var i=1;i<　systemDat.length;i++){
    if(name == systemDat[i][4]) return true;
  }
  return false; 
}

function datesEqual(date1,date2){//日付（月日）が等価ならtrueを返す
  return date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
}

function setSFDate(date,start,finish){//開始時間と終了時間のStringをそれぞれDate型に入れることが多そうなので。2要素の配列に入れて返します
  var sDate = new Date(date);
  var fDate = new Date(date);
  var sTime = new Date(start);
  var fTime = new Date(finish);
  sDate.setHours(sTime.getHours());
  sDate.setMinutes(sTime.getMinutes());     
  fDate.setHours(fTime.getHours());
  fDate.setMinutes(fTime.getMinutes()); 
  
  var array = [sDate,fDate];
  return array;
}

function DebugDelete() {
  var del = new Date(2018,9,22,0,0,0); 
  var events = ActorCal.getEventsForDay(del);
  Logger.log(del);
  for(var n=0; n<events.length; n++){
    if(events[n].getTitle() == "name"){
      Logger.log(events[n].getTitle());
      events[n].deleteEvent()
    }
  }
}