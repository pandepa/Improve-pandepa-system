// 稽古日程と個人の欠席の判定
function WhatWIA(dat, i) {
    WhoIsAbsentTomorrow.getRange('2:100').clear();　　　　　//実行の都度、初期化をする
    var absent = ActorSche.getDataRange().getValues();//個人シートのデータを配列に取得
    var tommorow = new Date(); 
    tommorow.setDate(tommorow.getDate() + 1);  //（＊前の関数より明日が稽古である前提）24時間後の日付を取得
  
    var sTime = new Date(dat[i][4]);//(再定義)シート上の稽古開始時間を取得
    var fTime = new Date(dat[i][7]);//（再定義）シート上の稽古終了時間を取得
    var j;
    var counter = 0;
    var absDat = [];
    for(j = 0; j < absent.length;j++){
        var asTime = new Date(absent[j][4]);// (再定義)シート上の欠席開始時間を取得
        var afTime = new Date(absent[j][7]);//（再定義）シート上の欠席稽古終了時間を取得
        var absDay = new Date(absent[j][2]);// 欠席日を取得
      
        if (tommorow.getDate() == absDay.getDate()) {     //稽古時間と欠席時間の被りの判定
          
          if (sTime.getTime() < asTime.getTime() && fTime.getTime() > asTime.getTime()) {  //稽古開始後から稽古終了までの間に欠席開始
                if (fTime.getTime() > afTime.getTime()) {　　//稽古開始後から欠席して稽古終了前に戻ってくる場合
                    absDat[counter] = [];
                    absDat[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　absDat[counter][1] = asTime;　　　　　//
                    absDat[counter][2] = afTime;        //
                    counter++;
                } else {　　　//稽古開始後から欠席して稽古終了まで戻らない場合
                    absDat[counter] = [];
　　　　　　　　　　　　absDat[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　absDat[counter][1] = asTime;　　　　　//
                    absDat[counter][2] = "稽古終了";        //
                    counter++;
                }
          }else if (sTime.getTime() != asTime.getTime() && fTime.getTime() == afTime.getTime()) {  //稽古終了と同時に欠席終了
                if (sTime.getTime() > asTime.getTime()) {　　//稽古開始が欠席開始よりあとの場合
                    absDat[counter] = [];
                    absDat[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　absDat[counter][1] = "稽古開始";　　　　　//
                    absDat[counter][2] = afTime;        //
                    counter++;
                } else {　　　//欠席開始が稽古開始より欠席終了の方が後の場合
                    absDat[counter] = [];
　　　　　　　　　　　　absDat[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　absDat[counter][1] = "稽古開始";　　　　　//
                    absDat[counter][2] = "稽古終了";        //
                    counter++;
                }
          }else if (sTime.getTime() == asTime.getTime() ) {  //稽古開始と同時に欠席開始
                if (fTime.getTime() > afTime.getTime()) {　　//結局、遅刻する場合
                    absDat[counter] = [];
                    absDat[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　absDat[counter][1] = "稽古開始";　　　　　//
                    absDat[counter][2] = afTime;       //
                    counter++;
                } else {　　　//結局、欠席する場合
                    absDat[counter] = [];
　　　　　　　　　　　　absDat[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　absDat[counter][1] = "稽古開始";　　　　　//
                    absDat[counter][2] = "稽古終了";        //
                    counter++;
                }
          } else if (sTime.getTime() > asTime.getTime() && sTime.getTime() < afTime.getTime()) {  //欠席あるいは遅刻する場合
                if (fTime.getTime() > afTime.getTime()) {    //遅刻する場合
                    absDat[counter] = [];
　　　　　　　　　　　　absDat[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　absDat[counter][1] = "稽古開始"; 
                    absDat[counter][2] = afTime;        //
                    counter++;
                } else {　　　//欠席する場合
                    absDat[counter] = [];
　　　　　　　　　　　　absDat[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　　　　　absDat[counter][1] = "稽古開始";       
                    absDat[counter][2] = "稽古終了";        //
                    counter++;
                }
          } else if (asTime.getTime() == afTime.getTime()){
                absDat[counter] = [];
                absDat[counter][0] = absent[j][1];  //欠席者の名前
　　　　　　　　 　absDat[counter][1] = "稽古開始";       
                absDat[counter][2] = "稽古終了";        //
                counter++;
          } else if (fTime.getTime() < asTime.getTime() || sTime.getTime() > afTime.getTime()) { //稽古時間外の欠席
                continue;
          }
        }
    }
    if(counter !=0){
        WhoIsAbsentTomorrow.getRange(2, 1, counter, 3).setValues(absDat);
    }
} 


