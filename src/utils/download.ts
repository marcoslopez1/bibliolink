
export const downloadBooks = (books: any[]) => {
  try {
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
