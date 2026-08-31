const API_URL =
  "https://script.google.com/macros/s/AKfycbxakK6B8FDcd1MfTKaWzIZBUc-j1F73JCr41mCJ-xOaz6yBdxg3x0V7arQmp4zzS6qD2w/exec";


/* =========================================
   NAMA CALON
   ========================================= */

const CANDIDATES = {

  osis: {
    "1": "Lailita Widya - Dea Anindita 01",
    "2": "Ata Afifatur - Bintang Resta 02",
    "3": "Quwais Al'qornik - Octaviola Syiara 03"
  },

  putra: {
    "1": "Fattan Dwi Saputra 01",
    "2": "Mohammad Kian Prastyo 02",
    "3": "Muhammad Fa'iq Junivio 03"
  },

  putri: {
    "1": "Kartika Maharani 01",
    "2": "Zevita Anggraena 02",
    "3": "Yenis Agustina  Kirana 03"
  }

};


/* =========================================
   ELEMENT HTML
   ========================================= */

const passcodeInput =
  document.getElementById("passcode");

const loadButton =
  document.getElementById("loadButton");

const refreshButton =
  document.getElementById("refreshButton");

const status =
  document.getElementById("status");

const resultsBox =
  document.getElementById("results");

const totalVotes =
  document.getElementById("totalVotes");

const osisResult =
  document.getElementById("osisResult");

const putraResult =
  document.getElementById("putraResult");

const putriResult =
  document.getElementById("putriResult");


/* =========================================
   AMBIL DATA DARI GOOGLE APPS SCRIPT
   ========================================= */

async function getResults(passcode) {

  const response = await fetch(API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify({

      action: "results",

      passcode: passcode

    })

  });


  const text =
    await response.text();


  console.log(
    "RAW RESPONSE:",
    text
  );


  const json =
    JSON.parse(text);


  console.log(
    "RESPONSE OBJECT:",
    json
  );


  return json;
}


/* =========================================
   BUAT BAR DIAGRAM
   ========================================= */

function createChart(
  container,
  data,
  names
) {

  container.innerHTML = "";


  if (!data) {

    container.innerHTML = `
      <p class="empty-result">
        DATA TIDAK DITEMUKAN
      </p>
    `;

    return;
  }


  const entries =
    Object.entries(data);


  if (entries.length === 0) {

    container.innerHTML = `
      <p class="empty-result">
        BELUM ADA SUARA
      </p>
    `;

    return;
  }


  const maxVotes =
    Math.max(
      ...entries.map(
        ([, value]) =>
          Number(value)
      ),
      1
    );


  entries.sort(
    (a, b) =>
      Number(b[1]) -
      Number(a[1])
  );


  entries.forEach(
    ([id, value]) => {

      const votes =
        Number(value);


      const percentage =
        (votes / maxVotes) * 100;


      const name =
        names[String(id)] ||
        `CALON ${id}`;


      const item =
        document.createElement("div");

      item.className =
        "bar-item";


      item.innerHTML = `

        <div class="bar-info">

          <span class="candidate-name">
            ${name}
          </span>

          <span class="vote-count">
            ${votes} SUARA
          </span>

        </div>

        <div class="bar-track">

          <div
            class="bar-fill"
            style="width: ${percentage}%"
          ></div>

        </div>

      `;


      container.appendChild(item);

    }
  );

}


/* =========================================
   TAMPILKAN HASIL KE HALAMAN
   ========================================= */

function displayResults(data) {

  console.log(
    "DATA UNTUK VISUAL:",
    data
  );


  /* TOTAL SUARA */

  totalVotes.textContent =
    data.total;


  /* HASIL OSIS */

  createChart(
    osisResult,
    data.ketos,
    CANDIDATES.osis
  );


  /* HASIL PRADANA PUTRA */

  createChart(
    putraResult,
    data.pradanaPutra,
    CANDIDATES.putra
  );


  /* HASIL PRADANA PUTRI */

  createChart(
    putriResult,
    data.pradanaPutri,
    CANDIDATES.putri
  );


  /* PASTIKAN HASIL TERLIHAT */

  resultsBox.style.display = "block";

  resultsBox.style.visibility = "visible";

  resultsBox.style.opacity = "1";


  console.log(
    "TOTAL YANG DITAMPILKAN:",
    totalVotes.textContent
  );

}


/* =========================================
   LOAD HASIL
   ========================================= */

async function loadResults() {

  const passcode =
    passcodeInput.value.trim();


  if (!passcode) {

    status.textContent =
      "PASSCODE WAJIB DIISI.";

    return;
  }


  status.textContent =
    "MENGAMBIL DATA HASIL VOTING...";


  loadButton.disabled = true;


  try {

    const response =
      await getResults(passcode);


    console.log(
      "DATA DARI API:",
      response.data
    );


    /*
      PENTING:

      API LO MENGIRIM:
      success: true

      BUKAN:
      ok: true
    */

    if (
      response.success !== true
    ) {

      status.textContent =
        response.message ||
        "PASSCODE SALAH.";

      return;
    }


    /* CEK DATA */

    if (
      !response.data
    ) {

      status.textContent =
        "DATA HASIL KOSONG.";

      return;
    }


    /*
      TAMPILKAN DATA KE HTML
    */

    displayResults(
      response.data
    );


    status.textContent =
      "HASIL BERHASIL DIMUAT.";


  } catch (error) {

    console.error(
      "ERROR HASIL VOTING:",
      error
    );


    status.textContent =
      "GAGAL MENAMPILKAN HASIL: " +
      error.message;

  }


  finally {

    loadButton.disabled = false;

  }

}


/* =========================================
   TOMBOL LIHAT HASIL
   ========================================= */

loadButton.addEventListener(
  "click",
  loadResults
);


/* =========================================
   TOMBOL REFRESH
   ========================================= */

refreshButton.addEventListener(
  "click",
  loadResults
);


/* =========================================
   ENTER DI PASSWORD
   ========================================= */

passcodeInput.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Enter"
    ) {

      loadResults();

    }

  }
);