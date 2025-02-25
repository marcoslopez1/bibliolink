
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, conversationHistory } = await req.json()

    // Fetch available books from the database
    const booksResponse = await fetch(`${SUPABASE_URL}/rest/v1/books?select=*`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    })

    if (!booksResponse.ok) {
      throw new Error('Failed to fetch books')
    }

    const books = await booksResponse.json()

    // Prepare the system message with available books information
    const systemMessage = {
      role: "system",
      content: `You are a friendly and enthusiastic library assistant! Keep your responses short (2-3 sentences max) and always use emojis to make them engaging. Use 📚 for book recommendations, 👋 for greetings, ⭐ for highlights, and other relevant emojis like 💡 for suggestions.

Here are the available books in our catalog:

${books.map(book => (
  `- "${book.title}" by ${book.author} (ID: ${book.book_id})
    Genre: ${book.genre}
    Category: ${book.category}
    Building: ${book.building}
    Pages: ${book.pages}`
)).join('\n\n')}

Remember to:
- Always start your responses with a relevant emoji
- Keep responses brief and friendly
- Use bullet points for multiple recommendations
- When recommending books, always provide specific titles from this list and include their ID in this exact format: "Book Title" (ID: BOOKID)
- Only recommend available books (status: 'available')
- Use emojis to highlight key features or genres`
    }

    // Prepare conversation for Mistral
    const messages = [
      systemMessage,
      ...conversationHistory.slice(-10) // Keep last 10 messages for context
    ]

    // Make request to Mistral API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-medium',
        messages,
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
