import { Separator } from "@/components/ui/separator";

interface BookDetailsProps {
  genre: string;
  category: string;
  pages: number;
  publicationYear: number;
  editorial: string;
  building: string;
}

export const BookDetails = ({
  genre,
  category,
  pages,
  publicationYear,
  editorial,
  building,
}: BookDetailsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Book details</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Genre</h3>
          <p className="mt-1">{genre}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <p className="mt-1">{category}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Pages</h3>
          <p className="mt-1">{pages}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Publication Year</h3>
          <p className="mt-1">{publicationYear}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Editorial</h3>
          <p className="mt-1">{editorial}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Building</h3>
          <p className="mt-1">{building}</p>
        </div>
      </div>
      <Separator className="my-6" />
    </div>
  );
};