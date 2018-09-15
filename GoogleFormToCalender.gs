/* 指定月のカレンダーからイベントを取得する */
function addTaskEvents() {
  var dat = AnswerSheet.getDataRange().getValues(); //シートデータを取得

  for(var i=1;i<dat.length;i++){
    var isActor = new Boolean(false);
    if(dat[i][1]=="やまぐち" ||dat[i][1]=="策"||dat[i][1]=="はるな" ||dat[i][1]=="わたりょ"||dat[i][1]=="あっきー" ||dat[i][1]=="とり" ||dat[i][1]=="せいや"||dat[i][1]=="やまねっこ"){
      isActor = true;
    }
    if(dat[i][8] == ""){ 
      for(var j=1;j < i; j++){   //まだカレンダーに出力されていない予定に関して変更がないかをチェックする
        iDate = new Date(dat[i][2]);
        jDate = new Date(dat[j][2]);
        if(dat[i][1] == dat[j][1] && iDate.getDate() == jDate.getDate() && iDate.getMonth() == jDate.getMonth() &&　dat[j][3] != "参加できる" ){//元の予定（参加できる以外）と日付と名前が一緒の場合
           if(isActor == true){ //役者か演出なら
             deleteEve(dat,j,i,ActorCal,"private");//参加できるはカレンダーに反映されないため、消せない。それ以外は消す必要があるためdelete関数へ飛ばす
           }else{
             deleteEve(dat,j,i,BackseatplayerCal,"private");
           }
        }else if(dat[i][1] == dat[j][1] && iDate.getDate() == jDate.getDate() && iDate.getMonth() == jDate.getMonth() &&　dat[j][3] == "参加できる" && dat[j][8] != "うんこ"){
          Logger.log("1234500");
           var message = (dat[j][1] + "さんが"+ dat[j][2].getMonth() + "月"
                         + dat[j][2].getDate() + "日の予定を『"+dat[j][3]+"』から『"+dat[i][3]+"』に変更しました");
           AnnounceChange(message,dat,j,"pri");
           dat[j][8]= "うんこ";                         
        }
      }
      if(dat[i][3] == "時間に制約がある"){
         /* 日時をセット */
        var evtDateS = new Date(dat[i][2]);
        var evtDateF = new Date(dat[i][2]);
        var absSTime = new Date(dat[i][5]);
        var absFTime = new Date(dat[i][6]);
        evtDateS.setHours(absSTime.getHours());
        evtDateS.setMinutes(absSTime.getMinutes());     
        evtDateF.setHours(absFTime.getHours());
        evtDateF.setMinutes(absFTime.getMinutes());   
         /* イベントの追加・スプレッドシートへの入力 */
        if(isActor == true)//役者or演出ならそれ専用のカレンダーに
          var myEvt = ActorCal.createEvent(dat[i][1],evtDateS,evtDateF,{description:dat[i][7]}); //カレンダーにタスクをイベントとして追加
        else{　　//それ以外も専用のカレンダーに
          var myEvt = BackseatplayerCal.createEvent(dat[i][1],evtDateS,evtDateF,{description:dat[i][7]}); //カレンダーにタスクをイベントとして追加
        }
        dat[i][8]=myEvt.getId(); //イベントIDを入力
      }else if (dat[i][3] =="参加できない"){  
        var evtDateSF = new Date(dat[i][2]);
         /* イベントの追加・スプレッドシートへの入力 */
        if(isActor == true){//役者or演出ならそれ専用のカレンダーに
          var myEvt = ActorCal.createAllDayEvent(dat[i][1],evtDateSF,{description:dat[i][7]}); //カレンダーにタスクをイベントとして追加                                                                                   
        }else{　　//それ以外も専用のカレンダーに
          var myEvt = BackseatplayerCal.createAllDayEvent(dat[i][1],evtDateSF,{description:dat[i][7]}); //カレンダーにタスクをイベントとして追加                                                                                                
        }
        dat[i][8]=myEvt.getId(); //イベントIDを入力      
      }
    }
  }
  AnswerSheet.getRange(1,1,i,9).setValues(dat); //データをシートに出力
}

