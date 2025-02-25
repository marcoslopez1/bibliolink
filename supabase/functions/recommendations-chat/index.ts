
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Language detection helper
function detectLanguage(text: string): "es" | "en" {
  // Common Spanish words and patterns
  const spanishWords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'que', 'en', 'de', 'por', 'con', 'para', 'está', 'este', 'esta', 'estos', 'estas', 'libro', 'autor'];
  
  const words = text.toLowerCase().split(/\s+/);
  let spanishCount = 0;
  
  for (const word of words) {
    if (spanishWords.includes(word)) {
      spanishCount++;
    }
  }
  
  return spanishCount / words.length > 0.15 ? "es" : "en";
}

// System messages by language
const systemMessages = {
  en: {
    greeting: "You are a friendly and enthusiastic library assistant! Keep your responses short (2-3 sentences max) and always use emojis to make them engaging. Use 📚 for book recommendations, 👋 for greetings, ⭐ for highlights, and other relevant emojis.",
    bookListIntro: "Here are the CURRENTLY AVAILABLE books in our catalog that can be borrowed right now:",
    instructions: `Important instructions:
1. ONLY recommend books that are marked as AVAILABLE in our catalog above - these are the only ones that can be borrowed
2. When mentioning any book from our catalog, you MUST use this exact format: "Book Title" (ID: BOOKID)
3. If you mention books that are NOT in our available catalog:
   - You MUST clearly state "This book is not currently available in our catalog"
   - Do NOT include an ID for unavailable books
   - Suggest similar available books instead
4. Focus on recommending AVAILABLE books that match the user's interests
5. Always start responses with a relevant emoji
6. Keep responses brief and friendly
7. Use bullet points for multiple recommendations
8. ALWAYS respond in English`,
  },
  es: {
    greeting: "¡Soy un asistente de biblioteca amigable y entusiasta! Mantendré mis respuestas cortas (2-3 oraciones máximo) y siempre usaré emojis para hacerlas más atractivas. Uso 📚 para recomendaciones, 👋 para saludos, ⭐ para destacados, y otros emojis relevantes.",
    bookListIntro: "Aquí están los libros ACTUALMENTE DISPONIBLES en nuestro catálogo que se pueden pedir prestados:",
    instructions: `Instrucciones importantes:
1. SOLO recomendar libros marcados como DISPONIBLES en nuestro catálogo anterior - estos son los únicos que se pueden pedir prestados
2. Al mencionar cualquier libro de nuestro catálogo, DEBES usar este formato exacto: "Título del Libro" (ID: BOOKID)
3. Si mencionas libros que NO están en nuestro catálogo disponible:
   - DEBES indicar claramente "Este libro no está disponible actualmente en nuestro catálogo"
   - NO incluir un ID para libros no disponibles
   - Sugerir libros disponibles similares en su lugar
4. Centrarse en recomendar libros DISPONIBLES que coincidan con los intereses del usuario
5. Siempre comenzar las respuestas con un emoji relevante
6. Mantener las respuestas breves y amigables
7. Usar viñetas para múltiples recomendaciones
8. SIEMPRE responder en Español`,
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    
    // Detect language from user's message
    const language = detectLanguage(message);
    const messages = systemMessages[language];

    // Fetch ONLY available books from the database
    const booksResponse = await fetch(`${SUPABASE_URL}/rest/v1/books?select=*&status=eq.available`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    })

    if (!booksResponse.ok) {
      throw new Error('Failed to fetch books')
    }

    const books = await booksResponse.json()

    // Create system message with available books
    const systemMessage = {
      role: "system",
      content: `${messages.greeting}

${messages.bookListIntro}

${books.map(book => (
  `- "${book.title}" by ${book.author} (ID: ${book.book_id})
    Genre: ${book.genre}
    Category: ${book.category}
    Building: ${book.building}
    Pages: ${book.pages}`
)).join('\n\n')}

${messages.instructions}`
    }

    // Request completion from Mistral
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-medium',
        messages: [
          systemMessage,
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Mistral AI')
    }

    const result = await response.json()
    const aiMessage = result.choices[0].message.content

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in recommendations-chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
