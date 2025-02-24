
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Feedback = () => {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState<string>("");
  const [details, setDetails] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id || !rating || !feedback) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          rating: parseInt(rating),
          feedback_text: feedback,
          details: details || null,
          user_id: session.user.id
        });

      if (error) throw error;

      toast({
        description: t("feedback.success")
      });

      // Reset form
      setRating("");
      setDetails("");
      setFeedback("");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: "destructive",
        description: t("feedback.error")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t("feedback.pageTitle")}</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("feedback.rating.title")}</CardTitle>
            <CardDescription>{t("feedback.rating.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={rating}
              onValueChange={setRating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="1-10" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("feedback.rating.details")}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("feedback.feedback.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t("feedback.feedback.placeholder")}
              className="min-h-[150px]"
              required
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !rating || !feedback}>
            {t("feedback.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Feedback;
