var myCal = CalendarApp.getCalendarById('2bbrgmp32lggq3fj60vfhf12l0@group.calendar.google.com');//カレンダーを取得
var spSheet = SpreadsheetApp.openById('1LkmanpvxwnYZxbVqRj5sFf9MoB6SXbWMjX_oSLTEv6s');//スプレッドシートを取得

/*各シートを取得*/
var Sche = spSheet.getSheetByName("Schedule"); 
var classSche = spSheet.getSheetByName("classSche");
var EvtSheet = spSheet.getSheetByName("EvtSheet");

var postUrl = "https://hooks.slack.com/services/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";  //slackのWebhook URL
var postChannel = "#workplace";  //ポストするスラックのチャンネル
var username = "教えてくれるパンダ";  //slackでリマインドするbotの表示名

//sheet2の時間割をカレンダーに反映したい！
function checkAndWriteCalender() {
  }

//カレンダー上の稽古日程をシートに保存したい！
function saveEventCalenderToSheet(){
  EvtSheet.getRange('2:100').clear();//実行の都度、初期化をする
  var dat = EvtSheet.getDataRange().getValues();//シートのデータを配列に取得  
  var today = new Date();//今日の日付  
  var endDate = new Date();
  endDate.setDate(endDate.getDate()+7);//1週間後までの予定を転記することにしました
  
  var Evts = myCal.getEvents(today, endDate);
  var i=1;
  for each(var evt in Evts){
    var sTime = evt.getStartTime();//開始時間をDate型で取得
    var fTime = evt.getEndTime();//終了時間をDate型で取得
    dat[i] = new Array();
    dat[i][0]=evt.getId(); //イベントIDを出力
    dat[i][1]=evt.getTitle();//イベントタイトルを出力
    dat[i][2]=sTime.getFullYear() + "/" + (sTime.getMonth()+1) + "/" + sTime.getDate();//開始日を出力
    dat[i][3]=sTime.getDay();//開始日の曜日を出力 note:0が日曜日
    dat[i][4]=sTime.getHours() + ":" + sTime.getMinutes() + ":" + sTime.getSeconds();//開始時間を出力
    dat[i][5]=fTime.getFullYear() + "/" + (fTime.getMonth()+1) + "/" + fTime.getDate();//終了日時を出力
    dat[i][6]=fTime.getDay();//終了日の曜日を出力
    dat[i][7]=fTime.getHours() + ":" + fTime.getMinutes() + ":" + fTime.getSeconds();//終了時間を出力
    dat[i][8]=evt.getLocation();//場所を出力
    dat[i][9]=evt.getDescription();//説明を取得
    i++;
  }
  EvtSheet.getRange(1,1,i,10).setValues(dat);  
}

//稽古日程をslackにmentionしたい！
function slackMentionByEvtSheet(){
  var dat = EvtSheet.getDataRange().getValues();//シートのデータを配列に取得
  var today = new Date();//今日の日付
  
  for(i=1;i<dat.length;i++){
    var sDate = new Date(dat[i][2]);//シート上の日付を取得
    if(sDate.getMonth() == today.getMonth() && sDate.getDate() == today.getDate()+1){//日付が次の日ならば実行
      if(dat[i][1]=='稽古'){//イベントタイトルが「稽古」なら実行
        var sTime = new Date(dat[i][4]);//シート上の稽古開始時間を取得
        var fTime = new Date(dat[i][7]);//シート上の稽古終了時間を取得
        
        var sMinutes = (sTime.getMinutes());
        var fMinutes = (fTime.getMinutes());
        if(sMinutes < 10){sMinutes = "0" + sMinutes;}//一桁なら頭に0をつける
        if(fMinutes < 10){fMinutes = "0" + fMinutes;}
        
        var dayInJP = [ "日", "月", "火", "水", "木", "金", "土" ][dat[i][3]];
        
        var message =("こんにちは！次の稽古は明日" 
                     + (sDate.getMonth()+1) + "月"
                     + sDate.getDate() + "日(" + dayInJP + ")の"
                     + sTime.getHours() + ":" + sMinutes +"～"
                     + fTime.getHours() + ":" + fMinutes +"で、場所は"
                     + dat[i][8] + "です！よろしく！"
                     + "\n備考：" + dat[i][9] );                   
        Logger.log(message);
      //  var message ="ごめんね";
      //  sendHttpPost(message,username);
      }
    }
  }
}


//messageを生成
function generateMessage(dat){

}

//slackにポストする関数
function sendHttpPost(message,username){
  var jsonData = 
      {
        "cahnnel" : postChannel,       
        "username" : username,       
        "text" : message                       
      };
  var payload = JSON.stringify(jsonData);
  var options = 
      {
        "method" : "post",
        "contentType" : "application/json",
        "payload" : payload
      };
  UrlFetchApp.fetch(postUrl,options);
}