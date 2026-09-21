import React, { useState, useMemo } from 'react';
import { 
  Utensils, 
  Flame, 
  Droplet, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  ShieldCheck, 
  Trash2, 
  Sparkles, 
  Pill, 
  Apple, 
  Info,
  Calendar
} from 'lucide-react';
import { INITIAL_NUTRITION_PLAN } from '../data/dietData';
import { NutritionPlan, DailyMeal, MealFoodEntry } from '../types';
import { AddFoodModal } from './AddFoodModal';
import { PageHeader } from './PageHeader';

export const DietView: React.FC = () => {
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan>(INITIAL_NUTRITION_PLAN);
  const [waterConsumedMl, setWaterConsumedMl] = useState<number>(2450);
  const [activeMealForAdd, setActiveMealForAdd] = useState<DailyMeal | null>(null);
  const [expandedMealIds, setExpandedMealIds] = useState<string[]>(['meal-1', 'meal-2', 'meal-3', 'meal-4']);
  const [supplementStack, setSupplementStack] = useState(INITIAL_NUTRITION_PLAN.supplementStack);

  // Toggle meal completion
  const handleToggleMealCompleted = (mealId: string) => {
    setNutritionPlan((prev) => ({
      ...prev,
      meals: prev.meals.map((meal) =>
        meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
      )
    }));
  };

  // Toggle meal accordion expansion
  const toggleMealExpanded = (mealId: string) => {
    setExpandedMealIds((prev) =>
      prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId]
    );
  };

  // Add food to meal
  const handleAddFoodToMeal = (entry: MealFoodEntry) => {
    if (!activeMealForAdd) return;
    setNutritionPlan((prev) => ({
      ...prev,
      meals: prev.meals.map((meal) => {
        if (meal.id === activeMealForAdd.id) {
          return {
            ...meal,
            foods: [...meal.foods, entry]
          };
        }
        return meal;
      })
    }));
    setActiveMealForAdd(null);
  };

  // Remove food from meal
  const handleRemoveFood = (mealId: string, entryId: string) => {
    setNutritionPlan((prev) => ({
      ...prev,
      meals: prev.meals.map((meal) => {
        if (meal.id === mealId) {
          return {
            ...meal,
            foods: meal.foods.filter((f) => f.id !== entryId)
          };
        }
        return meal;
      })
    }));
  };

  // Toggle supplement taken
  const handleToggleSupplement = (supId: string) => {
    setSupplementStack((prev) =>
      prev.map((sup) => (sup.id === supId ? { ...sup, taken: !sup.taken } : sup))
    );
  };

  // Water increment
  const handleAddWater = (ml: number) => {
    setWaterConsumedMl((prev) => Math.min(6000, Math.max(0, prev + ml)));
  };

  // Calculate total consumed macros across completed meals
  const consumedTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;

    nutritionPlan.meals.forEach((meal) => {
      // If meal is completed, sum its foods
      if (meal.completed) {
        meal.foods.forEach((food) => {
          calories += food.calories;
          protein += food.protein;
          carbs += food.carbs;
          fats += food.fats;
        });
      }
    });

    return {
      calories: Math.round(calories),
      protein: parseFloat(protein.toFixed(1)),
      carbs: parseFloat(carbs.toFixed(1)),
      fats: parseFloat(fats.toFixed(1))
    };
  }, [nutritionPlan]);

  const caloriesPercent = Math.min(100, Math.round((consumedTotals.calories / nutritionPlan.targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((consumedTotals.protein / nutritionPlan.targetProtein) * 100));
  const carbsPercent = Math.min(100, Math.round((consumedTotals.carbs / nutritionPlan.targetCarbs) * 100));
  const fatsPercent = Math.min(100, Math.round((consumedTotals.fats / nutritionPlan.targetFats) * 100));
  const waterPercent = Math.min(100, Math.round((waterConsumedMl / nutritionPlan.targetWaterMl) * 100));

  const remainingCalories = Math.max(0, nutritionPlan.targetCalories - consumedTotals.calories);

  return (
    <div className="flex flex-col w-full pb-24 md:pb-12 gap-5">
      {/* Top Welcome Header */}
      <section className="flex flex-col gap-3 pt-1">
        <PageHeader
          category="NUTRIÇÃO & PERFORMANCE"
          title="Dieta"
          subtitle="Metas de macronutrientes, balanço calórico e refeições prescritas"
          badge={
            <div className="flex items-center gap-1.5 bg-[#1c2025] px-3 py-1.5 rounded-full border border-[#262a30]">
              <Apple className="w-4 h-4 text-[#4edea3]" />
              <span className="text-xs font-bold text-white">Hipertrofia</span>
            </div>
          }
        />

        {/* Certified Nutritionist Banner */}
        <div className="bg-gradient-to-r from-[#18231c] via-[#161b22] to-[#121b28] border border-[#00a572]/30 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00a572] to-[#0066ff] flex items-center justify-center text-white shadow-md shadow-[#00a572]/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">{nutritionPlan.professionalName}</span>
                <span className="text-[10px] font-bold text-[#4edea3] bg-[#00a572]/20 px-2 py-0.5 rounded-full border border-[#00a572]/30">
                  Certificado SOMMA Train
                </span>
              </div>
              <span className="text-[11px] text-[#8c90a1] mt-0.5">
                {nutritionPlan.professionalRole} • {nutritionPlan.professionalCremOrCrn}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Macro HUD - Calories & Macro bars */}
      <section className="bg-[#1c2025] rounded-3xl p-5 border border-[#262a30] flex flex-col gap-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#8c90a1] uppercase tracking-wider">
              Balanço Energético Diário
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white tabular-nums">
                {consumedTotals.calories.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-[#8c90a1]">
                / {nutritionPlan.targetCalories.toLocaleString()} kcal
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#4edea3] uppercase tracking-wider block">
              Restante
            </span>
            <span className="text-lg font-black text-white tabular-nums">
              {remainingCalories} kcal
            </span>
          </div>
        </div>

        {/* Total Calories Progress Bar */}
        <div className="w-full bg-[#12161c] h-3 rounded-full overflow-hidden p-0.5 border border-[#262a30]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0066ff] via-[#4edea3] to-[#ffb59d] transition-all duration-500"
            style={{ width: `${caloriesPercent}%` }}
          ></div>
        </div>

        {/* 3 Core Macros Cards */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* Protein */}
          <div className="bg-[#14181f] p-3 rounded-2xl border border-[#262a30] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#0066ff]">Proteína</span>
              <span className="text-[10px] font-bold text-[#b3c5ff]">{proteinPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white tabular-nums">{consumedTotals.protein}</span>
              <span className="text-[10px] text-[#8c90a1]">/ {nutritionPlan.targetProtein}g</span>
            </div>
            <div className="w-full bg-[#1c2025] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0066ff] rounded-full transition-all"
                style={{ width: `${proteinPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-[#14181f] p-3 rounded-2xl border border-[#262a30] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#4edea3]">Carboidratos</span>
              <span className="text-[10px] font-bold text-[#4edea3]">{carbsPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white tabular-nums">{consumedTotals.carbs}</span>
              <span className="text-[10px] text-[#8c90a1]">/ {nutritionPlan.targetCarbs}g</span>
            </div>
            <div className="w-full bg-[#1c2025] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4edea3] rounded-full transition-all"
                style={{ width: `${carbsPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Fats */}
          <div className="bg-[#14181f] p-3 rounded-2xl border border-[#262a30] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#ffb59d]">Gorduras</span>
              <span className="text-[10px] font-bold text-[#ffb59d]">{fatsPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white tabular-nums">{consumedTotals.fats}</span>
              <span className="text-[10px] text-[#8c90a1]">/ {nutritionPlan.targetFats}g</span>
            </div>
            <div className="w-full bg-[#1c2025] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffb59d] rounded-full transition-all"
                style={{ width: `${fatsPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Hydration Tracker */}
      <section className="bg-[#1c2025] rounded-3xl p-4 sm:p-5 border border-[#262a30] flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0066ff]/20 text-[#0066ff] flex items-center justify-center">
              <Droplet className="w-4 h-4 fill-[#0066ff]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Hidratação do Atleta</h3>
              <span className="text-[11px] text-[#8c90a1]">Meta recomendada para o seu peso</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-white tabular-nums">{waterConsumedMl}</span>
            <span className="text-xs text-[#8c90a1]">/ {nutritionPlan.targetWaterMl} ml</span>
          </div>
        </div>

        {/* Water Progress bar */}
        <div className="w-full bg-[#12161c] h-2.5 rounded-full overflow-hidden border border-[#262a30]">
          <div
            className="h-full bg-gradient-to-r from-[#0066ff] to-[#4edea3] rounded-full transition-all duration-300"
            style={{ width: `${waterPercent}%` }}
          ></div>
        </div>

        {/* Quick Add Water Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleAddWater(250)}
            className="flex-1 h-9 rounded-xl bg-[#181c21] hover:bg-[#262a30] text-[#b3c5ff] border border-[#262a30] text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+250 ml (Copo)</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddWater(500)}
            className="flex-1 h-9 rounded-xl bg-[#0066ff]/20 hover:bg-[#0066ff]/30 text-white border border-[#0066ff]/30 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+500 ml (Garrafa)</span>
          </button>
          <button
            type="button"
            onClick={() => setWaterConsumedMl(0)}
            className="px-3 h-9 rounded-xl bg-[#181c21] text-[#8c90a1] hover:text-white text-xs font-semibold"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Structured Meals Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">Refeições Estruturadas</h2>
            <span className="bg-[#262a30] text-[#c2c6d8] px-2 py-0.5 rounded-full text-[11px] font-bold">
              {nutritionPlan.meals.length}
            </span>
          </div>
          <span className="text-xs text-[#8c90a1]">Marque as concluídas</span>
        </div>

        {/* Meal cards stack */}
        <div className="flex flex-col gap-3">
          {nutritionPlan.meals.map((meal) => {
            const isExpanded = expandedMealIds.includes(meal.id);
            const mealCals = meal.foods.reduce((acc, f) => acc + f.calories, 0);
            const mealProt = meal.foods.reduce((acc, f) => acc + f.protein, 0);
            const mealCarbs = meal.foods.reduce((acc, f) => acc + f.carbs, 0);
            const mealFats = meal.foods.reduce((acc, f) => acc + f.fats, 0);

            return (
              <div
                key={meal.id}
                className={`rounded-2xl border transition-all ${
                  meal.completed
                    ? 'bg-[#181d24] border-[#00a572]/40 shadow-sm'
                    : 'bg-[#1c2025] border-[#262a30]'
                }`}
              >
                {/* Meal Header */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Meal checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleMealCompleted(meal.id)}
                      className="cursor-pointer transition-transform active:scale-90"
                      aria-label={`Marcar ${meal.name} como ${meal.completed ? 'não realizada' : 'realizada'}`}
                    >
                      {meal.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-[#4edea3] fill-[#4edea3]/20" />
                      ) : (
                        <Circle className="w-6 h-6 text-[#424656] hover:text-[#0066ff]" />
                      )}
                    </button>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8c90a1] font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#0066ff]" />
                          {meal.time}
                        </span>
                        {meal.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#262a30] text-[#c2c6d8]">
                            {meal.badge}
                          </span>
                        )}
                      </div>
                      <h3
                        className={`text-sm sm:text-base font-extrabold mt-0.5 ${
                          meal.completed ? 'text-white' : 'text-white'
                        }`}
                      >
                        {meal.name}
                      </h3>
                    </div>
                  </div>

                  {/* Meal Macros & Collapse toggle */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end text-right">
                      <span className="text-sm font-black text-white tabular-nums">
                        {mealCals} kcal
                      </span>
                      <span className="text-[11px] text-[#8c90a1]">
                        P: {mealProt.toFixed(0)}g • C: {mealCarbs.toFixed(0)}g
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleMealExpanded(meal.id)}
                      className="w-8 h-8 rounded-lg bg-[#262a30] text-[#c2c6d8] hover:text-white flex items-center justify-center cursor-pointer"
                      aria-label="Expandir ou recolher alimentos da refeição"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Foods List */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t border-[#262a30]/60">
                    <div className="flex flex-col gap-1.5">
                      {meal.foods.map((food) => (
                        <div
                          key={food.id}
                          className="bg-[#12161c] p-2.5 rounded-xl border border-[#262a30]/40 flex items-center justify-between gap-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white leading-tight">
                              {food.name}
                            </span>
                            <span className="text-[11px] text-[#8c90a1]">
                              {food.portionDisplay} • {food.calories} kcal (P: {food.protein}g | C: {food.carbs}g | G: {food.fats}g)
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveFood(meal.id, food.id)}
                            className="w-7 h-7 rounded-lg text-[#8c90a1] hover:text-[#ffb59d] hover:bg-[#262a30] flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Remover alimento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add food button */}
                    <button
                      type="button"
                      onClick={() => setActiveMealForAdd(meal)}
                      className="w-full h-9 mt-1 rounded-xl bg-[#181c21] hover:bg-[#262a30] text-[#0066ff] hover:text-[#b3c5ff] border border-[#262a30] border-dashed text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Alimento da Base de Dados</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Daily Supplement Stack */}
      <section className="bg-[#1c2025] rounded-3xl p-5 border border-[#262a30] flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0066ff]/20 text-[#0066ff] flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Stack de Suplementação</h3>
              <span className="text-[11px] text-[#8c90a1]">Prescrito para recuperação e força</span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#4edea3]">
            {supplementStack.filter((s) => s.taken).length} de {supplementStack.length} tomados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {supplementStack.map((sup) => (
            <div
              key={sup.id}
              onClick={() => handleToggleSupplement(sup.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                sup.taken
                  ? 'bg-[#181d24] border-[#00a572]/40'
                  : 'bg-[#14181f] border-[#262a30] hover:border-[#31353b]'
              }`}
            >
              <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-white">{sup.name}</span>
                <span className="text-[10px] text-[#8c90a1] mt-0.5">
                  {sup.dosage} • {sup.timing}
                </span>
              </div>

              {sup.taken ? (
                <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-[#424656] shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Add Food Modal */}
      {activeMealForAdd && (
        <AddFoodModal
          mealName={activeMealForAdd.name}
          onClose={() => setActiveMealForAdd(null)}
          onAddFood={handleAddFoodToMeal}
        />
      )}
    </div>
  );
};
