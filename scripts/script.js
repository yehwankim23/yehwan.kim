import { initializeApp } from "firebase/app";
import axios from "axios";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

async function main() {
  const loading = document.querySelector("#loading");
  let count = 0;

  const intervalId = setInterval(() => {
    loading.innerText = `Loading${".".repeat((count++ % 3) + 1)}`;
  }, 200);

  const firebaseApp = initializeApp(
    (
      await axios({
        method: "get",
        url: "https://tokens.yehwan.kim/tokens",
      })
    ).data
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
  const query = window.location.search.slice(1).toLowerCase();

  if (query) {
    window.location.replace(
      (await getDoc(doc(firestore, "urls", "shortcuts"))).data()["shortcuts"][query] ??
        "https://yehwan.kim"
    );

    return;
  }

  const projects = document.querySelector("#projects");

  (await getDoc(doc(firestore, "projects", "years")))
    .data()
    ["years"].toSorted()
    .toReversed()
    .forEach(async (year) => {
      (await getDoc(doc(firestore, "projects", year)))
        .data()
        ["months"].toSorted()
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
            const url = data["url"];
            const tag = url ? "a" : "div";
            const name = data["name"][language];

            innerHTML += `
              <div class="w-75 ai-fs">
                <${tag} class="fs-6" ${url ? `href="${url}" target="_blank"` : ""}>${name}</${tag}>
                <div class="mt-5">${data["description"][language]}</div>
                <a class="mt-5" href="https://github.com/yehwankim23/${project.id}" target="_blank">
                  ${language === "ko" ? "깃허브" : "GitHub"}
                </a>
                <div class="mt-5 fs-2 c-gray">${data["tag"].sort().join(", ")}</div>
              </div>
            `;

            projects.innerHTML += innerHTML;
          });
        });
    });

  const storage = getStorage();
  const contact = document.querySelector("#contact");

  for (const [name, url] of Object.entries(
    (await getDoc(doc(firestore, "urls", "links"))).data()["links"]
  )) {
    getDownloadURL(ref(storage, `icons/${name}.png`)).then((icon) => {
      contact.innerHTML += `
        <a class="h-10" href="${url}" target="_blank">
          <img src="${icon}" />
        </a>
      `;
    });
  }

  while (contact.innerHTML === "" || projects.innerHTML === "") {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  clearInterval(intervalId);
  loading.classList.add("d-n");
  contact.classList.remove("d-n");
}

await main();
