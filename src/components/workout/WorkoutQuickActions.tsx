import React from 'react';
import { Plus, BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import { TabType } from '../../types';

interface WorkoutQuickActionsProps {
  onStartEmptyWorkout: () => void;
  onOpenExerciseLibrary: () => void;
  onNavigate?: (tab: TabType) => void;
}

export const WorkoutQuickActions: React.FC<WorkoutQuickActionsProps> = ({
  onStartEmptyWorkout,
  onOpenExerciseLibrary,
  onNavigate
}) => {
  return (
    <>
      {/* Quick Action Buttons: Iniciar Treino Vazio + Biblioteca */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onStartEmptyWorkout}
          className="h-[52px] bg-[#0066ff] hover:bg-[#0054d6] active:scale-[0.98] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Iniciar Treino Vazio</span>
        </button>

        <button
          type="button"
          onClick={onOpenExerciseLibrary}
          className="h-[52px] bg-[#1c2025] hover:bg-[#262a30] active:scale-[0.98] text-white border border-[#31353b] hover:border-[#0066ff]/50 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <BookOpen className="w-5 h-5 text-[#0066ff] group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span>Biblioteca de Exercícios</span>
            <span className="text-[10px] bg-[#0066ff]/20 text-[#b3c5ff] px-2 py-0.5 rounded-full font-black">
              30+
            </span>
          </div>
        </button>
      </div>

      {/* Contextual Access to Evolução de Cargas & PRs */}
      {onNavigate && (
        <button
          type="button"
          onClick={() => onNavigate('evolucao')}
          className="w-full p-3.5 rounded-2xl bg-[#1c2025] hover:bg-[#22272e] border border-[#262a30] hover:border-[#ffb59d]/40 flex items-center justify-between transition-all cursor-pointer group text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffb59d]/15 text-[#ffb59d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Evolução & Progressão de Cargas</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#ffb59d]/20 text-[#ffb59d]">
                  PRs & Métricas
                </span>
              </div>
              <span className="text-[11px] text-[#8c90a1] mt-0.5">
                Acompanhe recordes pessoais, 1RM estimada e histórico de sobrecarga
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8c90a1] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      )}
    </>
  );
};
