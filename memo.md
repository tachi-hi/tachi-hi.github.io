---
layout: layout
title: Memorandum
---
<head>
	<script type="text/javascript"
	  src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML">
	</script>
	<meta http-equiv="X-UA-Compatible" CONTENT="IE=EmulateIE7" />
</head>

[[Back]](index.html)

# Memorandum

## Microsoft 製品関連

pptx, docx, xlsx など MS Office 2010 のファイルは実体としては色々なデータを固めた zip ファイルなので unzip すれば中身を取り出せる．

## Linux関連

+ 個別の言語等に関するメモは sandbox に適宜追加
+ PATHは通っているはずなのにcommand not foundなどとなるとき（pycudaのconfigure.pyがnvccを認識しない問題など）
	+ rootのPATHも調べてみる。sudo pip ... などとするのではなくrootで作業する。
+ 日本語が入力できなくなったら
	+ `ibus-daemon`を起動

### ntp
`ntpdate -u ntp.ubuntu.com`

## Math
$$m (\mathrm{nrow}) \times n (\mathrm{ncol})$$ matrix

\\[\begin{pmatrix} \
a\_{11} & a\_{12} & \dots & a\_{1n} \\\\ \ 
a\_{21} & a\_{22} & \dots & a\_{2n} \\\\ \
\vdots & \vdots & \ddots & \vdots \\\\ \
a\_{m1} & a\_{m2} & \dots & a\_{mn} \end{pmatrix} \
\\]

## TeX メモ
文字を消す： \phantom{}

## ランダムページ

- [Wikipedia Random page](http://ja.wikipedia.org/wiki/Special:Randompage)

## 忘れやすいLinuxコマンド

### ps, kill

    ps
    kill -9 <process number>

### nohup系

`nohup` `bg` `jobs` `disown`

### screen デタッチ

    screen 
    . do_something
    Ctrl-a d
    screen -ls
    screen -r 12345

### wc 系

ファイルの行数を取得するときは

    L=`wc -l file.txt`

ではだめで

    L=`cat file.txt | wc -l`

### ls オプション

    ls -ltr
    ls -lha

## git

    git commit --author="name <mail@address>"
