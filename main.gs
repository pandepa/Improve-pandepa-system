//稽古日程をslackにmentionしたい！
//稽古日程と日付を比較し実行
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
