"use client";

import Link from "next/link";
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Dices } from "lucide-react";
import type { Recipe } from "@/types/recipe";

const SLOT_HEIGHT = 56; // px per row
const VISIBLE_ROWS = 5; // rows visible in the viewport
const CENTER = Math.floor(VISIBLE_ROWS / 2); // index of the center row (2)
// Strip has VISIBLE_ROWS + 1 items so we can animate one new item in
const STRIP_COUNT = VISIBLE_ROWS + 1;

interface RecipeRouletteProps {
  recipes: Recipe[];
}

export function RecipeRoulette({ recipes }: RecipeRouletteProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalRecipe, setFinalRecipe] = useState<Recipe | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const getIndex = (base: number, offset: number) =>
    ((base + offset) % recipes.length + recipes.length) % recipes.length;

  const spin = useCallback(() => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];

    setFinalRecipe(null);
    setIsSpinning(true);

    const targetIndex = Math.floor(Math.random() * recipes.length);
    // Jump ahead by a random amount, then scroll through ~8-12 visible steps
    const skipAmount = 1 + Math.floor(Math.random() * 50);
    const visibleSteps = 12 + Math.floor(Math.random() * 5);
    const totalSteps = visibleSteps;

    // Start index: skip ahead from current, then count back visibleSteps to land on target
    const startIndex =
      (targetIndex - visibleSteps + 1 + skipAmount + recipes.length * 100) %
      recipes.length;

    let cumulativeDelay = 0;

    for (let step = 0; step < totalSteps; step++) {
      const progress = step / totalSteps;
      // Start very fast (30ms), ramp up steeply
      const delay = 30 + 400 * Math.pow(progress, 2);
      cumulativeDelay += delay;

      const recipeIndex = (startIndex + step) % recipes.length;

      const slideDuration = Math.min(delay * 0.8, 250);

      const id = setTimeout(() => {
        const strip = stripRef.current;
        if (!strip) return;

        // Update the bottom (hidden) slot with the new incoming recipe
        const bottomSlot = strip.children[STRIP_COUNT - 1] as HTMLElement;
        bottomSlot.textContent = recipes[getIndex(recipeIndex, CENTER)].name;

        // Animate the strip upward by one row
        strip.style.transition = `transform ${slideDuration}ms ease-out`;
        strip.style.transform = `translateY(-${SLOT_HEIGHT}px)`;

        // After transition: update all slots, reset position
        const snapId = setTimeout(() => {
          strip.style.transition = "none";
          strip.style.transform = "translateY(0)";
          setCurrentIndex(recipeIndex);

          // Update all visible slot texts
          for (let i = 0; i < STRIP_COUNT; i++) {
            const slot = strip.children[i] as HTMLElement;
            slot.textContent =
              recipes[getIndex(recipeIndex, i - CENTER)].name;
          }

          if (step === totalSteps - 1) {
            setIsSpinning(false);
            setFinalRecipe(recipes[targetIndex]);
          }
        }, slideDuration + 10);

        timeoutIds.current.push(snapId);
      }, cumulativeDelay);

      timeoutIds.current.push(id);
    }
  }, [recipes, currentIndex]);

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

  // Opacity classes for each visible row (center is brightest)
  const rowOpacity = [0.15, 0.35, 1, 0.35, 0.15];

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
        <Card className="w-full max-w-lg overflow-hidden">
          <CardContent className="py-0 text-center">
            <div
              className="overflow-hidden relative"
              style={{ height: SLOT_HEIGHT * VISIBLE_ROWS }}
            >
              {/* Highlight band behind center row */}
              <div
                className="absolute inset-x-0 bg-muted/50 rounded-md pointer-events-none z-0"
                style={{
                  top: SLOT_HEIGHT * CENTER,
                  height: SLOT_HEIGHT,
                }}
              />

              {/* Scrolling strip */}
              <div
                ref={stripRef}
                className="flex flex-col relative z-10"
                style={{ transform: "translateY(0)" }}
              >
                {Array.from({ length: STRIP_COUNT }, (_, i) => {
                  const idx = getIndex(currentIndex, i - CENTER);
                  const opacity = i < VISIBLE_ROWS ? rowOpacity[i] : 0;
                  return (
                    <span
                      key={i}
                      className={`flex items-center justify-center text-2xl font-bold shrink-0 ${
                        i === CENTER && finalRecipe ? "text-primary" : ""
                      }`}
                      style={{ height: SLOT_HEIGHT, opacity }}
                    >
                      {recipes[idx]?.name}
                    </span>
                  );
                })}
              </div>
            </div>
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
