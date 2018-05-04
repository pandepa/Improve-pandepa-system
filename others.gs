function myFunction() {
  
}


//稽古日程をslackにmentionしたい！prottype
function slackMentionBySche(){
  var dat = Sche.getDataRange().getValues();//シートのデータを配列に取得
  var today = new Date();//今日の日付
  
  for(i=1;i<dat.length;i++){
    var tDate = new Date(dat[i][0]);//シート上の日付を取得
    if(tDate.getMonth() == today.getMonth() && tDate.getDate() == today.getDate()){//当日の欄ならば実行
      if(dat[i+1][2]==1){//次の日に稽古カウンタが1ならば実行
        var pDate = new Date(dat[i+1][0]);//シート上の次の日の日付を取得
        var sTime = new Date(dat[i+1][3]);//シート上の稽古開始時間を取得
        var fTime = new Date(dat[i+1][4]);//シート上の稽古終了時間を取得
        var sMinutes = (sTime.getMinutes());
        var fMinutes = (fTime.getMinutes());
                
        if(sMinutes < 10){sMinutes = "0" + sMinutes;}//一桁なら頭に0をつける
        if(fMinutes < 10){fMinutes = "0" + fMinutes;}
        
        var message = ("こんにちは！次の稽古は明日" 
                     + (pDate.getMonth()+1) + "月"
                     + pDate.getDate() + "日(" + dat[i+1][1] + ")の"
                     + sTime.getHours() + ":" + sMinutes +"～"
                     + fTime.getHours() + ":" + fMinutes +"で、場所は"
                     + dat[i+1][5] + "です！よろしく！");                   
     Logger.log(message);
       // var message ="ごめんね";
       sendHttpPost(message,username);
      }
    }
  }
}