const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateProblem = async (settings) => {
  const prompt = `
    You are an expert competitive programming problem setter. 
    Generate a unique coding problem based on these parameters:
    - Difficulty: ${settings.difficulty}
    - Language: ${settings.language}
    - Type: ${settings.type}

    IMPORTANT: 
    1. The "boilerplate" MUST be a LeetCode-style function signature for ${settings.language} (e.g., 'function solve(input) { ... }' or 'def solve(data):').
    2. The "execution_wrapper" MUST be a hidden piece of code that reads from Standard Input (stdin), calls the user's 'solve' function with the parsed input, and prints the return value EXACTLY to Standard Output (stdout).
    3. The "complete_solution" MUST be a correct implementation of the solve function.

    Return EXACTLY a JSON object:
    {
      "title": "String",
      "description": "Markdown string (Problem, Input, Output, Examples)",
      "constraints": ["String"],
      "boilerplate": "The function signature only",
      "execution_wrapper": "Full code that wraps the user function to handle I/O",
      "complete_solution": "The correct solve function code",
      "test_cases": [
        { "input": "String", "expected": "String", "hidden": false },
        { "input": "String", "expected": "String", "hidden": false },
        { "input": "String", "expected": "String", "hidden": true }
      ]
    }
  `;



  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    return JSON.parse(text);
  } catch (error) {
    console.error("Groq AI Generation Error:", error);
    throw error;
  }
};

module.exports = { generateProblem };
