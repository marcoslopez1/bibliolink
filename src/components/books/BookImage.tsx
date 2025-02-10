
interface BookImageProps {
  imageUrl: string;
  title: string;
  status: string;
}

const defaultBookCover = "https://media.istockphoto.com/id/626462142/photo/red-book.jpg?s=612x612&w=0&k=20&c=6GQND0qF5JAhrm1g_cZzXHQVRkkaA_625VXjfy9MtxA=";

export const BookImage = ({ imageUrl, title, status }: BookImageProps) => {
  return (
    <div className="md:col-span-1">
      <div className="w-1/2 md:w-full max-h-[500px] overflow-hidden rounded-lg mx-auto">
        <img
          src={imageUrl || defaultBookCover}
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};