/* 指定月のカレンダーからイベントを取得する */
function addTaskEventsForBunkan() {
  var dat = PracticeSheet.getDataRange().getValues(); //シートデータを取得
  for(var i=1;i<dat.length;i++){
    if(dat[i][7] == ""){
      for(var j=1;j < i; j++){   //まだカレンダーに出力されていない予定に関して変更がないかをチェックする
        iDate = new Date(dat[i][2]);
        jDate = new Date(dat[j][2]);
        if(dat[i][1] == dat[j][1] && iDate.getDate() == jDate.getDate()){//元の予定と日付と名前が一緒の場合
             deleteEve(dat,j,i,PracticeCal,"Prac");
        }
      }
      /* 日時をセット */
      var evtDateS = new Date(dat[i][2]);
      var evtDateF = new Date(dat[i][2]);
      var evtSTime = new Date(dat[i][3]);
      var evtFTime = new Date(dat[i][4]);
      evtDateS.setHours(evtSTime.getHours());
      evtDateS.setMinutes(evtSTime.getMinutes());     
      evtDateF.setHours(evtFTime.getHours());
      evtDateF.setMinutes(evtFTime.getMinutes());    
 
      /* イベントの追加・スプレッドシートへの入力 */
      var myEvt = PracticeCal.createEvent(dat[i][1],evtDateS,evtDateF,{location:dat[i][5],description:dat[i][6]});
 
      dat[i][7]=myEvt.getId(); //イベントIDを入力
    }
  }
  PracticeSheet.getRange(1,1,i,8).setValues(dat); //データをシートに出力
}

function deleteEve(dat,j,i,cals,whichDoseChange) { 
  var now = new Date();
  var MonthLater = new Date();
  MonthLater.setDate(MonthLater.getDate() + 50); //やっぱり50日内にします
  var events = cals.getEvents(now, MonthLater); 
  var doseChange = new Boolean(false);　
 
  for(var n=0; n < events.length; n++){　//一か月以内で同じ人の同じ日の元々の予定を削除
      var y = 1;
      var z = 2;
  /*    if(whichDoseChange == "Prac"){
         y = 2;
         z = 1;
      }*/
    
      if (events[n].getTitle() == dat[j][y] && events[n].getStartTime().getDate() == dat[j][z].getDate() &&  events[n].getStartTime().getMonth() == dat[i][z].getMonth() ) {
        events[n].deleteEvent();
        doseChange = true;
      }
  }
  if(whichDoseChange == "Prac"){
    if(doseChange == true){
       /*var plusone = new Date(dat[j][1]);
  　　　plusone.setMonth(plusone.getMonth() + 1);
      Logger.log(plusone);*/
      var addmessage = "";
      if(dat[i][4] == ""){
        addmessage = "なしに";
      }
      
      var message = (dat[j][2].getMonth() + "月"
                     + dat[j][2].getDate() + "日の予定を" + addmessage +"変更しました。確認をお願いします！");
      AnnounceChange(message,dat,j);
      Logger.log("hohoh");
    }
  }else{
    if(doseChange == true){
      /*var plusone = new Date(dat[j][2]);
  　　 plusone.setMonth(plusone.getMonth() + 1)*/
      var message = (dat[j][1] + "さんが"+ dat[j][2].getMonth() + "月"
                     + dat[j][2].getDate() + "日の予定を『"+dat[j][3]+"』から『"+dat[i][3]+"』に変更しました");
      AnnounceChange(message,dat,j);
    }
  }
}

function AnnounceChange(message,dat,j){
  Logger.log(dat[j][1]);
  var now = new Date(); //再定義
  var twoWeeksLater = new Date(); 
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);//二週間後
  if(now < dat[j][2] &&  twoWeeksLater > dat[j][2] ){　//個人の予定で変更されたのが二週間以内の予定だった場合
    sendHttpPost(message, username,postUrl); //slackで通知
  }
  if(twoWeeksLater > dat[j][2] ){　//稽古予定で変更されたのが二週間以内の予定だった場合 //now < dat[j][2]
    sendHttpPost(message, username,postUrl); //slackで通知
    Logger.log("333");
  }
}
