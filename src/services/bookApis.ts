interface GoogleBookInfo {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
  infoLink?: string;
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
  info_url?: string;
}

interface BookData {
  title: string;
  author: string;
  editorial: string;
  publication_year: string;
  pages: string;
  image_url: string;
  isbn: string;
  external_url: string;
}

function getBestImageUrl(imageLinks: GoogleBookInfo['imageLinks']): string {
  if (!imageLinks) return '';
  
  // Order from highest to lowest quality
  const imageTypes = ['extraLarge', 'large', 'medium', 'small', 'thumbnail', 'smallThumbnail'];
  
  for (const type of imageTypes) {
    if (imageLinks[type as keyof typeof imageLinks]) {
      // Convert from http to https if needed
      return imageLinks[type as keyof typeof imageLinks]!.replace(/^http:/, 'https:');
    }
  }
  
  return '';
}

function getOpenLibraryBestImage(isbn: string, cover?: OpenLibraryBook['cover']): string {
  if (!cover) {
    // If no cover object, try different sizes from highest to lowest quality
    const sizes = ['L', 'M', 'S'];
    for (const size of sizes) {
      const url = `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
      return url;
    }
  }
  
  // If cover object exists, get the best available quality
  if (cover.large) return cover.large;
  if (cover.medium) return cover.medium;
  if (cover.small) return cover.small;
  
  return '';
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
      image_url: getBestImageUrl(bookInfo.imageLinks),
      isbn: isbn,
      external_url: bookInfo.infoLink || ""
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
      image_url: getOpenLibraryBestImage(isbn, data.cover),
      isbn: isbn,
      external_url: `https://openlibrary.org/isbn/${isbn}` // OpenLibrary's info page
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
