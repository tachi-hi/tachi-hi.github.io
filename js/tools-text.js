// テキスト処理（文字数・単語数カウント、arXiv URL変換、ひらがな・カタカナ変換）
document.addEventListener("DOMContentLoaded", function () {

  // ============================================
  // 改行削除 + 文字数・単語数カウント
  // ============================================
  function guessLang(text) {
    // CJK文字・ひらがな・カタカナが含まれていれば日本語
    if (/[\u3000-\u9FFF\uF900-\uFAFF]/.test(text)) return "ja";
    return "en";
  }

  function removeLinebreaks(text) {
    text = text
      .replace(/\n/g, " ")
      .replace(/[\s]+/g, " ")
      .replace(/-\s/g, "-");
    if (guessLang(text) === "ja") {
      text = text
        .replace(/\s/g, "")
        .replace(/,/g, "、")
        .replace(/，/g, "、")
        .replace(/\./g, "。")
        .replace(/．/g, "。");
    }
    return text;
  }

  // TinySegmenter (辞書不要・即座に利用可能)
  var segmenter = (typeof TinySegmenter !== "undefined") ? new TinySegmenter() : null;
  if (!segmenter) {
    var errEl = document.getElementById("segmenterError");
    if (errEl) errEl.style.display = "";
  }

  function countWords(text) {
    if (!text.trim()) return { count: 0, segmented: "" };
    if (guessLang(text) === "ja" && segmenter) {
      var tokens = segmenter.segment(text).filter(function (t) {
        return t.trim().length > 0;
      });
      return { count: tokens.length, segmented: tokens.join("/") };
    }
    // 英語: 空白分割
    var words = text.split(/[\s,]+/);
    var wordLen = words.length;
    if (wordLen > 0 && words[wordLen - 1].length === 0) wordLen--;
    return { count: wordLen, segmented: "" };
  }

  var mojiCount = document.getElementById("moji_count");
  if (mojiCount) {
    mojiCount.addEventListener("input", function () {
      var text = this.value;

      var len = text.length;
      document.getElementById("wcharCount").textContent =
        (len || 0) + "文字";

      var wordEl = document.getElementById("wordCount");
      var segEl = document.getElementById("wordSegment");
      var result = countWords(text);
      wordEl.textContent = result.count + "単語";
      if (result.segmented) {
        segEl.textContent = result.segmented;
        segEl.style.display = "";
      } else {
        segEl.style.display = "none";
      }
    });

    mojiCount.addEventListener("blur", function () {
      this.value = removeLinebreaks(this.value);
      mojiCount.dispatchEvent(new Event("input"));
    });
  }

  // ============================================
  // arXiv URL 変換
  // ============================================
  var arxivInput = document.getElementById("arxivurl");
  if (arxivInput) {
    arxivInput.addEventListener("blur", function () {
      var url = this.value;
      var match = url.match(/\/(\d+\.\d+)/);
      if (!match) return;
      var arxivid = match[1];
      var arxivabs = "https://arxiv.org/abs/" + arxivid;
      var arxivpdf = "https://arxiv.org/pdf/" + arxivid + ".pdf";

      var absEl = document.getElementById("arxivabs");
      absEl.textContent = "";
      var link = document.createElement("a");
      link.href = arxivabs;
      link.textContent = arxivabs;
      absEl.appendChild(link);

      document.getElementById("arxivpdf").textContent = arxivpdf;

      navigator.clipboard.writeText(arxivabs).catch(function (err) {
        console.error("Copy failed:", err);
      });
    });
  }

  // ============================================
  // ひらがな・カタカナ変換
  // ============================================
  function hiraganaToKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
  }

  function katakanaToHiragana(str) {
    return str.replace(/[\u30A1-\u30F6]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
  }

  var kanaInput = document.getElementById("kana_input");
  if (kanaInput) {
    kanaInput.addEventListener("input", function () {
      var input = this.value;
      document.getElementById("kana_to_katakana").textContent =
        hiraganaToKatakana(input);
      document.getElementById("kana_to_hiragana").textContent =
        katakanaToHiragana(input);
    });
  }
});
