var ActorCal = CalendarApp.getCalendarById('b8pd4kib7k4ilcf3atosuhbu5o@group.calendar.google.com');//イベントカレンダーを取得
var BackseatplayerCal = CalendarApp.getCalendarById('7c9gfdvacreauvddo7eujld3do@group.calendar.google.com');
var PracticeCal = CalendarApp.getCalendarById('9ocjo1bhkote67fd471l6cg8hc@group.calendar.google.com');
var spSheet = SpreadsheetApp.openById('1YJfJ0vZBOZudS9yJdtYt103MfPa7FFqLjPZPPN3U71A');//スプレッドシートを取得


/*各シートを取得*/
var Sche = spSheet.getSheetByName("Schedule");
var classSche = spSheet.getSheetByName("classSche");
var EvtSheet = spSheet.getSheetByName("EvtSheet");
var ActorSche = spSheet.getSheetByName("ActorSche");
var WhoIsAbsentTomorrow = spSheet.getSheetByName("WhoIsAbsentTomorrow");
var AnswerSheet = spSheet.getSheetByName("Answer"); //シートを取得
var PracticeSheet = spSheet.getSheetByName("PracticeDay");
var DeadSheet = spSheet.getSheetByName("Dead"); //シートを取得

var postUrlA = "https://hooks.slack.com/services/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";  //slackのreminder Webhook URL
var postUrlB = "https://hooks.slack.com/services/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";  //slavkの通知チーム　Webhooks
var postChannel = "#reminder";  //ポストするスラックのチャンネル
var username = "教えてくれるパンダ";  //slackでリマインドするbotの表示名


//sheet2の時間割をカレンダーに反映したい！
function checkAndWriteCalender() {
}

//カレンダー上の稽古日程をシートに保存したい！
function saveEventCalenderToSheet() {
    EvtSheet.getRange('2:100').clear();//実行の都度、初期化をする
    var dat = EvtSheet.getDataRange().getValues();//シートのデータを配列に取得  
    var today = new Date();//今日の日付  
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);//1週間後までの予定を転記することにしました

    var Evts = PracticeCal.getEvents(today, endDate);
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
    EvtSheet.getRange(1, 1, i, 10).setValues(dat);
}

//稽古日程をslackにmentionしたい！
function slackMentionByEvtSheet() {
    saveEventCalenderToSheet();
    var dat = EvtSheet.getDataRange().getValues();//イベントシートのデータを配列に取得
    var today = new Date();//今日の日付
    for (i = 1; i < dat.length; i++) {
        var sDate = new Date(dat[i][2]);//シート上の日付を取得
        if (sDate.getMonth() == today.getMonth() && sDate.getDate() == today.getDate() + 1) {//日付が次の日ならば実行
            if (dat[i][1] == '稽古' || dat[i][1] == 'スタッフ会議') {//イベントタイトルが「稽古」なら実行
              if(dat[i][1] == '稽古'){
                var message = generateMessage(dat, i,sDate,"稽古");
              }else{
                var message = generateMessage(dat, i,sDate,"スタ会");
              }
                //  var message ="ごめんね";
              Logger.log(message);
              sendHttpPost(message,username,postUrlA);
            
            }
        }
    }
}


