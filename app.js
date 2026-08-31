/*
  PEMILIHAN UMUM — frontend

  1) Put your deployed Google Apps Script URL in CONFIG.API_URL.
  2) Candidate data can be edited below without touching the UI.
*/

const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbxakK6B8FDcd1MfTKaWzIZBUc-j1F73JCr41mCJ-xOaz6yBdxg3x0V7arQmp4zzS6qD2w/exec",
  DEMO_MODE: false
};


/* =====================================================
   CANDIDATES
   ===================================================== */

const CANDIDATES = {

  osis: [
    {
      id: "01",
      name: "Lailita Widya - Dea Anindita",
      role: "KETUA & WAKIL OSIS",
      initials: "01"
    },
    {
      id: "02",
      name: "Ata Afifatur - Bintang Resta",
      role: "KETUA & WAKIL OSIS",
      initials: "02"
    },
    {
      id: "03",
      name: "Quwais Al'Qornik - Oktaviola Syifara",
      role: "KETUA & WAKIL OSIS",
      initials: "03"
    }
  ],

  putra: [
    {
      id: "01",
      name: "Fattan Dwi Saputra",
      role: "PRADANA PUTRA",
      initials: "01"
    },
    {
      id: "02",
      name: "Mohammad Kian Prastyo",
      role: "PRADANA PUTRA",
      initials: "02"
    },
    {
      id: "03",
      name: "Muhammad Fa'iq Junivio",
      role: "PRADANA PUTRA",
      initials: "03"
    }
  ],

  putri: [
    {
      id: "01",
      name: "Kartika Maharani",
      role: "PRADANA PUTRI",
      initials: "01"
    },
    {
      id: "02",
      name: "Zevita Anggraena",
      role: "PRADANA PUTRI",
      initials: "02"
    },
    {
      id: "03",
      name: "Yenis Agustina  Kirana",
      role: "PRADANA PUTRI",
      initials: "03"
    }
  ]

};


/* =====================================================
   STATE
   ===================================================== */

const state = {
  token: "",
  osis: null,
  putra: null,
  putri: null
};


/* =====================================================
   SCREEN
   ===================================================== */

const screens = [
  ...document.querySelectorAll(".screen")
];

let current = "opening";


function showScreen(id, direction = "forward") {

  const next = document.getElementById(id);

  if (!next || id === current) return;

  const prev = document.getElementById(current);

  prev.classList.remove("active");

  if (direction === "back") {
    next.classList.add("exit-left");
  }

  requestAnimationFrame(() => {

    next.classList.add("active");
    next.classList.remove("exit-left");

  });

  current = id;
}


/* =====================================================
   NEXT / BACK BUTTON
   ===================================================== */

document
  .querySelectorAll("[data-next]")
  .forEach(button => {

    button.addEventListener("click", () => {

      showScreen(button.dataset.next);

    });

  });


document
  .querySelectorAll("[data-prev]")
  .forEach(button => {

    button.addEventListener("click", () => {

      showScreen(
        button.dataset.prev,
        "back"
      );

    });

  });


/* =====================================================
   RENDER CANDIDATES
   ===================================================== */

function renderCandidates(
  key,
  containerId,
  buttonId,
  stateKey
) {

  const wrap =
    document.getElementById(containerId);

  const button =
    document.getElementById(buttonId);


  wrap.innerHTML = CANDIDATES[key]
    .map(candidate => `

      <article
        class="candidate"
        data-id="${candidate.id}"
      >

        <div class="num">
          ${candidate.id}
        </div>

        <div class="avatar">
          ${candidate.initials}
        </div>

        <div class="info">

          <div class="name">
            ${candidate.name}
          </div>

          <div class="role">
            ${candidate.role}
          </div>

        </div>

        <div class="check">
          ✓
        </div>

      </article>

    `)
    .join("");


  wrap
    .querySelectorAll(".candidate")
    .forEach(card => {

      card.addEventListener("click", () => {

        wrap
          .querySelectorAll(".candidate")
          .forEach(item => {

            item.classList.remove("selected");

          });


        card.classList.add("selected");

        state[stateKey] =
          card.dataset.id;

        button.disabled = false;

      });

    });

}


/* =====================================================
   RENDER ALL CANDIDATES
   ===================================================== */

renderCandidates(
  "osis",
  "osisCandidates",
  "osisNext",
  "osis"
);

renderCandidates(
  "putra",
  "putraCandidates",
  "putraNext",
  "putra"
);

renderCandidates(
  "putri",
  "putriCandidates",
  "submitVote",
  "putri"
);


/* =====================================================
   NEXT VOTING SCREEN
   ===================================================== */

document
  .getElementById("osisNext")
  .onclick = () => {

    showScreen("pradanaPutra");

  };


