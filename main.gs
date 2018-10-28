//稽古日程をslackにmentionしたい！
//稽古日程と日付を比較し実行
function slackMentionByEvtSheet() {
    saveCalenderToSheet("Event");
    var dat = Event.getDataRange().getValues();//イベントシートのデータを配列に取得
    var tomorrow = new Date()
    tomorrow.setDate(new Date().getDate()+1);//明日の日付
    for (i = 1; i < dat.length; i++) {
        var sDate = new Date(dat[i][2]);//シート上の日付を取得 
        var envelope = new Envelope();
        if (sDate.getDate() == tomorrow.getDate()) {//日付が次の日ならば実行
              if(dat[i][1] == "稽古") envelope.message = genAbsentMessage(dat,i);//イベントタイトルが「稽古」なら実行
              if(dat[i][1] == "スタッフ会議")　envelope.message = genBasisMessage(dat,i);
        }                  
      if (envelope.message) sendHttpPost(envelope);
    }
}    


/* 個人予定の回答シートから、回答をカレンダーに反映 */
function addTaskEvents(){
  var ansDat = AnswerSheet.getDataRange().getValues(); //シートデータを取得
  var i = 0 + systemDat[6][0];//チェック済みの行数をロード
  
  for(;i<ansDat.length;i++){
    if(!ansDat[i][9]){//未チェックの回答ならば
      ansDat = checkDuplicationAndAddEvent(ansDat,i,0);      
    }
  }
  AnswerSheet.getRange(1, 1, i, 10).setValues(ansDat);
  ConstantsSheet.getRange("A7").setValue(i);//チェック済みの行数をセーブ
}


/* 舞台監督用のフォームに入力した回答シートから、回答をカレンダーに反映 */
function addTaskEventsForBukan() {
  var practiceDat = PracticeSheet.getDataRange().getValues(); //シートデータを取得
  var i = 0;
  
  for(;i<practiceDat.length;i++){
    if(!practiceDat[i][7]){//未チェックの回答ならば
      practiceDat = checkDuplicationAndAddEvent(practiceDat,i,1);
    }    
  }
  PracticeSheet.getRange(1,1,i,8).setValues(practiceDat);//データをシートに出力
}

/* 締め切り入力用のフォームに入力した回答シートから、回答をカレンダーに反映 */
function addDeadline() {
  var DeadDat = DeadSheet.getDataRange().getValues(); //シートデータを取得
  for(var i=1;i<DeadDat.length;i++){
    if(!deadDat[i][4]){//未チェックの回答ならば
      
      /* イベントタイトルを設定*/
      var title = deadDat[i][1] + ":" + deadDat[i][3];
      /* イベントの追加・スプレッドシートへの入力 */
      var evt = PracticeCal.createAllDayEvent(title,deadDat[i][2],{description:deadDat[i][1]}); //カレンダーにタスクをイベントとして追加    
      deadDat[i][4]=evt.getId(); //イベントIDを入力
    }
  }
  DeadSheet.getRange(1,1,i,5).setValues(deadDat); //データをシートに出力
}
