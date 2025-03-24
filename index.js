const express = require("express");
const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const port = 3000;

// Function: Google Search Using Puppeteer
async function getGoogleAnswer(query) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Google Search Open Karein
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
        waitUntil: "domcontentloaded",
    });

    // Result Extract Karein
    let answer = await page.evaluate(() => {
        let snippet = document.querySelector(".hgKElc") || 
                      document.querySelector(".kno-rdesc span") || 
                      document.querySelector(".BNeawe.iBp4i.AP7Wnd") || 
                      document.querySelector(".BNeawe.s3v9rd.AP7Wnd");
        return snippet ? snippet.innerText : "Mujhe jawab nahi mila.";
    });

    await browser.close();
    return answer;
}

// Route: Question Se Answer & TTS
app.get("/ask", async (req, res) => {
    const question = req.query.q;
    if (!question) return res.status(400).send("Query parameter 'q' chahiye!");

    const answer = await getGoogleAnswer(question);
    const ttsFile = "answer.mp3";

    exec(`espeak -w ${ttsFile} "${answer}"`, (err) => {
        if (err) return res.status(500).send("TTS conversion failed!");

        res.sendFile(__dirname + `/${ttsFile}`);
    });
});

// Server Start
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
