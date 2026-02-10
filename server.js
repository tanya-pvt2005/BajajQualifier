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
const lcm = (a, b) => (a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b));

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
      return res.status(400).json({
        is_success: false,
        message: "Request must contain exactly one valid functional key.",
      });
    }

    const key = keys[0];
    const input = req.body[key];
    let resultData;

    switch (key) {
      case "fibonacci":
        const n = parseInt(input);
        if (isNaN(n) || n < 1)
          throw new Error("Invalid input for fibonacci series.");
        let fib = [0, 1];
        for (let i = 2; i < n; i++) fib.push(fib[i - 1] + fib[i - 2]);
        resultData = n === 1 ? [0] : fib.slice(0, n);
        break;

      case "prime":
        if (!Array.isArray(input))
          throw new Error("Input must be an integer array.");
        resultData = input.filter((n) => typeof n === "number" && isPrime(n));
        break;

      case "lcm":
        if (!Array.isArray(input) || input.length === 0)
          throw new Error("Input must be a non-empty integer array.");
        resultData = input.reduce((a, b) => lcm(a, b));
        break;

      case "hcf":
        if (!Array.isArray(input) || input.length === 0)
          throw new Error("Input must be a non-empty integer array.");
        resultData = input.reduce((a, b) => gcd(a, b));
        break;

      case "AI":
        if (typeof input !== "string")
          throw new Error("AI input must be a question string.");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Answer the following question in exactly one word: ${input}`;
        const result = await model.generateContent(prompt);
        resultData = result.response.text().trim().replace(/[.,!]/g, "");
        break;

      default:
        return res
          .status(400)
          .json({
            is_success: false,
            message: "Invalid functional key provided.",
          });
    }

    res.status(200).json({
      is_success: true,
      official_email: CHITKARA_EMAIL,
      data: resultData,
    });
  } catch (error) {
    res.status(400).json({
      is_success: false,
      official_email: CHITKARA_EMAIL,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
