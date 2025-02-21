
import { supabase } from "@/integrations/supabase/client";

interface GoogleBookInfo {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  imageLinks?: {
    thumbnail?: string;
  };
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

interface BookData {
  title: string;
  author: string;
  editorial: string;
  publication_year: string;
  pages: string;
  image_url: string;
  isbn: string;
}

async function fetchGoogleBooksData(isbn: string): Promise<BookData | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const bookInfo: GoogleBookInfo = data.items[0].volumeInfo;

    return {
      title: bookInfo.title || "",
      author: (bookInfo.authors || []).join(", "),
      editorial: bookInfo.publisher || "",
      publication_year: bookInfo.publishedDate ? bookInfo.publishedDate.substring(0, 4) : "",
      pages: bookInfo.pageCount?.toString() || "",
      image_url: bookInfo.imageLinks?.thumbnail || "",
      isbn: isbn
    };
  } catch (error) {
    console.error("Error fetching from Google Books:", error);
    return null;
  }
}

async function fetchISBNdbData(isbn: string): Promise<BookData | null> {
  try {
    const { data: { api_key }, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('key', 'ISBNDB_API_KEY')
      .single();

    if (error || !api_key) {
      console.error("Error fetching ISBNdb API key:", error);
      return null;
    }

    const response = await fetch(`https://api2.isbndb.com/book/${isbn}`, {
      headers: {
        'Authorization': api_key
      }
    });

    const data = await response.json();

    if (!data.book) {
      return null;
    }

    return {
      title: data.book.title || "",
      author: data.book.authors?.join(", ") || "",
      editorial: data.book.publisher || "",
      publication_year: data.book.date_published 
        ? new Date(data.book.date_published).getFullYear().toString()
        : "",
      pages: data.book.pages?.toString() || "",
      image_url: data.book.image || "",
      isbn: isbn
    };
  } catch (error) {
    console.error("Error fetching from ISBNdb:", error);
    return null;
  }
}

export async function fetchBookData(isbn: string): Promise<BookData | null> {
  // Try Google Books API first
  const googleData = await fetchGoogleBooksData(isbn);
  if (googleData) {
    return googleData;
  }

  // If Google Books fails, try ISBNdb
  const isbndbData = await fetchISBNdbData(isbn);
  if (isbndbData) {
    return isbndbData;
  }

  return null;
}
