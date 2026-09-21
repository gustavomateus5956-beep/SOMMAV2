import React from 'react';
import {
  Play,
  Pause,
  Timer,
  ChevronDown,
  X,
  Award
} from 'lucide-react';

interface ActiveWorkoutHeaderProps {
  isTimerPaused: boolean;
  seconds: number;
  onTogglePauseTimer: () => void;
  onMinimize: () => void;
  onRequestDiscard: () => void;
  totalCompletedSets: number;
  totalSetsCount: number;
  progressPercentage: number;
  restSeconds: number | null;
  isRestPaused: boolean;
  onAddRestSeconds: (delta: number) => void;
  onTogglePauseRest: () => void;
  onSkipRest: () => void;
  workoutName: string;
  onWorkoutNameChange: (name: string) => void;
  exerciseCount: number;
  totalVolume: number;
  detectedPrs: number;
  formatTimer: (secs: number) => string;
}

export const ActiveWorkoutHeader: React.FC<ActiveWorkoutHeaderProps> = ({
  isTimerPaused,
  seconds,
  onTogglePauseTimer,
  onMinimize,
  onRequestDiscard,
  totalCompletedSets,
  totalSetsCount,
  progressPercentage,
  restSeconds,
  isRestPaused,
  onAddRestSeconds,
  onTogglePauseRest,
  onSkipRest,
  workoutName,
  onWorkoutNameChange,
  exerciseCount,
  totalVolume,
  detectedPrs,
  formatTimer
}) => {
  return (
    <>
      {/* Top Sticky Bar: Live Timer, Progress, and Header */}
      <div className="px-4 py-3 bg-[#181c21] border-b border-[#262a30] flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          {/* Dedicated Minimize Button (Hevy-inspired UX) */}
          <button
            type="button"
            onClick={onMinimize}
            aria-label="Minimizar treino para segundo plano"
            className="w-8 h-8 rounded-full bg-[#101419] hover:bg-[#262a30] border border-[#262a30] flex items-center justify-center text-[#c2c6d8] hover:text-white transition-colors cursor-pointer"
            title="Minimizar treino (continuar navegando no app)"
          >
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={onTogglePauseTimer}
            className="flex items-center gap-1.5 bg-[#101419] hover:bg-[#262a30] px-3 py-1.5 rounded-full border border-[#262a30] transition-colors cursor-pointer"
            title={isTimerPaused ? 'Retomar cronômetro' : 'Pausar cronômetro'}
          >
            {isTimerPaused ? (
              <Play className="w-3.5 h-3.5 text-[#ffb59d] fill-[#ffb59d]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            )}
            <span className="font-mono font-bold text-sm tracking-wider text-white tabular-nums">
              {formatTimer(seconds)}
            </span>
          </button>
          <span className="text-xs text-[#8c90a1] font-semibold hidden sm:inline">
            {isTimerPaused ? '(Pausado)' : 'Treino Ao Vivo'}
          </span>
        </div>

        {/* Quick Progress Badge */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-bold text-white tabular-nums">
              {totalCompletedSets}/{totalSetsCount} séries
            </span>
            <span className="text-[9px] text-[#4edea3] font-bold">
              {progressPercentage}% concluído
            </span>
          </div>

          <button
            type="button"
            onClick={onRequestDiscard}
            aria-label="Sair ou descartar treino"
            className="w-8 h-8 rounded-full bg-[#262a30] hover:bg-[#31353b] flex items-center justify-center text-[#c2c6d8] transition-colors cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Progress Bar Ribbon */}
      <div className="w-full bg-[#181c21] h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0066ff] via-[#4edea3] to-[#4edea3] transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Rest Timer Floating Bar (Sticky below header when active) */}
      {restSeconds !== null && (
        <div className="bg-[#0066ff]/15 border-b border-[#0066ff]/40 px-4 py-2.5 flex items-center justify-between z-10 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#0066ff] animate-spin" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b3c5ff]">
                Descanso entre Séries
              </span>
              <span className="font-mono text-base font-extrabold text-white tabular-nums leading-none">
                {formatTimer(restSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAddRestSeconds(30)}
              className="px-2 py-1 bg-[#262a30] hover:bg-[#31353b] rounded-lg text-[11px] font-bold text-[#b3c5ff] cursor-pointer"
            >
              +30s
            </button>
            <button
              type="button"
              onClick={() => onAddRestSeconds(-15)}
              className="px-2 py-1 bg-[#262a30] hover:bg-[#31353b] rounded-lg text-[11px] font-bold text-[#8c90a1] cursor-pointer"
            >
              -15s
            </button>
            <button
              type="button"
              onClick={onTogglePauseRest}
              className="p-1 bg-[#262a30] hover:bg-[#31353b] rounded-lg text-white cursor-pointer"
            >
              {isRestPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={onSkipRest}
              className="px-2.5 py-1 bg-[#0066ff] hover:bg-[#0054d6] text-white rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Pular
            </button>
          </div>
        </div>
      )}

      {/* Workout Sub-Header: Title & Summary Counters */}
      <div className="px-4 py-2.5 bg-[#12171f] border-b border-[#262a30]/60 flex items-center justify-between shrink-0">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => onWorkoutNameChange(e.target.value)}
          className="text-base font-bold text-white bg-transparent border-none outline-none max-w-[240px] truncate focus:bg-[#181c21] focus:px-2 rounded transition-all"
          title="Clique para editar o título do treino"
        />

        <div className="flex items-center gap-3 text-xs text-[#8c90a1]">
          <span className="font-semibold text-white">{exerciseCount} ex</span>
          <span>•</span>
          <span className="font-bold text-[#4edea3] tabular-nums">
            {totalVolume.toLocaleString()} kg
          </span>
          {detectedPrs > 0 && (
            <span className="flex items-center gap-1 text-[#ffb59d] font-bold">
              <Award className="w-3.5 h-3.5" />
              {detectedPrs} PR
            </span>
          )}
        </div>
      </div>
    </>
  );
};
