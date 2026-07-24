const { OpenAI } = require('openai');

let openai = null;

function initOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

async function generateCode(prompt, language = 'javascript') {
  try {
    const client = initOpenAI();
    if (!client) throw new Error('OpenAI API key not configured');
    
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `You are a coding assistant. Generate ${language} code.` },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI generate error:', error);
    return `// AI generation error: ${error.message}`;
  }
}

async function explainCode(code, language = 'javascript') {
  try {
    const client = initOpenAI();
    if (!client) throw new Error('OpenAI API key not configured');
    
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a code explainer. Explain the following code clearly.' },
        { role: 'user', content: `Explain this ${language} code:\n\n${code}` }
      ],
      max_tokens: 300,
      temperature: 0.5
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI explain error:', error);
    return `Explanation error: ${error.message}`;
  }
}

async function fixCode(code, error, language = 'javascript') {
  try {
    const client = initOpenAI();
    if (!client) throw new Error('OpenAI API key not configured');
    
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a code debugger. Fix the code and explain the fix.' },
        { role: 'user', content: `Fix this ${language} code. Error: ${error}\n\n${code}` }
      ],
      max_tokens: 500,
      temperature: 0.3
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI fix error:', error);
    return `// AI fix error: ${error.message}`;
  }
}

async function chat(message) {
  try {
    const client = initOpenAI();
    if (!client) throw new Error('OpenAI API key not configured');
    
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful coding assistant. Answer questions about programming.' },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI chat error:', error);
    return `Chat error: ${error.message}`;
  }
}

module.exports = { generateCode, explainCode, fixCode, chat };
