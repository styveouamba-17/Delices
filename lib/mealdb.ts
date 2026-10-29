export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strYoutube?: string;
  [key: string]: any;
}

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE_URL}/categories.php`);
  const json = await response.json();
  return json.categories || [];
}

let allMealsPromise: Promise<Meal[]> | null = null;

/**
 * TheMealDB's `search.php?s=` only returns ~25 meals, not the full
 * database. Aggregating `search.php?f=<letter>` over a-z is the only
 * way to get the complete, full-field dataset (~789 meals).
 */
export function fetchAllMeals(): Promise<Meal[]> {
  if (!allMealsPromise) {
    allMealsPromise = Promise.all(
      ALPHABET.map(async (letter) => {
        const response = await fetch(`${BASE_URL}/search.php?f=${letter}`);
        const json = await response.json();
        return (json.meals || []) as Meal[];
      }),
    )
      .then((results) => results.flat())
      .catch((error) => {
        allMealsPromise = null;
        throw error;
      });
  }
  return allMealsPromise;
}

export async function fetchMealsByCategory(category: string): Promise<Meal[]> {
  const all = await fetchAllMeals();
  if (category === "all") return all;
  return all.filter((meal) => meal.strCategory === category);
}

export async function fetchMealById(id: string): Promise<Meal | null> {
  const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const json = await response.json();
  return json.meals?.[0] || null;
}

export async function fetchMealsByIds(ids: string[]): Promise<Meal[]> {
  const results = await Promise.all(ids.map((id) => fetchMealById(id)));
  return results.filter((meal): meal is Meal => meal !== null);
}
