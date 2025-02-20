import { supabase } from "@/integrations/supabase/client";

export const fetchAllBooks = async (searchQuery: string) => {
  let query = supabase.from("books").select("*");

  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,book_id.ilike.%${searchQuery}%,editorial.ilike.%${searchQuery}%,building.ilike.%${searchQuery}%`
    );
  }

  const { data: books, error } = await query.order("id", { ascending: false });
  if (error) throw error;
  return books || [];
};

export const downloadBooks = async (searchQuery: string) => {
  try {
    const books = await fetchAllBooks(searchQuery);
    if (!books?.length) return;

    const csvContent = [
      Object.keys(books[0]).join(","),
      ...books.map((book) =>
        Object.values(book)
          .map((value) => `"${value}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "books.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    throw error;
  }
};
