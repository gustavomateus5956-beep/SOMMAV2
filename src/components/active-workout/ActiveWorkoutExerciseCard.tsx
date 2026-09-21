import React from 'react';
import {
  Timer,
  Trash2,
  MessageSquarePlus,
  Check,
  Plus
} from 'lucide-react';
import { Exercise } from '../../types';
import { getSetTypeConfig, SetTypeIcon } from '../../data/setTypes';
import { ExerciseGuidanceSection } from '../ExerciseGuidanceSection';

interface ActiveWorkoutExerciseCardProps {
  exercise: Exercise;
  exIndex: number;
  totalExercises: number;
  onOpenFeedback: (exercise: Exercise) => void;
  onStartRest: () => void;
  onRemoveExercise: (exIndex: number) => void;
  onEditSetType: (exIndex: number, setIndex: number) => void;
  onAdjustSetWeight: (exIndex: number, setIndex: number, delta: number) => void;
  onUpdateSetField: (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  onToggleSetComplete: (exIndex: number, setIndex: number) => void;
  onAddSet: (exIndex: number) => void;
  onRemoveLastSet: (exIndex: number) => void;
}

export const ActiveWorkoutExerciseCard: React.FC<ActiveWorkoutExerciseCardProps> = ({
  exercise,
  exIndex,
  totalExercises,
  onOpenFeedback,
  onStartRest,
  onRemoveExercise,
  onEditSetType,
  onAdjustSetWeight,
  onUpdateSetField,
  onToggleSetComplete,
  onAddSet,
  onRemoveLastSet
}) => {
  return (
    <div className="bg-[#1c2025] rounded-2xl p-3.5 border border-[#262a30] shadow-sm flex flex-col gap-3">
      {/* Exercise Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#0066ff]/20 text-[#0066ff] text-xs font-black flex items-center justify-center">
              {exIndex + 1}
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
              {exercise.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8c90a1] pl-7">
            <span>{exercise.muscleGroup}</span>
            {exercise.equipment && (
              <>
                <span>•</span>
                <span className="text-[#b3c5ff]">{exercise.equipment}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenFeedback(exercise)}
            className="px-2 py-1.5 rounded-lg bg-[#0066ff]/15 hover:bg-[#0066ff]/25 text-[#b3c5ff] hover:text-white text-xs font-bold flex items-center gap-1 transition-colors border border-[#0066ff]/30 cursor-pointer"
            title="Tirar dúvida com o professor ou postar no feed"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#0066ff]" />
            <span className="hidden sm:inline">Dúvida / Feed</span>
          </button>
          <button
            type="button"
            onClick={onStartRest}
            title="Iniciar cronômetro de descanso para este exercício"
            className="p-1.5 rounded-lg bg-[#262a30] hover:bg-[#31353b] text-[#b3c5ff] transition-colors cursor-pointer"
          >
            <Timer className="w-4 h-4" />
          </button>
          {totalExercises > 1 && (
            <button
              type="button"
              onClick={() => onRemoveExercise(exIndex)}
              aria-label="Remover exercício"
              className="p-1.5 rounded-lg bg-[#262a30] hover:bg-[#31353b] text-[#8c90a1] hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Professional Guidance & Step-by-Step Instructions */}
      <ExerciseGuidanceSection
        exercise={exercise}
        onOpenFeedback={() => onOpenFeedback(exercise)}
      />

      {/* Sets Table Header */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-[#8c90a1] uppercase px-1 pb-0.5">
          <span className="col-span-2 text-center">SÉRIE</span>
          <span className="col-span-3 text-center">ALVO / ANT.</span>
          <span className="col-span-3 text-center">CARGA (KG)</span>
          <span className="col-span-2 text-center">REPS</span>
          <span className="col-span-2 text-center">CHECK</span>
        </div>

        {/* Set Rows: Only icon + number without bottom description text */}
        {exercise.sets.map((set, setIndex) => {
          const setTypeConfig = getSetTypeConfig(set.type);
          const isSpecialType = set.type && set.type !== 'working';

          return (
            <div
              key={set.id || `set-${setIndex}`}
              className={`grid grid-cols-12 gap-1 items-center p-1.5 rounded-xl transition-colors ${
                set.completed
                  ? 'bg-[#00a572]/15 border border-[#00a572]/40'
                  : 'bg-[#14181f] border border-[#262a30]/60'
              }`}
            >
              {/* Set Type Icon & Number */}
              <div className="col-span-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onEditSetType(exIndex, setIndex)}
                  className={`min-w-[42px] h-8 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                    isSpecialType
                      ? `${setTypeConfig.badgeBg} ${setTypeConfig.badgeBorder} ${setTypeConfig.badgeText}`
                      : 'bg-[#101419] border-[#262a30] text-[#c2c6d8] hover:border-[#0066ff]'
                  }`}
                  title={`Tipo: ${setTypeConfig.name}. Toque para alterar.`}
                >
                  <SetTypeIcon type={set.type} className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold tabular-nums">{set.setNumber}</span>
                </button>
              </div>

              {/* Target / Previous Metric */}
              <div className="col-span-3 flex flex-col items-center justify-center text-center">
                {set.targetWeight || set.targetReps ? (
                  <span className="text-xs font-semibold text-[#c2c6d8] tabular-nums truncate px-0.5">
                    {set.targetWeight ? `${set.targetWeight}k` : ''}{set.targetReps ? ` × ${set.targetReps}` : ''}
                  </span>
                ) : set.prevWeight ? (
                  <span className="text-xs text-[#8c90a1] tabular-nums truncate px-0.5">
                    {set.prevWeight}k × {set.prevReps}
                  </span>
                ) : (
                  <span className="text-xs text-[#64748b]">-</span>
                )}
                {set.completed && set.prevWeight && set.weight > set.prevWeight && (
                  <span className="text-[9px] font-black text-[#ffb59d]">NOVO PR</span>
                )}
              </div>

              {/* Weight (Kg) Input with Quick Stepper */}
              <div className="col-span-3 flex items-center bg-[#101419] rounded-lg border border-[#262a30] px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => onAdjustSetWeight(exIndex, setIndex, -2.5)}
                  className="w-5 h-7 text-[#8c90a1] hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={set.weight}
                  onChange={(e) =>
                    onUpdateSetField(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)
                  }
                  className="w-full text-center bg-transparent text-xs font-bold text-white tabular-nums outline-none"
                />
                <button
                  type="button"
                  onClick={() => onAdjustSetWeight(exIndex, setIndex, 2.5)}
                  className="w-5 h-7 text-[#8c90a1] hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Reps Input with Quick Stepper */}
              <div className="col-span-2 flex items-center bg-[#101419] rounded-lg border border-[#262a30] px-0.5 py-0.5">
                <input
                  type="number"
                  min="1"
                  value={set.reps}
                  onChange={(e) =>
                    onUpdateSetField(exIndex, setIndex, 'reps', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full text-center bg-transparent text-xs font-bold text-white tabular-nums outline-none"
                />
              </div>

              {/* Check / Complete Button */}
              <div className="col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => onToggleSetComplete(exIndex, setIndex)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    set.completed
                      ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/25 scale-105'
                      : 'bg-[#262a30] hover:bg-[#31353b] text-[#8c90a1]'
                  }`}
                  title={set.completed ? 'Marcar como não feita' : 'Concluir série'}
                >
                  <Check className={`w-5 h-5 ${set.completed ? 'stroke-[3]' : 'stroke-[2]'}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Actions: Add Set or Remove Set */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => onAddSet(exIndex)}
          className="flex-1 py-2 rounded-xl border border-dashed border-[#262a30] hover:border-[#0066ff] text-xs font-bold text-[#b3c5ff] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-[#14181f]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Série</span>
        </button>

        {exercise.sets.length > 1 && (
          <button
            type="button"
            onClick={() => onRemoveLastSet(exIndex)}
            className="px-3 py-2 rounded-xl border border-dashed border-[#262a30] hover:border-red-500/50 text-[11px] font-semibold text-[#8c90a1] hover:text-red-400 transition-colors cursor-pointer"
            title="Remover última série"
          >
            Remover Série
          </button>
        )}
      </div>
    </div>
  );
};
