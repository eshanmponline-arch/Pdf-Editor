<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Shree Shyam Digital Tools</title>

  <link rel="stylesheet" href="style.css">

  <!-- QR Code library - API नहीं, browser में library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>

<body>

<header class="header">

  <div class="logo">
    <div class="logo-icon">ॐ</div>
    <div>
      <h1>Shree Shyam</h1>
      <p>Digital Tools</p>
    </div>
  </div>

  <button class="menu-btn" onclick="toggleMenu()">☰</button>

</header>


<nav id="menu">

  <a href="#home">🏠 Home</a>
  <a href="#photo">🖼️ Photo Tools</a>
  <a href="#pdf">📄 Image → PDF</a>
  <a href="#calculator">🔢 Calculator</a>
  <a href="#qr">🔲 QR Code</a>
  <a href="#text">📝 Text Counter</a>

</nav>


<main id="home">

  <section class="hero">

    <div>

      <span class="badge">100% Browser Based</span>

      <h2>
        आपके सभी Digital Tools
        <span>एक ही जगह</span>
      </h2>

      <p>
        Photo, PDF, Calculator, QR Code और कई उपयोगी tools
        बिना किसी API के इस्तेमाल करें।
      </p>

      <a href="#tools" class="start-btn">
        🚀 Tools इस्तेमाल करें
      </a>

    </div>

  </section>


  <section id="tools" class="section">

    <h2 class="section-title">🛠️ Digital Tools</h2>

    <div class="tools-grid">

      <div class="tool-card" onclick="showTool('photo')">
        <div class="tool-icon">🖼️</div>
        <h3>Photo Resize</h3>
        <p>Photo का size बदलें</p>
      </div>

      <div class="tool-card" onclick="showTool('compress')">
        <div class="tool-icon">🗜️</div>
        <h3>Photo Compress</h3>
        <p>Photo की size कम करें</p>
      </div>

      <div class="tool-card" onclick="showTool('pdf')">
        <div class="tool-icon">📄</div>
        <h3>Image → PDF</h3>
        <p>Images को PDF बनाएं</p>
      </div>

      <div class="tool-card" onclick="showTool('calculator')">
        <div class="tool-icon">🔢</div>
        <h3>Percentage</h3>
        <p>Percentage निकालें</p>
      </div>

      <div class="tool-card" onclick="showTool('age')">
        <div class="tool-icon">🎂</div>
        <h3>Age Calculator</h3>
        <p>उम्र निकालें</p>
      </div>

      <div class="tool-card" onclick="showTool('qr')">
        <div class="tool-icon">🔲</div>
        <h3>QR Generator</h3>
        <p>QR Code बनाएं</p>
      </div>

      <div class="tool-card" onclick="showTool('text')">
        <div class="tool-icon">📝</div>
        <h3>Text Counter</h3>
        <p>Words और Characters गिनें</p>
      </div>

      <div class="tool-card" onclick="showTool('print')">
        <div class="tool-icon">🖨️</div>
        <h3>Print Photo</h3>
        <p>Photo को print size में तैयार करें</p>
      </div>

    </div>

  </section>


  <!-- PHOTO RESIZE -->

  <section id="photoTool" class="tool-section">

    <button class="close-btn" onclick="closeTools()">✕ बंद करें</button>

    <h2>🖼️ Photo Resize / Compress</h2>

    <input type="file" id="photoInput" accept="image/*">

    <div class="settings">

      <label>
        Width (px)
        <input type="number" id="photoWidth" value="1000">
      </label>

      <label>
        Height (px)
        <input type="number" id="photoHeight" value="1000">
      </label>

      <label>
        Quality
        <input type="range" id="quality" min="10" max="100" value="90"
          oninput="qualityValue.innerText=this.value+'%'">
        <span id="qualityValue">90%</span>
      </label>

    </div>

    <button class="primary-btn" onclick="resizePhoto()">
      ✨ Photo तैयार करें
    </button>

    <canvas id="photoCanvas"></canvas>

    <br>

    <a id="photoDownload" class="download-btn" download="shree-shyam-photo.jpg">
      💾 Download Photo
    </a>

  </section>


  <!-- IMAGE TO PDF -->

  <section id="pdfTool" class="tool-section">

    <button class="close-btn" onclick="closeTools()">✕ बंद करें</button>

    <h2>📄 Images → PDF</h2>

    <input type="file" id="pdfImages" accept="image/*" multiple>

    <p class="info">
      एक या एक से ज्यादा photos select करें।
    </p>

    <button class="primary-btn" onclick="createPDF()">
      📄 PDF बनाएं
    </button>

    <canvas id="pdfCanvas" style="display:none;"></canvas>

    <a id="pdfDownload" class="download-btn" download="shree-shyam-document.pdf">
      💾 Download PDF
    </a>

  </section>


  <!-- CALCULATORS -->

  <section id="calculatorTool" class="tool-section">

    <button class="close-btn" onclick="closeTools()">✕ बंद करें</button>

    <h2>🔢 Percentage Calculator</h2>

    <input type="number" id="obtained" placeholder="प्राप्त अंक">

    <input type="number" id="total" placeholder="कुल अंक">

    <button class="primary-btn" onclick="calculatePercentage()">
      Calculate
    </button>

    <div id="percentageResult" class="result"></div>

  </section>


  <!-- AGE -->

  <section id="ageTool" class="tool-section">

    <button class="close-btn" onclick="closeTools()">✕ बंद करें</button>

    <h2>🎂 Age Calculator</h2>

    <label>जन्म तारीख</label>

    <input type="date" id="dob">

    <button class="primary-btn" onclick="calculateAge()">
      उम्र निकालें
    </button>

    <div id="ageResult" class="result"></div>

  </section>


  <!-- QR -->

  <section id="qrTool" class="tool-section">

    <button class="close-btn" onclick="closeTools()">✕ बंद करें</button>

    <h2>🔲 QR Code Generator</h2>

    <textarea id="qrText"
      placeholder="यहाँ Text या Website URL लिखें"></textarea>

    <button class="primary-btn" onclick="generateQR()">
      🔲 QR बनाएं
    </button>

    <div id="qrcode"></div>

    <button class="download-btn" onclick="downloadQR()">
      💾 Download QR
    </button>

  </section>


  <!-- TEXT COUNTER -->

  <section id="textTool" class="tool-section">

    <button class="close-btn" onclick="closeTools()">✕ बंद करें</button>

    <h2>📝 Text Counter</h2>

    <textarea id="counterText"
      placeholder="यहाँ अपना text लिखें..."
      oninput="countText()"></textarea>

    <div class="counter">

      <div>
        <b id="wordCount">0</b>
        <span>Words</span>
      </div>

      <div>
        <b id="charCount">0</b>
        <span>Characters</span>
      </div>

    </div>

  </section>


  <!-- PRINT PHOTO -->

  <section id="printTool" class="tool-section">

    <button class="close-btn" onclick="closeTools()">✕ बंद करें</button>

    <h2>🖨️ Print Photo Maker</h2>

    <input type="file" id="printInput" accept="image/*">

    <select id="printSize">

      <option value="passport">Passport Photo</option>
      <option value="id">ID Photo</option>
      <option value="stamp">Stamp Size</option>

    </select>

    <button class="primary-btn" onclick="makePrintPhoto()">
      🖨️ Photo तैयार करें
    </button>

    <canvas id="printCanvas"></canvas>

    <br>

    <a id="printDownload"
      class="download-btn"
      download="print-photo.jpg">
      💾 Download
    </a>

  </section>


</main>


<footer>

  <h3>🙏 Shree Shyam Digital Tools</h3>

  <p>
    Simple • Fast • Free • Browser Based
  </p>

  <p>
    © 2026 Shree Shyam Digital Studio
  </p>

</footer>


<script src="script.js"></script>

</body>
</html>
