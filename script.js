const LANGUAGE = navigator.language.startsWith("ko") ? "ko" : "en";

window.addEventListener("blur", () => {
  document.title = TITLE.blur[LANGUAGE];
});

window.addEventListener("focus", () => {
  document.title = TITLE.focus;
});

if (new Date().getMonth() === 1 && new Date().getDate() === 3) {
  document.querySelector("h1").innerText = `${TITLE.focus} ${TITLE.birthday}`;
}

function recurse(parent, CHILDREN) {
  CHILDREN.forEach((CHILD) => {
    let div = document.createElement("div");

    if (CHILD.type === "folder") {
      let span = document.createElement("span");
      span.appendChild(document.createTextNode(CHILD[`name_${LANGUAGE}`]));

      span.addEventListener("click", (event) => {
        let parent = event.currentTarget.parentElement;

        if (parent.classList.contains("collapse")) {
          parent.classList.remove("collapse");
        } else {
          parent.classList.add("collapse");
        }
      });

      div.appendChild(span);
      div.classList.add("collapse");

      recurse(div, CHILD.children);
    } else {
      let a = document.createElement("a");
      a.setAttribute("href", CHILD.url);
      a.setAttribute("target", "_blank");
      a.appendChild(document.createTextNode(CHILD[`name_${LANGUAGE}`]));
      div.appendChild(a);

      let p = document.createElement("p");
      p.appendChild(document.createTextNode(CHILD[`description_${LANGUAGE}`]));
      div.appendChild(p);
    }

    parent.appendChild(div);
  });
}

recurse(document.querySelector("#parent"), CHILDREN);