document
  .getElementById("putraNext")
  .onclick = () => {

    showScreen("pradanaPutri");

  };


/* =====================================================
   TOKEN INPUT
   ===================================================== */

const tokenInput =
  document.getElementById("token");


tokenInput.addEventListener(
  "input",
  event => {

    event.target.value =
      event.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, "");

  }
);


/* =====================================================
   LOGIN
   ===================================================== */

document
  .getElementById("loginForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const token =
        tokenInput.value.trim();

      const status =
        document.getElementById(
          "loginStatus"
        );


      if (!token) {

        status.textContent =
          "Token wajib diisi.";

        return;

      }


      status.textContent =
        "Memeriksa token…";


      /* DEMO MODE */

      if (
        CONFIG.DEMO_MODE ||
        !CONFIG.API_URL
      ) {

        if (
          !/^TEST-\d{3}$/.test(token)
        ) {

          status.textContent =
            "Mode demo: gunakan TEST-001, TEST-002, atau TEST-003.";

          return;

        }


        state.token = token;

        status.textContent =
          "Token valid.";


        setTimeout(
          () => showScreen("osis"),
          250
        );

        return;

      }


      /* REAL API */

      try {

        const response =
          await api(
            "login",
            {
              code: token
            }
          );


        if (!response.success) {

          status.textContent =
            response.message ||
            "Token tidak valid.";

          return;

        }


        state.token = token;

        status.textContent =
          "Token valid.";


        setTimeout(
          () => showScreen("osis"),
          250
        );

      } catch (error) {

        status.textContent =
          "Gagal terhubung ke server.";

      }

    }
  );


/* =====================================================
   CONFIRMATION ELEMENTS
   ===================================================== */

const submitVote =
  document.getElementById("submitVote");

const confirmModal =
  document.getElementById("confirmModal");

const confirmCancel =
  document.querySelector(
    "[data-confirm-cancel]"
  );

const confirmSubmit =
  document.querySelector(
    "[data-confirm-submit]"
  );


/* =====================================================
   SUBMIT BUTTON
   BUKA POPUP, JANGAN LANGSUNG KIRIM
   ===================================================== */

submitVote.onclick = () => {

  if (submitVote.disabled) {
    return;
  }


  confirmModal.classList.add("show");

  confirmModal.setAttribute(
    "aria-hidden",
    "false"
  );

};


/* =====================================================
   CANCEL CONFIRMATION
   ===================================================== */

confirmCancel.onclick = () => {

  confirmModal.classList.remove("show");

  confirmModal.setAttribute(
    "aria-hidden",
    "true"
  );

};


/* =====================================================
   CONFIRM SUBMIT
   YA, KIRIM
   ===================================================== */

confirmSubmit.onclick = async () => {

  /* Tutup popup */

  confirmModal.classList.remove("show");

  confirmModal.setAttribute(
    "aria-hidden",
    "true"
  );


  /* Disable tombol */

  submitVote.disabled = true;

  submitVote.textContent =
    "MENGIRIM…";


  /* Data yang dikirim */

  const payload = {

    code: state.token,

    ketos: state.osis,

    pradanaPutra:
      state.putra,

    pradanaPutri:
      state.putri

  };


  /* =================================================
     DEMO MODE
     ================================================= */

  if (
    CONFIG.DEMO_MODE ||
    !CONFIG.API_URL
  ) {

    await new Promise(
      resolve =>
        setTimeout(resolve, 700)
    );


    showScreen("thanks");


    submitVote.textContent =
      "SUBMIT →";


    return;

  }


  /* =================================================
     KIRIM KE GOOGLE APPS SCRIPT
     ================================================= */

  try {

    const response =
      await api(
        "submitVote",
        payload
      );


    /* Kalau gagal */

    if (!response.success) {

      showToast(
        response.message ||
        "Voting gagal."
      );


      submitVote.disabled =
        false;

      submitVote.textContent =
        "SUBMIT →";


      return;

    }


    /* Kalau berhasil */

    showScreen("thanks");

  } catch (error) {

    showToast(
      "Server tidak dapat dihubungi."
    );


    submitVote.disabled =
      false;

    submitVote.textContent =
      "SUBMIT →";

  }

};


/* =====================================================
   API
   ===================================================== */

async function api(
  action,
  payload
) {

  const response =
    await fetch(
      CONFIG.API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify({
          action,
          ...payload
        })

      }
    );


  return await response.json();

}


/* =====================================================
   TOAST
   ===================================================== */

function showToast(text) {

  const toast =
    document.getElementById("toast");


  toast.textContent = text;

  toast.classList.add("show");


  setTimeout(
    () => {

      toast.classList.remove("show");

    },
    2500
  );

}