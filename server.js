const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const CHITKARA_EMAIL = "tanya2545.be23@chitkara.edu.in";

const isPrime = (num) => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) if (num % i === 0) return false;
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: CHITKARA_EMAIL,
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    if (keys.length !== 1) {
      return res
        .status(400)
        .json({ is_success: false, message: "Exactly one key required" });
    }

    const key = keys[0];
    const input = req.body[key];
    let resultData;

    switch (key) {
      case "fibonacci":
        const n = parseInt(input);
        let fib = [0, 1];
        for (let i = 2; i < n; i++) fib.push(fib[i - 1] + fib[i - 2]);
        resultData = fib.slice(0, n);
        break;

      case "prime":
        resultData = input.filter((n) => isPrime(n));
        break;

      case "lcm":
        resultData = input.reduce((a, b) => lcm(a, b));
        break;

      case "hcf":
        resultData = input.reduce((a, b) => gcd(a, b));
        break;

      case "AI":
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
        const prompt = `${input}\nAnswer in exactly one word.`;
        const result = await model.generateContent(prompt);

        resultData = result.response
          .text()
          .trim()
          .split(" ")[0]
          .replace(/[^a-zA-Z]/g, "");

        break;

      default:
        return res
          .status(400)
          .json({ is_success: false, message: "Invalid key" });
    }

    res.status(200).json({
      is_success: true,
      official_email: CHITKARA_EMAIL,
      data: resultData,
    });
  } catch (error) {
    res.status(500).json({ is_success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
