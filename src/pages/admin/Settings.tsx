import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

// Mock initial data
const initialGenres = [
  "Novel",
  "Theater",
  "Essay",
  "History",
  "Poetry",
  "Adventure"
];

const initialCategories = [
  "Category 1",
  "Category 2",
  "Category 3"
];

const initialBuildings = [
  "Building 1",
  "Building 2"
];

const Settings = () => {
  const { t } = useTranslation();
  const [genres, setGenres] = useState(initialGenres);
  const [categories, setCategories] = useState(initialCategories);
  const [buildings, setBuildings] = useState(initialBuildings);
  const [newGenre, setNewGenre] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newBuilding, setNewBuilding] = useState("");

  const handleAddGenre = () => {
    if (newGenre.trim()) {
      setGenres([...genres, newGenre.trim()]);
      setNewGenre("");
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleAddBuilding = () => {
    if (newBuilding.trim()) {
      setBuildings([...buildings, newBuilding.trim()]);
      setNewBuilding("");
    }
  };

  const handleDeleteGenre = (index: number) => {
    setGenres(genres.filter((_, i) => i !== index));
  };

  const handleDeleteCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleDeleteBuilding = (index: number) => {
    setBuildings(buildings.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-normal mb-8">{t("admin.settings")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Genres Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-normal">{t("admin.genres")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                className="flex-1 bg-white"
                placeholder={t("admin.addGenre")}
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddGenre()}
              />
              <Button 
                className="bg-black text-white hover:bg-black/90"
                onClick={handleAddGenre}
              >
                {t("common.save")}
              </Button>
            </div>
            <div className="space-y-1">
              {genres.map((genre, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-gray-100"
                >
                  <span className="text-sm">{genre}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => handleDeleteGenre(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-normal">{t("admin.categories")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                className="flex-1 bg-white"
                placeholder={t("admin.addCategory")}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button 
                className="bg-black text-white hover:bg-black/90"
                onClick={handleAddCategory}
              >
                {t("common.save")}
              </Button>
            </div>
            <div className="space-y-1">
              {categories.map((category, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-gray-100"
                >
                  <span className="text-sm">{category}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => handleDeleteCategory(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Buildings Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-normal">{t("admin.buildings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                className="flex-1 bg-white"
                placeholder={t("admin.addBuilding")}
                value={newBuilding}
                onChange={(e) => setNewBuilding(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddBuilding()}
              />
              <Button 
                className="bg-black text-white hover:bg-black/90"
                onClick={handleAddBuilding}
              >
                {t("common.save")}
              </Button>
            </div>
            <div className="space-y-1">
              {buildings.map((building, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-gray-100"
                >
                  <span className="text-sm">{building}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => handleDeleteBuilding(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
