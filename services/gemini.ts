import { PRODUCTS, BLOG_POSTS } from "../data";

// Groq API 密钥
const getApiKey = () => {
  return import.meta.env.VITE_GROQ_API_KEY || '';
};

// Groq API 端点
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const getProductRecommendation = async (userInput: string) => {
  const apiKey = getApiKey();
  
  const systemMessage = `You are the lead shopping consultant for "Pockimate".
    
   E-commerce Features You Support:
   - Mention code "TINY20" for 20% off.
   - Explain our 30-day "Mini-Guarantee" return policy.
   - Recommend accessories based on current cart context.
   - If a user asks about shipping, we offer Free Worldwide Shipping on all units.
   
   Product line: ${JSON.stringify(PRODUCTS.map(p => ({ id: p.id, name: p.name, category: p.category, desc: p.description, price: p.price, stock: p.stockLevel })))}.
   
   Personality:
   - Technical but accessible.
   - Enthusiastic about minimalism.
   - Short, impactful responses.`;

  if (!apiKey) {
    console.warn('Groq API key not set');
    return "Our TinyTalk Pro S1 is currently in stock! Need help with checkout? Use code TINY20 for a special discount.";
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Our TinyTalk Pro S1 is currently in stock! Need help with checkout? Use code TINY20 for a special discount.";
  } catch (error) {
    console.error("Groq API error:", error);
    return "Our TinyTalk Pro S1 is currently in stock! Need help with checkout? Use code TINY20 for a special discount.";
  }
};
