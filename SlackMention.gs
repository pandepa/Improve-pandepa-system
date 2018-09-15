//稽古日程をslackにmentionしたい！
//稽古日程と日付を比較し、実行
function slackMentionByEvtSheet() {
    saveCalenderToSheet("Event");
    var dat = Event.getDataRange().getValues();//イベントシートのデータを配列に取得
    var tomorrow = new Date()
    tomorrow.setDate(new Date().getDate()+1);//明日の日付
    for (i = 1; i < dat.length; i++) {
        var sDate = new Date(dat[i][2]);//シート上の日付を取得 
        var envelope = new Envelope;
        if (sDate.getDate() == tomorrow.getDate()) {//日付が次の日ならば実行
              if(dat[i][1] == "稽古") envelope.message = genAbsentMessage(dat,i);//イベントタイトルが「稽古」なら実行
              if(dat[i][1] == "スタッフ会議")　envelope.message = genBasisMessage(dat,i);
              }          
      if (envelope.message) sendHttpPost(envelope);
    }
}        

// messageの基礎部分を作る
function genBasisMessage(dat,i){
  var dayInJP = ["日", "月", "火", "水", "木", "金", "土"][dat[i][3]];
  
  var message =("こんにちは！明日"+ formDate(new Date(dat[i][2])) + "(" + dayInJP +")の" + dat[i][1] + "は" + 
                 formTime(new Date(dat[i][4])) + "〜" + formTime(new Date(dat[i][7])) +
                 "で、場所は" + dat[i][8] +"です！よろしく！");
 
  if(dat[i][9]) message += "\n備考："+ dat[i][9]; 
  return message;
}

//messageの欠席者連絡部分を作り、基礎部分を呼んで結合
function genAbsentMessage(dat,i) {
    saveCalenderToSheet("Actor");
    WhoIsAbsent(dat, i);
    var absDat = WhoIsAbsentTomorrow.getDataRange().getValues();//翌日の稽古欠席者まとめシートのデータを配列に取得
   
   if(absDat.length > 1){         
        var absMessage = "";             
         for(var j = 1;j < absDat.length;j++){  
           absSTime = absDat[j][1];
           absFTime = absDat[j][2];
           
           if(absSTime != "稽古開始") var absSTime = formTime(new Date(absDat[j][1]));
           if(absFTime != "稽古終了") var absFTime = formTime(new Date(absDat[j][2]));
           absMessage += (absDat[j][0] + "さんは" + absSTime + "～" + absFTime + "まで\n");
         } 
     var message = (genBasisMessage(dat,i) + '\n' + "また、" + absMessage +"欠席です！よろしく！")    
     }else{
       var message = (genBasisMessage(dat,i) + "よろしく！");
    }
  return message;
}

//slackにポストする関数
function sendHttpPost(Envelope) {
    var jsonData =
        {
            "channel": Envelope.channel,
            "username": Envelope.username,
            "text": Envelope.message,
            "icon_url": "https://slack.com/img/icons/panda.jpg"
        };
    var payload = JSON.stringify(jsonData);
    var options =
        {
            "method": "post",
            "contentType": "application/json",
            "payload": payload
        };
    UrlFetchApp.fetch(Envelope.url, options);
}

