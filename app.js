(function () {
  "use strict";
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("gameplan:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("gameplan:" + k, JSON.stringify(v)); } catch (e) { /* 保存できない環境では無視 */ } }
  };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  // 「案出し用」＝企画を考えるときの思考の順番（企画の思考順番.pptxより）
  var IDEA_ITEMS = [
    { title: "プレイヤーがやること（＝駆け引き）", maps: "メインシステム・感動するポイントになる",
      explain: "思考の出発点はここです。人間は一度決めると変えることを嫌がるので、最初に何を決めるかが重要です。先に世界観やストーリーを決めてしまうと、「やること」の選択肢がなくなり、どこにでもある企画になってしまいます。だからこそ、まずプレイヤーが何をして駆け引きをするのかを最初に決めましょう。" },
    { title: "誰が誰に何を（＝キャラ、道具）", maps: "メインシステムになる",
      explain: "駆け引きが決まったら、それを「誰が」「誰に対して」「何を使って」行うのかを決めます。キャラクターや道具（武器・アイテムなど）はここで具体化します。" },
    { title: "どこで（戦う舞台）", maps: "コンセプトとターゲットになる",
      explain: "駆け引きを行う舞台・場所を決めます。話の入口としては舞台や世界観の方が考えやすく、つい先に決めたくなりますが、思考の順番としては駆け引き・キャラのあとに来ます。" },
    { title: "なぜ（世界観設定＝戦う動機＝ゲームの目的）", maps: "コンセプトとターゲットになる",
      explain: "なぜそれをやるのか、という動機や目的、世界観設定を決めます。これも話の入口として盛り上がりやすい部分ですが、先にここを決めてしまうと「やること」の自由度が失われてしまうため、順番としては後に回します。" },
    { title: "サブ要素、アイテム、ステージのバリエーション", maps: "サブ要素・特殊なアイテム・ゲームサイクル・ゲームボリュームになる",
      explain: "ここまでで決まった幹（駆け引き・キャラ・舞台・目的）に対して、サブ要素やアイテム、ステージのバリエーションといった「足りないルールを補う」要素を最後に加えていきます。" }
  ];

  // 「まとめ用」＝企画書・発表の順番（企画書のつくり方20260320.pptxより）
  // src：対応する案出し用の項目番号（IDEA_ITEMSの添字）
  var SUM_ITEMS = [
    { title: "タイトル、ゲームハード、ジャンル",
      explain: "企画書の一番最初に書く基本情報です。どんな名前のゲームで、どの機種（ハード）で遊ぶもので、ジャンルは何か。読み手が最初に全体像をつかむための入り口になります。" },
    { title: "コンセプトとターゲット", src: [2, 3],
      explain: "企画書とは、脳内の妄想を最初に形にする書類。開発予算を獲得すると同時に、開発チームが最初に目にする書類です。企画の内容を理解してもらい、合意を得るための書類でもあります。\n\nこのゲームが何なのか（コンセプト）、誰に向けたゲームなのか（ターゲット）をはっきりさせることで、読み手にイメージを持ってもらいます。" },
    { title: "幹になる遊び（メインシステム）", src: [0, 1],
      explain: "ゲームを構成する要素は1本の木にたとえられます。「幹」にあたるのが、企画における「ゲーム」の核＝「ルールと駆け引き」です。アイテムやステージ、スキルといった「枝」、音楽やグラフィック、シナリオといった「葉っぱ」は、すべてこの幹を彩るためのもの。\n\nまずこの根本の遊び方（メインシステム）を固めることが、企画の出発点になります。" },
    { title: "感動するポイント（なぜ面白いのか）", src: [0],
      explain: "感動とは、文字通り「感じて動かされる」こと、心が揺さぶられる状態です。その正体は「ギャップ（落差）」。予想と結果の差が大きいほど、心は揺さぶられます（例：何度も失敗したボスをやっと倒せた、負けかけていた試合の大逆転など）。\n\nただし人間は慣れる生き物なので、同じ仕掛けばかりだとマンネリ化します。「緊張から緩和」「緩和から緊張」、どちらの種類の感動を狙うのかを考えましょう。" },
    { title: "サブ要素", src: [4],
      explain: "サブ要素とは、「幹（ルールと駆け引き）」を何度も繰り返し遊ばせるために、遊ぶ条件を変える仕掛けです。たとえるなら「ご飯」と「おかず」の関係（ご飯を美味しく食べるために味を変える）。\n\n幹に与える影響の大きいサブ要素から優先して入れていくのがコツです。ただし、増やしすぎると辻褄合わせが大変になるので注意しましょう。" },
    { title: "ゲームサイクル", src: [4],
      explain: "プレイヤーが繰り返し行う基本の流れのことです。たとえばシミュレーションゲームでは「命令→結果→獲得（アイテム・経験値・お金など）→新たな投資→資産の増加」というサイクルが代表的です。\n\nこのサイクルがはっきりしているほど、プレイヤーは次に何をすればいいか迷わず遊び続けられます。" },
    { title: "ゲームボリューム",
      explain: "どのくらいの規模・プレイ時間で遊べるゲームなのかという量感です。企画書を読む人がゲーム全体の大きさをイメージできるように示しておきましょう。" },
    { title: "特殊なアイテム（一般的なものは書かない）", src: [4],
      explain: "大枠かつ概念的な話から始まり、だんだん詳細な仕組みの話をすることで、読み手にイメージさせるのが企画書の基本の流れです。アイテムのような細かい要素は一番最後に書きます。\n\nまた、回復薬のようなどのゲームにもある「一般的なもの」はわざわざ書かず、このゲームならではの「特殊なアイテム」だけを書くようにしましょう。" }
  ];

  var COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  function noteKey(kind, i) { return kind + "-" + i; }

  function renderPage(el, items, kind) {
    el.innerHTML = items.map(function (it, i) {
      var val = store.get(noteKey(kind, i), "");
      var h = '<div class="item">' +
        '<button type="button" class="item-head" data-i="' + i + '">' +
        '<span class="item-num">' + (i + 1) + '</span>' +
        '<span class="item-title">' + esc(it.title) + (it.maps ? '<span class="item-maps">（→ ' + esc(it.maps) + '）</span>' : '') + '</span>' +
        '<span class="item-chev">▸</span></button>' +
        '<div class="explain"><p>' + esc(it.explain) + '</p></div>' +
        '<textarea placeholder="ここにメモを書けます" data-note="' + kind + '-' + i + '"' + (kind === "idea" ? ' id="idea-ta-' + i + '"' : '') + '>' + esc(val) + '</textarea>';
      if (kind === "sum" && it.src && it.src.length) {
        h += '<div class="srcfold">' +
          '<button type="button" class="srcfold-head" data-src="' + i + '"><span class="item-chev">▸</span>案出しのメモを見る</button>' +
          '<div class="srcbody" id="srcbody-' + i + '"></div></div>';
      }
      return h + "</div>";
    }).join("");

    el.addEventListener("click", onItemClick);
    el.addEventListener("input", function (e) {
      var ta = e.target.closest("textarea[data-note]"); if (!ta) return;
      store.set(ta.getAttribute("data-note"), ta.value);
    });
  }

  function onItemClick(e) {
    var b = e.target.closest("[data-i]");
    if (b) {
      var head = b, exp = head.nextElementSibling, chev = head.querySelector(".item-chev");
      var open = exp.classList.toggle("open");
      chev.classList.toggle("open", open);
      return;
    }
    var sb = e.target.closest("[data-src]");
    if (sb) {
      var idx = +sb.getAttribute("data-src"), body = document.getElementById("srcbody-" + idx);
      var open2 = body.classList.toggle("open");
      sb.querySelector(".item-chev").classList.toggle("open", open2);
      if (open2) fillSrcBody(idx, body);
      return;
    }
    var cb = e.target.closest("[data-copy]");
    if (cb) {
      var ta = document.getElementById(cb.getAttribute("data-copy"));
      copyText(ta.value, cb);
    }
  }

  function fillSrcBody(sumIdx, body) {
    var srcIdxList = SUM_ITEMS[sumIdx].src;
    body.innerHTML = '<div class="srcbody-in">' + srcIdxList.map(function (ideaIdx) {
      var ideaIt = IDEA_ITEMS[ideaIdx];
      var val = store.get(noteKey("idea", ideaIdx), "");
      var taId = "srctext-" + sumIdx + "-" + ideaIdx;
      return '<div class="srcrow"><span class="lab">' + esc(ideaIt.title.split("（")[0]) + '</span>' +
        '<button type="button" class="copybtn" data-copy="' + taId + '">' + COPY_ICON + 'コピー</button></div>' +
        '<textarea class="srctext" id="' + taId + '" readonly placeholder="（案出し用にまだ何も書かれていません）">' + esc(val) + '</textarea>';
    }).join("") + "</div>";
  }

  function copyText(text, btn) {
    var done = function () {
      var old = btn.innerHTML;
      btn.innerHTML = COPY_ICON + "コピーしました";
      setTimeout(function () { btn.innerHTML = old; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* 無視 */ }
    document.body.removeChild(ta);
  }

  renderPage(document.getElementById("page-idea"), IDEA_ITEMS, "idea");
  renderPage(document.getElementById("page-sum"), SUM_ITEMS, "sum");

  var HINTS = {
    idea: "企画を考えるときの思考の順番です。上から順に決めていくと、後戻りしにくくなります。",
    sum: "発表・企画書にまとめるときの順番です（パワポと同じ並び）。案出し用のメモを見ながら清書しましょう。"
  };
  document.getElementById("hint").textContent = HINTS.idea;

  document.querySelector(".tabs").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]"); if (!b) return;
    var tab = b.getAttribute("data-tab");
    [].forEach.call(document.querySelectorAll(".tabs button"), function (x) { x.classList.toggle("on", x === b); });
    document.getElementById("page-idea").hidden = tab !== "idea";
    document.getElementById("page-sum").hidden = tab !== "sum";
    document.getElementById("hint").textContent = HINTS[tab];
  });

  /* ---------- 更新のお知らせ（開いたときに一度だけ） ---------- */
  function showAnnounce(e) {
    var html = '<div class="lbox" role="dialog" aria-modal="true" aria-label="お知らせ"><div class="shead">' +
      "<h3>" + esc(e.title || "お知らせ") + '</h3><button type="button" data-an="close" aria-label="閉じる">✕</button></div>' +
      (e.body || []).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") +
      '<label><input type="checkbox" id="an-dontshow"> 今後表示しない</label>' +
      '<button class="btn" type="button" data-an="close">閉じる</button></div>';
    var d = document.createElement("div");
    d.id = "announce"; d.innerHTML = html;
    document.body.appendChild(d);
    d.addEventListener("click", function (ev) {
      if (ev.target.closest('[data-an="close"]')) {
        if (d.querySelector("#an-dontshow").checked) store.set("announceSeen", e.id);
        d.remove();
      }
    });
  }
  fetch("announce-data.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (list) {
    var e = Array.isArray(list) ? list[0] : null; if (!e) return;
    if (store.get("announceSeen", null) !== e.id) showAnnounce(e);
  }).catch(function () { /* オフライン等は無視 */ });
})();
