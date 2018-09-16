function saveCalenderToSheet(name) {
    sheet = spSheet.getSheetByName(name);//名前からシートを取得
    cal = eval(name+"Cal");//constantsでルールに従って定義したカレンダーを取得
    sheet.getRange('2:100').clear();//実行の都度、初期化をする
    var dat = sheet.getDataRange().getValues();//シートのデータを配列に取得  
    var today = new Date();//今日の日付  
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);//1週間後までの予定を転記することにしました

    var Evts = cal.getEvents(today, endDate);
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
    sheet.getRange(1, 1, i, 10).setValues(dat);
}

// 稽古日程と個人の欠席の判定
function WhoIsAbsent(dat, i) {
    WhoIsAbsentTomorrow.getRange('2:100').clear();　　　　　//実行の都度、初期化をする
    var absent = Actor.getDataRange().getValues();//個人シートのデータを配列に取得
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