import axios from "axios";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

async function main() {
  const loading = document.querySelector("#loading");
  let count = 0;

  const intervalId = setInterval(() => {
    loading.innerText = `Loading${".".repeat((count++ % 3) + 1)}`;
  }, 200);

  const firebaseApp = initializeApp(
    (await axios.get("https://tokens.yehwan.kim/tokens")).data.firebase
  );

  const analytics = getAnalytics(firebaseApp);
  const language = navigator.language.startsWith("ko") ? "ko" : "en";

  window.addEventListener("blur", () => {
    document.title = language === "ko" ? "다음에 또 만나요" : "See you next time";
  });

  window.addEventListener("focus", () => {
    document.title = "yehwan.kim";
  });

  if (new Date().getMonth() === 1 && new Date().getDate() === 3) {
    document.querySelector(
      "#title"
    ).innerHTML = `<a href="https://decimal-age.pages.dev" target="_blank">yehwan.kim 🥳🎉</a>`;
  }

  const firestore = getFirestore(firebaseApp);
  const hash = window.location.hash[1]?.toLowerCase();

  if (hash) {
    window.location.replace(
      (await getDoc(doc(firestore, "urls", "shortcuts"))).data().shortcuts[hash] ??
        "https://yehwan.kim"
    );

    return;
  }

  const links = document.querySelector("#links");

  (await getDoc(doc(firestore, "urls", "links")))
    .data()
    .links.sort()
    .forEach((link) => {
      links.innerHTML += `
        <a class="h-10" href="${link}" target="_blank">
          <img src="images/${link.split("/")[2]}.png" />
        </a>
      `;
    });

  const projects = document.querySelector("#projects");

  (await getDoc(doc(firestore, "projects", "years")))
    .data()
    .years.sort()
    .toReversed()
    .forEach(async (year) => {
      (await getDoc(doc(firestore, "projects", year)))
        .data()
        .months.sort()
        .toReversed()
        .forEach(async (month) => {
          let firstProject = true;

          (await getDocs(collection(firestore, "projects", year, month))).forEach((project) => {
            let innerHTML = `<div class="mt-10 w-90 fd-r ai-fs jc-fe">`;

            if (firstProject) {
              firstProject = false;

              innerHTML += `
                <div class="mr-5 w-10">
                  <div>${year}</div>
                  <div>${month}</div>
                </div>
              `;
            }

            const data = project.data();
            const url = data.url;
            const tag = url ? "a" : "div";
            const github = data.github;

            innerHTML += `
              <div class="w-75 ai-fs">
                <${tag} class="fs-6" ${url ? `href="${url}" target="_blank"` : ""}>
                  ${data.name[language]}
                </${tag}>
                <div class="mt-5">${data.description[language]}</div>
                ${github ? `<a class="mt-5" href="${github}" target="_blank">GitHub</a>` : ""}
                <div class="mt-5 fs-2 c-gray">${data.tag.sort().join(", ")}</div>
              </div>
            `;

            projects.innerHTML += innerHTML;
          });
        });
    });

  while (links.innerHTML === "" || projects.innerHTML === "") {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  clearInterval(intervalId);
  loading.classList.add("d-n");
  links.classList.remove("d-n");
}

await main();
