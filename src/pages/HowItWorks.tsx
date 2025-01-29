import { BookOpen, Users, Clock, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: BookOpen,
      title: t("howItWorks.features.browse.title"),
      description: t("howItWorks.features.browse.description"),
    },
    {
      icon: Users,
      title: t("howItWorks.features.account.title"),
      description: t("howItWorks.features.account.description"),
    },
    {
      icon: Clock,
      title: t("howItWorks.features.reserve.title"),
      description: t("howItWorks.features.reserve.description"),
    },
    {
      icon: Heart,
      title: t("howItWorks.features.share.title"),
      description: t("howItWorks.features.share.description"),
    },
  ];

  return (
    <div className="space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold text-primary">{t("howItWorks.title")}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("howItWorks.subtitle")}
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