'use server';

import OpenAI from "openai";

function setupOpenAI() {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }
    return new OpenAI({apiKey: process.env.OPENAI_API_KEY});
}


type output = {title: string, content: any}
const adfSchema = `
{
  "version": 1,
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {
        "level": 1 // 1-6
      },
      "content": [
        {
          "type": "text",
          "text": "tst"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "test abc d 123 123123123"
        }
      ]
    },
    {
      "type": "bulletList | orderedList", 
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "123ss"
                }
              ]
            }
          ]
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "123d"
                }
              ]
            }
          ]
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "1233"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "asdasdsad ",
          "marks": [ // optional marks can be applied to text nodes, you can have multiple marks or none
            {
              "type": "em"
            },
            {
              "type": "strong"
            },
            {
              "type": "strike"
            },
            {
              "type": "underline"
            },
            {
              "type": "subsup",
              "attrs": {
                "type": "sup"
              }
            },
            {
              "type": "subsup",
              "attrs": {
                "type": "sub"
              }
            },
            {
              "type": "textColor",
              "attrs": {
                "color": "#0747a6"
              }
            },
            {
              "type": "link",
              "attrs": {
                "href": "http://www.google.com"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "rule" // horizontal line
    }
  ]
}`
export async function getTicketDetails(operation: 'Update' | 'Install' | 'Uninstall', context: any): Promise<output> {
    const openai = setupOpenAI();
    const fallBackOutput = {title: '', content: ''};
    if(context?.name) {
        fallBackOutput.title = `${operation} a new ticket for ${context.name}`;
    }
    console.log("openai", openai, process.env.OPENAI_API_KEY);
    if(!openai) {
        console.error('OpenAI not setup');
        return fallBackOutput;
    }
    const aiContextString = JSON.stringify(context);
    const createTicketPrompt = `
        Given the context, please provide jira ticket details for ${operation}.
        
        Context:
            ${aiContextString}
        Notes:
            - Operation is a string that describes the operation that the ticket is related to. for example: "Create a new user", "Update plugin/module", "Fix a bug", etc.
            - Please provide the title and content of the ticket.
            - The ticket should be related to the operation.
            - The ticket should be detailed and informative.
            - Don't add code snippets to the ticket content.
            - Use HTML for the ticket content
            - Only use html tags h1-h6, p, ul, ol, li, em, strong, strike, u, sup, sub, a, span
            - Output should be in the following JSON format: {title: string, content: string}
    `;

    const aiCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: "You are a project manager, and you are great at writing tickets for project management tools."
            },
            {
                role: 'user',
                content: createTicketPrompt,
            },
        ],
        response_format: {
            type: 'json_object'
        },
        temperature: 1
    });

    console.log("AI Output", JSON.stringify(aiCompletion, null, 2));

    if (aiCompletion?.choices?.[0]?.message?.content) {
        console.log('AI output', aiCompletion.choices[0].message.content);
        try {
            const jsonOutput = JSON.parse(aiCompletion.choices[0].message.content);
            console.log('Parsed AI output', jsonOutput);
            return jsonOutput as output;
        } catch (e) {
            console.error('Failed to parse AI output', e);
        }
    }
    return fallBackOutput;
}