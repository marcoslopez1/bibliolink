import { BookOpen, Users, Clock, Heart } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Browse the Catalog",
    description: "Explore our extensive collection of books across various genres and topics.",
  },
  {
    icon: Users,
    title: "Create an Account",
    description: "Sign up to reserve books, track your reading history, and get personalized recommendations.",
  },
  {
    icon: Clock,
    title: "Reserve & Borrow",
    description: "Reserve books online and pick them up at your convenience.",
  },
  {
    icon: Heart,
    title: "Share & Review",
    description: "Share your favorite books and help others discover great reads.",
  },
];

const HowItWorks = () => {
  return (
    <div className="space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold text-primary">How It Works</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our library management system makes it easy to discover, borrow, and enjoy books.
          Here's how to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;