//messageを生成
function generateMessage(dat, i,sDate,what) {
  var sTime = new Date(dat[i][4]);//シート上の稽古開始時間を取得
  var fTime = new Date(dat[i][7]);//シート上の稽古終了時間を取得
  var sMinutes = (sTime.getMinutes());
  var fMinutes = (fTime.getMinutes());
  if (sMinutes < 10) { sMinutes = "0" + sMinutes; }//一桁なら頭に0をつける
  if (fMinutes < 10) { fMinutes = "0" + fMinutes; }

  var dayInJP = ["日", "月", "火", "水", "木", "金", "土"][dat[i][3]];
    /* 指定月のカレンダーからイベントを取得する */
  if(what == "稽古"){
    savePrivateCalendarToSheet();
    WhoIsAbsent(dat, i);
    var tomorabs = WhoIsAbsentTomorrow.getDataRange().getValues();//翌日の稽古欠席者まとめシートのデータを配列に取得
    var constmessage =  ("こんにちは！次の"+dat[i][1]+"は明日" + (sDate.getMonth() + 1) + "月"
                        + sDate.getDate() + "日(" + dayInJP + ")の"
                        + sTime.getHours() + ":" + sMinutes + "～"
                        + fTime.getHours() + ":" + fMinutes + "で、場所は"
                        + dat[i][8] + "です！");
    if(tomorabs.length != 1){ 
         var absmessage = " ";
         for(var x = 0;x < tomorabs.length-1; x++){
            var absSTime = tomorabs[x+1][1];
            var absFTime = tomorabs[x+1][2];
            if(absSTime != "稽古開始"){
               var absSMinutes = (absSTime.getMinutes());
            }
            if(absFTime != "稽古終了"){
               var absFMinutes = (absFTime.getMinutes());
            }
            if (absSMinutes< 10 ){ absSMinutes = "0" + absSMinutes; }//一桁なら頭に0をつける
            if (absFMinutes < 10 ) { absFMinutes = "0" + absFMinutes; }
            if(absSTime == "稽古開始" && absFTime != "稽古終了" ){
               absmessage += ( tomorabs[x+1][0] + "さんは"　+ absSTime +  "～"　+ absFTime.getHours() + ":"+ absFMinutes +"まで");
            }else if(absSTime != "稽古開始" && absFTime == "稽古終了"){
               absmessage += ( tomorabs[x+1][0] + "さんは"　+ absSTime.getHours() + ":" + absSMinutes
               + "～"　+ absFTime +"まで");
            }else if(absSTime == "稽古開始" && absFTime == "稽古終了"){
               absmessage += ( tomorabs[x+1][0] + "さんは"　+ absSTime + "～" + absFTime +"まで");
            }else{
               absmessage += ( tomorabs[x+1][0] + "さんは"　+ absSTime.getHours() + ":" + absSMinutes
               + "～"　+ absFTime.getHours() + ":"+ absFMinutes +"まで");
            }
            Logger.log(x + 2);
            Logger.log(tomorabs.length);
            if(x + 2!= tomorabs.length){
               absmessage = absmessage + '\n';
            }
         }
         var message = (constmessage + '\n' + "また、" + absmessage +"欠席です！よろしく！"
         + "\n備考：" + dat[i][9]);
    }else{
         var message = (constmessage + "よろしく！"
         + "\n備考：" + dat[i][9]);
    }
  }else{
    var message = ("明日はスタッフ会議をやります。時間は"+ sTime.getHours() + ":" + sMinutes + "～"
                        + fTime.getHours() + ":" + fMinutes + "で、場所は"
                        + dat[i][8] + "です！よろしく！");
  }
  return message;
}

//slackにポストする関数
function sendHttpPost(message, username,postUrl) {
    var jsonData =
        {
            "channel": postChannel,
            "username": username,
            "text": message,
            "icon_url": "https://slack.com/img/icons/panda.jpg"
        };
    var payload = JSON.stringify(jsonData);
    var options =
        {
            "method": "post",
            "contentType": "application/json",
            "payload": payload
        };
   UrlFetchApp.fetch(postUrl, options);
}

