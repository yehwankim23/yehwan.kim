import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, getDocs, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const loading = document.querySelector("#loading");
let count = 0;

const intervalId = setInterval(() => {
  loading.innerText = `Loading${".".repeat((count++ % 3) + 1)}`;
}, 200);

const firebaseApp = initializeApp({
  apiKey: "AIzaSyCnFtJWcURrUl7093um9kY2j4x0p_SV6mY",
  authDomain: "yehwan-kim.firebaseapp.com",
  projectId: "yehwan-kim",
  storageBucket: "yehwan-kim.appspot.com",
  messagingSenderId: "398883958426",
  appId: "1:398883958426:web:816204c99a5db2c278b923",
  measurementId: "G-SEK11VXWZT",
});

const analytics = getAnalytics(firebaseApp);

const language = navigator.language.startsWith("ko") ? "ko" : "en";

window.addEventListener("blur", () => {
  document.title = language === "ko" ? "다음에 또 만나요" : "See you next time";
});

window.addEventListener("focus", () => {
  document.title = "yehwan.kim";
});

if (new Date().getMonth() === 1 && new Date().getDate() === 3) {
  document.querySelector("#title").innerText = "yehwan.kim 🎉🥳";
}

const firestore = getFirestore(firebaseApp);
const storage = getStorage();

const contact = document.querySelector("#contact");

(await getDocs(collection(firestore, "contact"))).forEach((website) => {
  getDownloadURL(ref(storage, `contact/${website.id}.png`)).then((image) => {
    contact.innerHTML += `
      <a href="${website.data()["url"]}" target="_blank">
        <img src="${image}" />
      </a>
    `;
  });
});

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
            </div>
          `;

          projects.innerHTML += innerHTML;
        });
      });
  });

while (contact.innerHTML === "" || projects.innerHTML === "") {
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
}

clearInterval(intervalId);
loading.classList.add("d-n");
