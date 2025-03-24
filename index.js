const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

const app = express();

app.get("/ask", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${req.query.q}`);

    const answer = await page.evaluate(() => {
      const result = document.querySelector(".hgKElc");
      return result ? result.innerText : "Koi jawab nahi mila.";
    });

    await browser.close();
    res.send({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = app;
