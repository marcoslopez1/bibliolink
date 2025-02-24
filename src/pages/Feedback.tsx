
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { useQuery } from "@tanstack/react-query";
import { subMonths, parseISO } from "date-fns";

const Feedback = () => {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [details, setDetails] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Fetch latest rating (if exists) and check if it's older than 3 months
  const { data: existingRating } = useQuery({
    queryKey: ['userRating', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      
      const { data, error } = await supabase
        .from('feedback')
        .select('rating, created_at')
        .eq('user_id', session.user.id)
        .gt('rating', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id
  });

  // Check if rating should be shown (no rating or rating older than 3 months)
  const shouldShowRating = !existingRating || (
    existingRating && 
    parseISO(existingRating.created_at) < subMonths(new Date(), 3)
  );

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id || !rating) return;

    setIsSubmittingRating(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: session.user.id,
          rating,
          details: details || null,
          feedback_text: ''
        });

      if (error) throw error;

      toast({
        description: t("feedback.success")
      });

      // Reset form
      setRating(0);
      setDetails("");
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        variant: "destructive",
        description: t("feedback.error")
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id || !feedback) return;

    setIsSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: session.user.id,
          rating: 0,
          feedback_text: feedback
        });

      if (error) throw error;

      toast({
        description: t("feedback.success")
      });

      // Reset form
      setFeedback("");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: "destructive",
        description: t("feedback.error")
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t("feedback.pageTitle")}</h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        {shouldShowRating && (
          <form onSubmit={handleRatingSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("feedback.rating.title")}</CardTitle>
                <CardDescription>{t("feedback.rating.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                />
                <Textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t("feedback.rating.details")}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmittingRating || !rating}>
                    {t("feedback.rating.submit")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {!shouldShowRating && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t("feedback.rating.alreadyRated")}
              </p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("feedback.feedback.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t("feedback.feedback.placeholder")}
                className="min-h-[150px]"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmittingFeedback || !feedback}>
                  {t("feedback.feedback.submit")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