//欠席関連の管理。個人カレンダーの内容をシートに反映
function savePrivateCalendarToSheet() {　　　　　　 //欠席・遅刻・早退の管理
    ActorSche.getRange('2:100').clear();　　　　　//実行の都度、初期化をする
    var absent = ActorSche.getDataRange().getValues();　　//シートのデータを配列に取得  
    var today = new Date();//今日の日付  
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);　　　//1週間後までの予定を転記することにしました

    var Abs = ActorCal.getEvents(today, endDate);　 //プライベートカレンダーのイベントを取得

    /* 対象の人数だけ繰り返してログ出力 */
    var i = 1;
    for each(var evt in Abs){
        var asTime = evt.getStartTime();  //欠席開始時間をDate型で取得
        var afTime = evt.getEndTime();    //欠席終了時間をDate型で取得
        absent[i] = new Array();
        absent[i][0] = evt.getId();       //イベントIDを出力
        absent[i][1] = evt.getTitle();    //欠席者の名前を出力
        absent[i][2] = asTime.getFullYear() + "/" + (asTime.getMonth() + 1) + "/" + asTime.getDate();   //開始日を出力
        absent[i][3] = asTime.getDay();   //開始日の曜日を出力 note:0が日曜日
        absent[i][4] = asTime.getHours() + ":" + asTime.getMinutes() + ":" + asTime.getSeconds();       //欠席開始時間を出力
        absent[i][5] = afTime.getFullYear() + "/" + (afTime.getMonth() + 1) + "/" + afTime.getDate();   //欠席終了日時を出力
        absent[i][6] = afTime.getDay();   //終了日の曜日を出力
        absent[i][7] = afTime.getHours() + ":" + afTime.getMinutes() + ":" + afTime.getSeconds();      //終了時間を出力
        i++;
    }
    ActorSche.getRange(1, 1, i, 8).setValues(absent);
}
// 稽古日程と個人の欠席の判定
function WhoIsAbsent(dat, i) {
    WhoIsAbsentTomorrow.getRange('2:100').clear();　　　　　//実行の都度、初期化をする
    var absent = ActorSche.getDataRange().getValues();//個人シートのデータを配列に取得
    var nextPracticeDay = new Date(); 
    nextPracticeDay.setDate(nextPracticeDay.getDate() + 1);  //（＊前の関数より明日が稽古である前提）24時間後の日付を取得
  
    var sTime = new Date(dat[i][4]);//(再定義)シート上の稽古開始時間を取得
    var fTime = new Date(dat[i][7]);//（再定義）シート上の稽古終了時間を取得
    var j;
    var howManyPeople = absent.length;
    var counter = 0;
    var tommorabs = [];
    for(j = 0; j < howManyPeople;j++){
        var asTime = new Date(absent[j][4]);// (再定義)シート上の欠席開始時間を取得
        var afTime = new Date(absent[j][7]);//（再定義）シート上の欠席稽古終了時間を取得
        var absDay = new Date(absent[j][2]);// 欠席日を取得
      
        if (nextPracticeDay.getDate() == absDay.getDate()) {     //稽古時間と欠席時間の被りの判定
          
          if (sTime.getTime() < asTime.getTime() && fTime.getTime() > asTime.getTime()) {  //稽古開始後から稽古終了までの間に欠席開始
                if (fTime.getTime() > afTime.getTime()) {　　//稽古開始後から欠席して稽古終了前に戻ってくる場合
                    tommorabs[counter] = [];
                    tommorabs[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　tommorabs[counter][1] = asTime;　　　　　//
                    tommorabs[counter][2] = afTime;        //
                    counter++;
                } else {　　　//稽古開始後から欠席して稽古終了まで戻らない場合
                    tommorabs[counter] = [];
　　　　　　　　　　　　tommorabs[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　tommorabs[counter][1] = asTime;　　　　　//
                    tommorabs[counter][2] = "稽古終了";        //
                    counter++;
                }
          }else if (sTime.getTime() != asTime.getTime() && fTime.getTime() == afTime.getTime()) {  //稽古終了と同時に欠席終了
                if (sTime.getTime() > asTime.getTime()) {　　//稽古開始が欠席開始よりあとの場合
                    tommorabs[counter] = [];
                    tommorabs[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　tommorabs[counter][1] = "稽古開始";　　　　　//
                    tommorabs[counter][2] = afTime;        //
                    counter++;
                } else {　　　//欠席開始が稽古開始より欠席終了の方が後の場合
                    tommorabs[counter] = [];
　　　　　　　　　　　　tommorabs[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　tommorabs[counter][1] = "稽古開始";　　　　　//
                    tommorabs[counter][2] = "稽古終了";        //
                    counter++;
                }
          }else if (sTime.getTime() == asTime.getTime() ) {  //稽古開始と同時に欠席開始
                if (fTime.getTime() > afTime.getTime()) {　　//結局、遅刻する場合
                    tommorabs[counter] = [];
                    tommorabs[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　tommorabs[counter][1] = "稽古開始";　　　　　//
                    tommorabs[counter][2] = afTime;       //
                    counter++;
                } else {　　　//結局、欠席する場合
                    tommorabs[counter] = [];
　　　　　　　　　　　　tommorabs[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　tommorabs[counter][1] = "稽古開始";　　　　　//
                    tommorabs[counter][2] = "稽古終了";        //
                    counter++;
                }
          } else if (sTime.getTime() > asTime.getTime() && sTime.getTime() < afTime.getTime()) {  //欠席あるいは遅刻する場合
                if (fTime.getTime() > afTime.getTime()) {    //遅刻する場合
                    tommorabs[counter] = [];
　　　　　　　　　　　　tommorabs[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　tommorabs[counter][1] = "稽古開始"; 
                    tommorabs[counter][2] = afTime;        //
                    counter++;
                } else {　　　//欠席する場合
                    tommorabs[counter] = [];
　　　　　　　　　　　　tommorabs[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　tommorabs[counter][1] = "稽古開始";       
                    tommorabs[counter][2] = "稽古終了";        //
                    counter++;
                }
          } else if (asTime.getTime() == afTime.getTime()){
                tommorabs[counter] = [];
                tommorabs[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　 　tommorabs[counter][1] = "稽古開始";       
                tommorabs[counter][2] = "稽古終了";        //
                counter++;
          } else if (fTime.getTime() < asTime.getTime() || sTime.getTime() > afTime.getTime()) { //稽古時間外の欠席
                continue;
          }
        }
    }
    if(counter !=0){
        WhoIsAbsentTomorrow.getRange(2, 1, counter, 3).setValues(tommorabs);
    }
} 