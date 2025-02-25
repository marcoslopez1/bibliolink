
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple language detection function
function detectLanguage(text: string): "es" | "en" {
  // Common Spanish words
  const spanishWords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'que', 'en', 'de', 'por', 'con', 'para', 'está', 'este', 'esta', 'estos', 'estas'];
  
  const words = text.toLowerCase().split(/\s+/);
  let spanishCount = 0;
  
  for (const word of words) {
    if (spanishWords.includes(word)) {
      spanishCount++;
    }
  }
  
  return spanishCount / words.length > 0.15 ? "es" : "en";
}

// Get system message based on language
function getSystemMessage(books: any[], language: "es" | "en") {
  const baseInstructions = {
    en: {
      greeting: "You are a friendly and enthusiastic library assistant! Keep your responses short (2-3 sentences max) and always use emojis to make them engaging. Use 📚 for book recommendations, 👋 for greetings, ⭐ for highlights, and other relevant emojis like 💡 for suggestions.",
      instructions: `Important instructions:
1. Only recommend books from the above list - these are the only ones available for borrowing
2. When mentioning any book from our catalog, ALWAYS include its ID using this exact format: "Book Title" (ID: BOOKID)
3. If you mention books that are not in our catalog (for context or comparison):
   - Clearly state that they are "not available in our catalog"
   - Do NOT include an ID for these books
4. Start all responses with a relevant emoji
5. Keep responses brief and friendly
6. Use bullet points for multiple recommendations
7. Use emojis to highlight key features or genres
8. ALWAYS respond in English`
    },
    es: {
      greeting: "¡Soy un asistente de biblioteca amigable y entusiasta! Mantendré mis respuestas cortas (2-3 oraciones máximo) y siempre usaré emojis para hacerlas más atractivas. Uso 📚 para recomendaciones de libros, 👋 para saludos, ⭐ para destacados, y otros emojis relevantes como 💡 para sugerencias.",
      instructions: `Instrucciones importantes:
1. Solo recomendar libros de la lista anterior - estos son los únicos disponibles para préstamo
2. Al mencionar cualquier libro de nuestro catálogo, SIEMPRE incluir su ID usando este formato exacto: "Título del Libro" (ID: BOOKID)
3. Si mencionas libros que no están en nuestro catálogo (para contexto o comparación):
   - Indicar claramente que "no están disponibles en nuestro catálogo"
   - NO incluir un ID para estos libros
4. Comenzar todas las respuestas con un emoji relevante
5. Mantener las respuestas breves y amigables
6. Usar viñetas para múltiples recomendaciones
7. Usar emojis para resaltar características o géneros clave
8. SIEMPRE responder en Español`
    }
  };

  const booksSection = books.map(book => (
    `- "${book.title}" by ${book.author} (ID: ${book.book_id})
    Genre: ${book.genre}
    Category: ${book.category}
    Building: ${book.building}
    Pages: ${book.pages}`
  )).join('\n\n');

  return {
    role: "system",
    content: `${baseInstructions[language].greeting}

Here are the AVAILABLE books in our catalog that can be borrowed right now:

${booksSection}

${baseInstructions[language].instructions}`
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    
    // Detect language from user's message
    const language = detectLanguage(message);

    // Fetch available books from the database
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

    // Get system message in the detected language
    const systemMessage = getSystemMessage(books, language);

    // Make request to Mistral API with the appropriate language context
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
