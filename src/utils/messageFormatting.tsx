
import { Link } from "react-router-dom";

export const formatMessageWithLinks = (content: string) => {
  // Match book IDs and titles in the format "Book Title (ID: ABC123)" or just "ID: ABC123"
  const bookPattern = /(?:"([^"]+)"\s*(?:\()?ID:\s*([A-Za-z0-9]+)(?:\))?)|(?:ID:\s*([A-Za-z0-9]+))/g;
  let lastIndex = 0;
  const parts = [];
  let match;

  while ((match = bookPattern.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const title = match[1];
    const id = match[2] || match[3];

    // Add the linked book reference
    parts.push(
      <Link
        key={`${id}-${match.index}`}
        to={`/book/${id}`}
        className="text-blue-600 hover:underline"
      >
        {title ? `"${title}" (ID: ${id})` : `ID: ${id}`}
      </Link>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
};
