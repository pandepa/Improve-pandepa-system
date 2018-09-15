//いくつかの定数と基礎的なメソッドを記述するファイル


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
var WhoIsAbsentTomorrow = spSheet.getSheetByName("WhoIsAbsentTomorrow");
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


//メソッド
function formDate(date) {//Utilities.formatDate(date, timeZone, format)はDate型をフォーマットされた文字列に変換
  return Utilities.formatDate(date, "JST", "M月dd日");
}

function formTime(date) {//Utilities.formatDate(date, timeZone, format)はDate型をフォーマットされた文字列に変換
  return Utilities.formatDate(date, "JST", "HH:mm");
}

function zeroPadding(num,length){//numがlengthの長さになるように頭に0を入れる関数 「0埋め js」とかでググろう
    return ('0000000000' + num).slice(-length);
}

