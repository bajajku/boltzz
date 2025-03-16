import dotenv from 'dotenv';
import express from 'express';
import Anthropic from "@anthropic-ai/sdk";
import cors from 'cors';



dotenv.config();
const anthropic = new Anthropic();
const app = express();

app.use(cors());

app.use(express.json());
