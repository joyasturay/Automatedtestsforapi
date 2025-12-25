import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { codeSnippet, targetUrl } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // or gemini-1.5-flash-latest
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are a Senior QA Engineer. Analyze this Next.js API Route carefully:
      ${codeSnippet}

      I need two things:
      1. UI Test Cases (JSON array)
      2. A robust Jest test file (String)

      RETURN THIS JSON STRUCTURE:
      {
        "uiTestCases": [ { "name": "...", "input": {...}, "expectedStatus": 200 } ],
        "testFileContent": "..."
      }

      *** CRITICAL RULES FOR 'testFileContent' ***
      1. Use CommonJS: const axios = require('axios');
      2. Setup: jest.setTimeout(10000); const API_URL = '${targetUrl}';
      3. ASSERTION LOGIC (DO NOT BREAK THIS):
         - NEVER compare response.data to a string (e.g. .toBe('Login Success')).
         - ALWAYS compare response.data to an OBJECT (e.g. .toEqual({ success: true })).
         - Look at the NextResponse.json() body in the code. If it is { error: "Msg" }, the test MUST expect { error: "Msg" }.

      4. HANDLING ERRORS (400/500):
         - Do NOT use 'expect(...).rejects.toHaveProperty'. It is flaky with objects.
         - Use this TRY/CATCH pattern for error cases:
           
           test('should fail...', async () => {
             try {
               await axios.post(API_URL, { ...badInput });
             } catch (error) {
               expect(error.response.status).toBe(400);
               expect(error.response.data).toEqual({ error: "The Exact Error String From Code" }); 
             }
           });

      5. SUCCESS CASES:
         expect(response.status).toBe(200);
         expect(response.data).toEqual({ success: true }); // Or whatever the actual JSON body is
    `;

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());

    return NextResponse.json({ tests: data });
    
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}