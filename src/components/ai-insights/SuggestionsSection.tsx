
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, BookOpen, ArrowRight, Dumbbell, Music, Brain } from "lucide-react";

interface SuggestionsSectionProps {
  suggestions: {
    id: string;
    category: string;
    title: string;
    text: string;
    type: string;
  }[];
  isLoading: boolean;
}

export function SuggestionsSection({ suggestions, isLoading }: SuggestionsSectionProps) {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic':
        return <BookOpen className="h-4 w-4" />;
      case 'sports':
        return <Dumbbell className="h-4 w-4" />;
      case 'extracurricular':
        return <Music className="h-4 w-4" />;
      case 'emotional':
        return <Brain className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'academic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'sports':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'extracurricular':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'emotional':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge className={`${getCategoryColor(suggestion.category)} flex items-center gap-1`}>
                  {getCategoryIcon(suggestion.category)}
                  {suggestion.category}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">{suggestion.title}</CardTitle>
              <CardDescription>{suggestion.type}</CardDescription>
            </CardHeader>
            <CardContent className="pb-0 flex-grow">
              <p className="text-sm text-muted-foreground">{suggestion.text}</p>
            </CardContent>
            <CardFooter className="pt-4">
              <Button variant="ghost" size="sm" className="w-full justify-between">
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {suggestions.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center p-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No Suggestions Available</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add more data to your TreasureBook to generate personalized suggestions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
