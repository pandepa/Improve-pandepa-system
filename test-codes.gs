function test(){

  Logger.log(isActor("山口"));
  Logger.log(isActor("take"));
  Logger.log(isActor("たけ"));
}

function addTaskEvents(){
  var ansDat = AnswerSheet.getDataRange().getValues(); //シートデータを取得
  var i = systemDat[6][0];
  
  for(;i<ansDat.length;i++){
    if(isActor(ansDat[i][1])){
      var j = checkDuplication(i);
    }
  }
  
  
  
}

/*　役者などのSystemConstantsシートE列に登録したメンバーならtrueを返す　*/
function isActor(name){
  for(var i=1;i<　systemDat.length;i++){
    if(name == systemDat[i][4]) return true;
  }
   return false; 
}
 
/* 該当する回答について、過去と未来に重複がないかを調べ、
　　　　　　過去の回答についてはカレンダーの削除処理をし、最新回答の行数を返す */
function checkDuplication(dat,i){
  
  /* 過去を検索　→　過去のデータは全てcheckされている前提
  　　　　　　過去回答のうち最新のものをチェック */
  for(var j=i-1;j>1;j--){
    if(dat[j][1] == dat[i][1] && dat[j][2] == dat[i][2]){//同一人物の同日の予定なら
      if(dat[j][9] == "checked") {
        j = 0;//変更の必要がないため終了
      } else { 
        var evt = EventCal.getEventById(dat[j][9]);//過去のカレンダーイベントを削除
        evt.deleteEvent();
        j = 0;//終了
      }
    }
  }
  
  /* 未来を検索 → 最新の回答を発見するまで繰り返す必要がある　*/
  for(j=i+1;j<dat.length;j++){
    if(dat[j][1] == dat[i][1] && dat[j][2] == dat[i][2]){//同一人物の同日の予定なら
      
    
    
    }  
  }
}

function checkAttendance(dat,i){
  if(dat[i][3] == "参加できる"){
  dat[i][9] = "checked";
  } else { 
    var repeat = 1;
    if(dat[i][7]) repeat = dat[i][7];
    var rec = CalendarApp.newRecurrence().addWeeklyRule();
    
    if(dat[i][3] == "参加できない"){
    }
  }
}
  
  
    


