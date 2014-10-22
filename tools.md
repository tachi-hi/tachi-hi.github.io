---
layout: layout
title: Tools
---
<head>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
<script type="text/javascript">
$(function(){
  // 文字数のカウント用=============================================
  $("#moji_count").keyup(function(){
      var len = $(this).val().length;
      $("#wcharCount").text((len != 0 ? len : 0)+"文字");

      var words = $(this).val().split(/[\s,]+/);
      len = words.length; 
      len = (len > 0 && words[len-1].length == 0) ? (len - 1) : len;
      $("#wordCount").text((len != 0 ? len : 0)+"単語");
  });

  $("#wcharCount").css("font-size", "xx-large");
  $("#wordCount").css("font-size", "xx-large");

  // 和暦・西暦変換 ========================================================
  var seireki;
  $("#seireki").keyup(function(){
      seireki = $(this).val();
      var wareki_text = "";
      var wareki = ["", "平成", "昭和", "大正","明治"];
      var start = [2100, 1989, 1926, 1912, 1868];
      for(i = 0; i < wareki.length; i++){
        if(seireki >= start[i] && seireki <= start[i - 1]){
           wareki_text += (wareki[i] + (seireki == start[i] ? "元" : (seireki - start[i] + 1)) + "年 ");
        }
      }
      $("#wareki").text(wareki_text);
  });
  $("#wareki").css("font-size", "xx-large");
});
</script>
</head>

<textarea id = "moji_count", type="text" cols="150" rows="10" id="input-up"></textarea>
<div>
  <span id="wcharCount">0文字</span> 
  <span id="wordCount">0単語</span> 
</div>


西暦<textarea id = "seireki", type="text" cols="3" rows="1" id="input-up"></textarea>年
<span id="wareki">平成 ?? 年</span>

