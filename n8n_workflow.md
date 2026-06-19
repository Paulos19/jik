# n8n Workflow Import - JiK AI Agent & RAG HTTP Tool

This document contains the JSON file needed to import the workflow directly into your n8n instance, followed by configuration instructions.

## n8n Workflow JSON (Copy and Paste to Import)

To import this workflow:
1. Copy the JSON code block below.
2. In your n8n dashboard, click **"Add workflow"** or open an existing one.
3. Click anywhere in the editor and press **`Ctrl + V`** (or `Cmd + V` on macOS) to paste and import all nodes and connections automatically.

```json
{
  "name": "JiK Chatbot Agent with Admin RAG Tool",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "jik",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "2db4ee30-ef54-46c5-af47-2b36a18d1a1b",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        380,
        240
      ]
    },
    {
      "parameters": {
        "options": {
          "systemMessage": "Você é o Tutor IA, um assistente virtual e tutor educacional da plataforma JiK. Seu propósito é guiar estudantes e membros de grupos de estudos com seriedade intelectual, rigor pedagógico e empatia. Ajude a estruturar planos de estudos, aclare conceitos complexos e ensine técnicas seculares de aprendizado eficaz (como a Técnica Feynman, Pomodoro, Revisão Espaçada e Fichamento).\n\nQuando necessário, use a ferramenta de instruções do administrador (fetch_admin_instructions) para buscar diretrizes, cronogramas, materiais e orientações oficiais configuradas pela liderança. Se o usuário fizer uma pergunta sobre regras, materiais específicos, prazos ou cronogramas oficiais da comunidade, você DEVE acionar a ferramenta. Seja sempre ético, secular e encorajador."
        }
      },
      "id": "cbfb9b00-34be-4171-872e-06ea82a46618",
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [
        600,
        240
      ]
    },
    {
      "parameters": {
        "model": "gpt-4o-mini",
        "options": {
          "temperature": 0.7
        }
      },
      "id": "90eb1dae-28b9-4d2a-888e-17cf3665cd98",
      "name": "OpenAI Chat Model",
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1,
      "position": [
        480,
        460
      ],
      "credentials": {
        "openAiApi": {
          "id": "YOUR_OPENAI_CREDENTIALS_ID",
          "name": "OpenAI Account"
        }
      }
    },
    {
      "parameters": {
        "sessionKey": "={{$json.body.sessionId}}",
        "redisHost": "YOUR_REDIS_HOST",
        "redisPort": 6379,
        "redisPassword": "YOUR_REDIS_PASSWORD",
        "ttl": 86400
      },
      "id": "b3040375-8120-410a-b333-db7d4715910c",
      "name": "Redis Chat Memory",
      "type": "@n8n/n8n-nodes-langchain.memoryRedis",
      "typeVersion": 1.1,
      "position": [
        620,
        460
      ]
    },
    {
      "parameters": {
        "name": "fetch_admin_instructions",
        "description": "Use esta ferramenta para buscar as orientações, diretrizes, materiais de estudo e instruções oficiais do administrador no painel. Acione sempre que o estudante perguntar sobre prazos, cronogramas específicos, regras ou avisos da coordenação.",
        "url": "http://localhost:3000/api/admin/agent-instructions",
        "method": "GET",
        "options": {}
      },
      "id": "1b18d2da-de75-4d76-bc3e-bf5a8f572a15",
      "name": "HTTP Request Tool",
      "type": "@n8n/n8n-nodes-langchain.toolHttpRequest",
      "typeVersion": 1.1,
      "position": [
        780,
        460
      ]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "{\n  \"reply\": \"{{ $json.output }}\"\n}",
        "options": {}
      },
      "id": "f5cba270-2032-4752-b1c4-279c6dcd376c",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        920,
        240
      ]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "AI Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "AI Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Redis Chat Memory": {
      "ai_memory": [
        [
          {
            "node": "AI Agent",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "HTTP Request Tool": {
      "ai_tool": [
        [
          {
            "node": "AI Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "AI Agent": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1"
  }
}
```

---

## Configuration & Customization Guide

### 1. Webhook Configuration
- The endpoint is configured with path `jik`.
- When using n8n in **Production**, the webhook path is:
  `https://n8n-n8n.qqfurw.easypanel.host/webhook/jik`
- Set `N8N_CHATBOT_WEBHOOK_URL` in your `.env` file to this production URL to connect the Next.js chat system with n8n:
  ```env
  N8N_CHATBOT_WEBHOOK_URL=https://n8n-n8n.qqfurw.easypanel.host/webhook/jik
  ```

### 2. OpenAI / LLM Credentials
- In n8n, click the **OpenAI Chat Model** node and set up your OpenAI credentials by pasting your `OPENAI_API_KEY`.
- You can easily swap this node for a **Google Gemini Chat Model** (`@n8n/n8n-nodes-langchain.lmChatGoogleGemini`) or **Groq Chat Model** depending on your model preference.

### 3. Redis Chat Memory Configuration
- Double-click the **Redis Chat Memory** node in n8n.
- Fill in your `redisHost`, `redisPort`, and `redisPassword` to point to your Redis instance.
- The `sessionKey` parameter is preset to `={{$json.body.sessionId}}`. This dynamically scopes conversational context to each channel and user, ensuring absolute state privacy.

### 4. HTTP Request Tool (Admin RAG Integration)
- The default URL is set to `http://localhost:3000/api/admin/agent-instructions`.
- When deploying the Next.js project to production (e.g., Vercel), double-click the **HTTP Request Tool** node in n8n and update the URL to your live domain:
  `https://your-production-domain.com/api/admin/agent-instructions`
