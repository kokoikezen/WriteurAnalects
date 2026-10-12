// 한시 교실 - 동작 로직
// data.js 를 먼저 불러와 화면에 그리고, 한자 클릭 시 뜻/음을 보여줍니다.
// (JS 데이터라 index.html 을 파일로 바로 열어도 됩니다.)

(function () {
  "use strict";

  const tabsEl = document.getElementById("poemTabs");
  const containerEl = document.getElementById("poemContainer");
  const popup = document.getElementById("charPopup");
  const backdrop = document.getElementById("popupBackdrop");
  const popupChar = document.getElementById("popupChar");
  const popupMeaning = document.getElementById("popupMeaning");
  const popupSound = document.getElementById("popupSound");
  const popupClose = document.getElementById("popupClose");

  let POEMS = [];
  let currentIndex = 0;
  let selectedChar = null;

  /** 시 선택 탭을 그립니다. */
  function renderTabs() {
    tabsEl.innerHTML = "";
    POEMS.forEach((poem, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab-btn" + (index === currentIndex ? " active" : "");
      btn.textContent = poem.title;
      btn.addEventListener("click", () => {
        if (index === currentIndex) return;
        currentIndex = index;
        renderTabs();
        renderPoem(poem);
        closePopup();
      });
      tabsEl.appendChild(btn);
    });
  }

  /** 한 줄(line)을 DOM으로 만듭니다. */
  function createLine(line) {
    const lineEl = document.createElement("div");
    lineEl.className = "poem-line";

    // 1) 한자 (클릭 가능한 버튼)
    const hanjaEl = document.createElement("div");
    hanjaEl.className = "line-hanja";
    line.chars.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "char";
      btn.textContent = c.h;
      btn.title = c.mean + " " + c.sound;
      btn.addEventListener("click", () => {
        highlight(btn);
        openPopup(c);
      });
      hanjaEl.appendChild(btn);
    });

    // 2) 독음
    const readingEl = document.createElement("div");
    readingEl.className = "line-reading";
    readingEl.textContent = line.reading;

    // 3) 속뜻
    const meaningEl = document.createElement("div");
    meaningEl.className = "line-meaning";
    meaningEl.textContent = line.meaning;

    lineEl.append(hanjaEl, readingEl, meaningEl);
    return lineEl;
  }

  /** 하나의 시 전체를 그립니다. */
  function renderPoem(poem) {
    containerEl.innerHTML = "";

    const card = document.createElement("article");
    card.className = "poem-card";

    // 제목 + 지은이
    const head = document.createElement("div");
    head.className = "poem-head";

    const title = document.createElement("h2");
    title.className = "poem-title";
    title.innerHTML =
      escapeHtml(poem.title) +
      ' <span class="hanja">' +
      escapeHtml(poem.titleHanja) +
      "</span>";

    const author = document.createElement("p");
    author.className = "poem-author";
    author.textContent = poem.author + " (" + poem.authorHanja + ")";

    head.append(title, author);

    // 학습 토글
    const toolbar = document.createElement("div");
    toolbar.className = "poem-toolbar";

    const hanjaToggle = makeToggle("한문 가리기", "hide-hanja");
    const readingToggle = makeToggle("독음 가리기", "hide-reading");
    const meaningToggle = makeToggle("속뜻 가리기", "hide-meaning");
    toolbar.append(hanjaToggle, readingToggle, meaningToggle);

    card.append(head, toolbar);

    // 각 줄
    poem.lines.forEach((line) => card.appendChild(createLine(line)));

    containerEl.appendChild(card);
  }

  /** 가리기/보이기 토글 버튼을 만듭니다. */
  function makeToggle(label, className) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tool-btn";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      const card = containerEl.querySelector(".poem-card");
      if (!card) return;
      const off = card.classList.toggle(className);
      btn.classList.toggle("off", off);
      btn.textContent = off ? label.replace("가리기", "보이기") : label;
    });
    return btn;
  }

  /** 클릭한 한자를 강조합니다. */
  function highlight(btn) {
    if (selectedChar) selectedChar.classList.remove("selected");
    selectedChar = btn;
    btn.classList.add("selected");
  }

  /** 팝업을 엽니다. */
  function openPopup(c) {
    popupChar.textContent = c.h;
    popupMeaning.textContent = c.mean;
    popupSound.textContent = c.sound;

    backdrop.hidden = false;
    popup.hidden = false;
    // 트랜지션을 위해 다음 프레임에서 show 클래스 부여
    requestAnimationFrame(() => {
      backdrop.classList.add("show");
      popup.classList.add("show");
    });
  }

  /** 팝업을 닫습니다. */
  function closePopup() {
    backdrop.classList.remove("show");
    popup.classList.remove("show");

    const finish = () => {
      popup.hidden = true;
      backdrop.hidden = true;
      popup.removeEventListener("transitionend", finish);
    };
    popup.addEventListener("transitionend", finish);

    // 트랜지션 미지원 환경 대비
    setTimeout(finish, 260);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  // 이벤트 연결
  popupClose.addEventListener("click", closePopup);
  backdrop.addEventListener("click", closePopup);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !popup.hidden) closePopup();
  });

  // 데이터(data.js) 로드 후 초기 렌더링
  function init() {
    try {
      POEMS = window.POEMS_DATA || [];

      if (Array.isArray(POEMS) && POEMS.length > 0) {
        renderTabs();
        renderPoem(POEMS[currentIndex]);
      }
    } catch (err) {
      console.error("한시 데이터를 불러오지 못했습니다:", err);
      containerEl.innerHTML =
        '<p class="load-error">데이터를 불러오지 못했어요. data.js 파일을 확인해 주세요.</p>';
    }
  }

  init();
})();
