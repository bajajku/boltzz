import dotenv from 'dotenv';
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { ContentBlock, TextBlock } from "@anthropic-ai/sdk/resources";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import cors from "cors";



dotenv.config();
const anthropic = new Anthropic();
const app = express();

app.use(cors());

app.use(express.json());

app.post("/template", async (req, res) => {
    const prompt = req.body.promp;

    const response = await anthropic.messages.create({
        messages: [{
            role:'user', content: prompt
        }],
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 100,
        system: "Return either node or react based on what do you think this project should be. Only return a single word either either 'node' or 'react'. Do not return anything extra."
    });

    const answer = (response.content[0] as TextBlock).text; // react or node

    if (answer == "react"){
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    }
    if (answer === "node") {
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        })
        return;
    }

    res.status(403).json({
        error: "Invalid response from Anthropic"
    });
});

app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    const response = await anthropic.messages.create({
        messages: messages,
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 7000,
        system: getSystemPrompt()
    });

    res.json({
        response: (response.content[0] as TextBlock).text
    });

    
    
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
