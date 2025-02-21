
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface SettingItem {
  id: number;
  name: string;
}

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (value: string) => void;
  initialValue: string;
  title: string;
}

const EditDialog = ({ isOpen, onOpenChange, onSave, initialValue, title }: EditDialogProps) => {
  const [value, setValue] = useState(initialValue);
  const { t } = useTranslation();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSave(value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t("common.cancel")}
          </Button>
          <Button onClick={() => onSave(value)} className="bg-black text-white hover:bg-black/90">
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Settings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [genres, setGenres] = useState<SettingItem[]>([]);
  const [categories, setCategories] = useState<SettingItem[]>([]);
  const [buildings, setBuildings] = useState<SettingItem[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newBuilding, setNewBuilding] = useState("");
  const [editItem, setEditItem] = useState<{ type: string; item: SettingItem | null }>({
    type: "",
    item: null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [genresData, categoriesData, buildingsData] = await Promise.all([
        supabase.from("genres").select("*").order("name"),
        supabase.from("categories").select("*").order("name"),
        supabase.from("buildings").select("*").order("name"),
      ]);

      if (genresData.error) throw genresData.error;
      if (categoriesData.error) throw categoriesData.error;
      if (buildingsData.error) throw buildingsData.error;

      setGenres(genresData.data);
      setCategories(categoriesData.data);
      setBuildings(buildingsData.data);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast({
        variant: "destructive",
        description: t("common.error"),
      });
    }
  };

  const handleAdd = async (table: string, value: string, setter: (value: string) => void) => {
    if (!value.trim()) return;

    try {
      const { error } = await supabase
        .from(table)
        .insert([{ name: value.trim() }]);

      if (error) throw error;

      setter("");
      fetchSettings();
      toast({
        description: t("admin.settings.addSuccess"),
      });
    } catch (error: any) {
      console.error(`Error adding ${table}:`, error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  const handleEdit = async (table: string, id: number, newValue: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ name: newValue.trim() })
        .eq("id", id);

      if (error) throw error;

      setEditItem({ type: "", item: null });
      fetchSettings();
      toast({
        description: t("admin.settings.updateSuccess"),
      });
    } catch (error: any) {
      console.error(`Error updating ${table}:`, error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  const handleDelete = async (table: string, id: number) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchSettings();
      toast({
        description: t("admin.settings.deleteSuccess"),
      });
    } catch (error: any) {
      console.error(`Error deleting ${table}:`, error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
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
                onKeyPress={(e) => e.key === "Enter" && handleAdd("genres", newGenre, setNewGenre)}
              />
              <Button 
                className="bg-black text-white hover:bg-black/90"
                onClick={() => handleAdd("genres", newGenre, setNewGenre)}
              >
                {t("common.save")}
              </Button>
            </div>
            <div className="space-y-1">
              {genres.map((genre) => (
                <div 
                  key={genre.id} 
                  className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-gray-100"
                >
                  <span className="text-sm">{genre.name}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => setEditItem({ type: "genres", item: genre })}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => handleDelete("genres", genre.id)}
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
                onKeyPress={(e) => e.key === "Enter" && handleAdd("categories", newCategory, setNewCategory)}
              />
              <Button 
                className="bg-black text-white hover:bg-black/90"
                onClick={() => handleAdd("categories", newCategory, setNewCategory)}
              >
                {t("common.save")}
              </Button>
            </div>
            <div className="space-y-1">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-gray-100"
                >
                  <span className="text-sm">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => setEditItem({ type: "categories", item: category })}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => handleDelete("categories", category.id)}
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
                onKeyPress={(e) => e.key === "Enter" && handleAdd("buildings", newBuilding, setNewBuilding)}
              />
              <Button 
                className="bg-black text-white hover:bg-black/90"
                onClick={() => handleAdd("buildings", newBuilding, setNewBuilding)}
              >
                {t("common.save")}
              </Button>
            </div>
            <div className="space-y-1">
              {buildings.map((building) => (
                <div 
                  key={building.id} 
                  className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-gray-100"
                >
                  <span className="text-sm">{building.name}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => setEditItem({ type: "buildings", item: building })}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => handleDelete("buildings", building.id)}
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

      <EditDialog
        isOpen={!!editItem.item}
        onOpenChange={(open) => !open && setEditItem({ type: "", item: null })}
        onSave={(value) => editItem.item && handleEdit(editItem.type, editItem.item.id, value)}
        initialValue={editItem.item?.name || ""}
        title={t(`admin.edit${editItem.type.slice(0, -1)}`)}
      />
    </div>
  );
};

export default Settings;
