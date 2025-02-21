
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

interface OpenLibraryBook {
  title: string;
  authors: Array<{ name: string }>;
  publishers?: string[];
  publish_date?: string;
  number_of_pages?: number;
  cover?: {
    small?: string;
    medium?: string;
    large?: string;
  };
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

async function fetchOpenLibraryData(isbn: string): Promise<BookData | null> {
  try {
    const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!response.ok) {
      return null;
    }
    
    const data: OpenLibraryBook = await response.json();

    return {
      title: data.title || "",
      author: data.authors?.map(author => author.name).join(", ") || "",
      editorial: data.publishers?.[0] || "",
      publication_year: data.publish_date ? data.publish_date.substring(0, 4) : "",
      pages: data.number_of_pages?.toString() || "",
      image_url: data.cover?.medium || `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
      isbn: isbn
    };
  } catch (error) {
    console.error("Error fetching from Open Library:", error);
    return null;
  }
}

export async function fetchBookData(isbn: string): Promise<BookData | null> {
  // Try Google Books API first
  const googleData = await fetchGoogleBooksData(isbn);
  if (googleData) {
    return googleData;
  }

  // If Google Books fails, try Open Library
  const openLibraryData = await fetchOpenLibraryData(isbn);
  if (openLibraryData) {
    return openLibraryData;
  }

  return null;
}
