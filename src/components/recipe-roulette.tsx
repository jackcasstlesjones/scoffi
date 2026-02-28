"use client";

import Link from "next/link";
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Dices } from "lucide-react";
import type { Recipe } from "@/types/recipe";

interface RecipeRouletteProps {
  recipes: Recipe[];
}

export function RecipeRoulette({ recipes }: RecipeRouletteProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalRecipe, setFinalRecipe] = useState<Recipe | null>(null);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const spin = useCallback(() => {
    // Clear any pending timeouts
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];

    setFinalRecipe(null);
    setIsSpinning(true);

    const targetIndex = Math.floor(Math.random() * recipes.length);
    const totalSteps = 30 + Math.floor(Math.random() * 10);

    let cumulativeDelay = 0;

    for (let step = 0; step < totalSteps; step++) {
      // Easing: delay increases exponentially toward the end
      const progress = step / totalSteps;
      const delay = 50 + 200 * Math.pow(progress, 3);
      cumulativeDelay += delay;

      const recipeIndex =
        (targetIndex - (totalSteps - 1 - step) + recipes.length * totalSteps) %
        recipes.length;

      const id = setTimeout(() => {
        setCurrentIndex(recipeIndex);

        if (step === totalSteps - 1) {
          setIsSpinning(false);
          setFinalRecipe(recipes[targetIndex]);
        }
      }, cumulativeDelay);

      timeoutIds.current.push(id);
    }
  }, [recipes]);

  if (recipes.length < 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You need at least 2 recipes to use the roulette!
            </p>
            <Link href="/recipes">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Recipes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Recipe Roulette</h1>
          <Link href="/recipes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 flex flex-col items-center gap-8">
        <Card className="w-full max-w-lg">
          <CardContent className="py-16 text-center">
            <p
              className={`text-3xl font-bold transition-all ${
                finalRecipe ? "text-primary" : ""
              }`}
            >
              {recipes[currentIndex]?.name ?? ""}
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {!isSpinning && !finalRecipe && (
            <Button size="lg" onClick={spin}>
              <Dices className="h-5 w-5 mr-2" />
              Spin
            </Button>
          )}

          {!isSpinning && finalRecipe && (
            <>
              <Link href={`/recipes/${finalRecipe._id}`}>
                <Button size="lg">Go to Recipe</Button>
              </Link>
              <Button size="lg" variant="outline" onClick={spin}>
                <Dices className="h-5 w-5 mr-2" />
                Play Again
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
