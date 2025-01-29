interface BookImageProps {
  imageUrl: string;
  title: string;
  status: string;
}

export const BookImage = ({ imageUrl, title, status }: BookImageProps) => {
  return (
    <div className="md:col-span-1">
      <div className="w-1/2 md:w-full max-h-[500px] overflow-hidden rounded-lg mx-auto">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};