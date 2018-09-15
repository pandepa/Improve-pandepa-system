/*進捗メモ
whoIsAbsent以外のSlackMention.gsの関数を整理した。一部は未テスト状態だが、WhoIsAbsentが理解できないとどうしようもなさそう
zeroPaddingは導入したのにUtilities.formatDateに全ての株を奪われた

テスト上では動く
Cal_Sheetなるクラスを作ったが、さほど効果的ではなさそう
それとは別でシートを宣言しちゃってるしなあ
Stringっていうか文字列を関数名にできないかな？
name = Actor;
hoge = function{
this.cal = name + Cal;
}
これ自体は無理そうだけど、これに準ずることをしたい
*/

//カレンダーを取得
var ActorCal = CalendarApp.getCalendarById('2bbrgmp32lggq3fj60vfhf12l0@group.calendar.google.com');//イベントカレンダーを取得
var BackseatplayerCal = CalendarApp.getCalendarById('2bbrgmp32lggq3fj60vfhf12l0@group.calendar.google.com');
var PracticeCal = CalendarApp.getCalendarById('2bbrgmp32lggq3fj60vfhf12l0@group.calendar.google.com');

//スプレッドシートを取得
var sheetID = '1URhwe8dU0s-93rbdmsABDdkB3qePmEyHxNWlKIZJbLU';
var spSheet = SpreadsheetApp.openById(sheetID);

/*各シートを取得*/
var Sche = spSheet.getSheetByName("Schedule");
var classSche = spSheet.getSheetByName("classSche");
var Practice = spSheet.getSheetByName("Practice");
var Actor = spSheet.getSheetByName("Actor");
var WhoIsAbsentTomorrow = spSheet.getSheetByName("WhoIsAbsentTomorrow");
var AnswerSheet = spSheet.getSheetByName("Answer"); //シートを取得
var PracticeSheet = spSheet.getSheetByName("PracticeDay");

var postUrl = "https://hooks.slack.com/services/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";  //slackのreminder Webhook URL
var postChannel = "#knkprivate";  //ポストするスラックのチャンネル
var username = "教えてくれるパンダ";  //slackでリマインドするbotの表示名



var Cal_Sheet = function (name){
  this.name = name;
  this.sheet = SpreadsheetApp.openById(sheetID).getSheetByName(name);
  if (name == "Practice") this.cal = PracticeCal; 
  else if (name == "Actor") this.cal = ActorCal; 
  else this.cal = null;
  Logger.log(name);
  Logger.log(this.sheet);
}


function formDate(date) {//Utilities.formatDate(date, timeZone, format)はDate型をフォーマットされた文字列に変換
  return Utilities.formatDate(date, "JST", "M月dd日");
}

function formTime(date) {//Utilities.formatDate(date, timeZone, format)はDate型をフォーマットされた文字列に変換
  return Utilities.formatDate(date, "JST", "HH:mm");
}

function zeroPadding(num,length){//numがlengthの長さになるように頭に0を入れる関数 「0埋め js」とかでググろう
    return ('0000000000' + num).slice(-length);
}

//稽古日程をslackにmentionしたい！
//稽古日程と日付を比較し、実行します
function slackMentionByEvtSheet() {
    saveCalenderToSheet(new Cal_Sheet("Practice"));
    var dat = Practice.getDataRange().getValues();//イベントシートのデータを配列に取得
    var tomorrow = new Date()
    tomorrow.setDate(new Date().getDate()+1);//明日の日付
    for (i = 1; i < dat.length; i++) {
        var sDate = new Date(dat[i][2]);//シート上の日付を取得      
        if (sDate.getDate() == tomorrow.getDate()) {//日付が次の日ならば実行
              if(dat[i][1] == "稽古") var message = genAbsentMessage(dat,i);//イベントタイトルが「稽古」なら実行
              if(dat[i][1] == "スタッフ会議")　var message = genBasisMessage(dat,i);
              }          
      //  var message ="ごめんね";
      Logger.log(message);
      sendHttpPost(message,username,postUrl);
    }
}        

// messageの基礎部分を作ります
function genBasisMessage(dat,i){
  var dayInJP = ["日", "月", "火", "水", "木", "金", "土"][dat[i][3]];
  var sTime = new Date(dat[i][1]);
  var fTime = new Date(dat[i][2]);
  
  var message =("こんにちは！明日"+ formDate(new Date(dat[i][2])) +"("+ dayInJP +")の"+ dat[i][1] +"は"+ 
                 formTime(sTime) +"〜"+ formTime(fTime) +"で、場所は"+ dat[i][8] +"です！よろしく！");
 
  if(dat[i][9]) message += "\n備考："+ dat[i][9]; 
  return message;
}

//messageの欠席者連絡部分を作ります
function genAbsentMessage(dat,i) {
    saveCalenderToSheet(new Cal_Sheet("Actor"));
    WhoIsAbsent(dat, i);
    var absDat = WhoIsAbsentTomorrow.getDataRange().getValues();//翌日の稽古欠席者まとめシートのデータを配列に取得
   
   if(absDat.length > 1){         
        var absMessage = "";             
         for(var j = 1;j < absDat.length - 1; j++){  
           var absSTime = new Date(absDat[j][1]);
           var absFTime = new Date(absDat[j][2]);

           if(absSTime != "稽古開始") absSTime = formTime(absSTime);
           if(absFTime != "稽古終了") absFTime = formTime(absFTime);
           absMessage += (absDat[x][0] + "さんは" + absSTime + "～" + absFTime + "まで\n");
           Logger.log(absMessage);
         } 
     var message = (genBasisMessage(dat,i) + '\n' + "また、" + absMessage +"欠席です！よろしく！")    
     }else{
       var message = (genBasisMessage(dat,i) + "よろしく！");
    }
  return message;
}

function saveCalenderToSheet(Cal_Sheet) {
    Cal_Sheet.sheet.getRange('2:100').clear();//実行の都度、初期化をする
    var dat = Cal_Sheet.sheet.getDataRange().getValues();//シートのデータを配列に取得  
    var today = new Date();//今日の日付  
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);//1週間後までの予定を転記することにしました

    var Evts = Cal_Sheet.cal.getEvents(today, endDate);
    var i = 1;
    for each(var evt in Evts){
        var sTime = evt.getStartTime();//開始時間をDate型で取得
        var fTime = evt.getEndTime();//終了時間をDate型で取得
        dat[i] = new Array();
        dat[i][0] = evt.getId(); //イベントIDを出力
        dat[i][1] = evt.getTitle();//イベントタイトルを出力
        dat[i][2] = sTime.getFullYear() + "/" + (sTime.getMonth() + 1) + "/" + sTime.getDate();//開始日を出力
        dat[i][3] = sTime.getDay();//開始日の曜日を出力 note:0が日曜日
        dat[i][4] = sTime.getHours() + ":" + sTime.getMinutes() + ":" + sTime.getSeconds();//開始時間を出力
        dat[i][5] = fTime.getFullYear() + "/" + (fTime.getMonth() + 1) + "/" + fTime.getDate();//終了日時を出力
        dat[i][6] = fTime.getDay();//終了日の曜日を出力
        dat[i][7] = fTime.getHours() + ":" + fTime.getMinutes() + ":" + fTime.getSeconds();//終了時間を出力
        dat[i][8] = evt.getLocation();//場所を出力
        dat[i][9] = evt.getDescription();//説明を取得
        i++;
    }
    Cal_Sheet.sheet.getRange(1, 1, i, 10).setValues(dat);
}
