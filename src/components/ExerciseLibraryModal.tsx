import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Dumbbell, 
  Check, 
  Plus, 
  Filter, 
  Info, 
  Flame, 
  Sparkles,
  ChevronRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { LibraryExercise, Exercise } from '../types';

interface ExerciseLibraryModalProps {
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
  title?: string;
}

const MUSCLE_GROUPS = [
  'Todos',
  'Peitoral',
  'Costas',
  'Ombros',
  'Pernas',
  'Braços',
  'Core'
];

const EQUIPMENTS = ['Todos', 'Barra', 'Halteres', 'Máquina', 'Polia', 'Peso Corporal'];

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  onClose,
  onAddExercise,
  title = 'Biblioteca de Exercícios'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState('Todos');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<LibraryExercise | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter((ex) => {
      const matchSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.targetMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());

      const matchMuscle =
        selectedMuscle === 'Todos' || ex.muscleGroup.toLowerCase() === selectedMuscle.toLowerCase();

      const matchEquipment =
        selectedEquipment === 'Todos' || ex.equipment.toLowerCase() === selectedEquipment.toLowerCase();

      return matchSearch && matchMuscle && matchEquipment;
    });
  }, [searchQuery, selectedMuscle, selectedEquipment]);

  const handleSelectAndAdd = (libEx: LibraryExercise) => {
    // Convert to Exercise format
    const newExercise: Exercise = {
      id: `ex-lib-${Date.now()}-${libEx.id}`,
      name: libEx.name,
      muscleGroup: libEx.muscleGroup,
      equipment: libEx.equipment,
      targetMuscles: libEx.targetMuscles,
      tips: libEx.tips,
      sets: Array.from({ length: libEx.defaultSets }, (_, idx) => ({
        id: `set-${Date.now()}-${idx + 1}`,
        setNumber: idx + 1,
        weight: libEx.defaultWeight,
        reps: libEx.defaultReps,
        completed: false
      }))
    };

    onAddExercise(newExercise);
    setAddedIds((prev) => [...prev, libEx.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== libEx.id));
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#14181f] border border-[#2a303c] rounded-3xl p-4 sm:p-6 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262a30]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0066ff]/20 text-[#0066ff] flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{title}</h3>
              <p className="text-xs text-[#8c90a1]">
                {EXERCISE_LIBRARY.length} movimentos calibrados com biomecânica SOMMA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c2025] hover:bg-[#262a30] text-[#c2c6d8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8c90a1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por exercício, músculo ou foco (ex: Supino, Dorsal, Glúteo)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#101419] border border-[#262a30] text-white text-xs sm:text-sm placeholder-[#8c90a1] focus:border-[#0066ff] outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c90a1] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills - Muscle Group */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg}
                type="button"
                onClick={() => setSelectedMuscle(mg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedMuscle === mg
                    ? 'bg-[#0066ff] text-white shadow-md'
                    : 'bg-[#181c21] text-[#8c90a1] hover:text-white hover:bg-[#20252c]'
                }`}
              >
                {mg}
              </button>
            ))}
          </div>

          {/* Filter Pills - Equipment */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-[#8c90a1] font-semibold text-[10px] uppercase px-1">Aparelho:</span>
            {EQUIPMENTS.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => setSelectedEquipment(eq)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedEquipment === eq
                    ? 'bg-[#262a30] text-[#b3c5ff] border border-[#0066ff]/40 font-bold'
                    : 'text-[#8c90a1] hover:text-white'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar min-h-[260px] max-h-[420px]">
          {filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Dumbbell className="w-10 h-10 text-[#424656] mb-2" />
              <p className="text-sm font-bold text-white">Nenhum exercício encontrado</p>
              <p className="text-xs text-[#8c90a1] mt-1">
                Tente buscar por outro termo ou limpe os filtros selecionados.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMuscle('Todos');
                  setSelectedEquipment('Todos');
                }}
                className="mt-3 text-xs font-bold text-[#0066ff] hover:underline"
              >
                Resetar Filtros
              </button>
            </div>
          ) : (
            filteredExercises.map((ex) => {
              const isAdded = addedIds.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  className="bg-[#181c21] hover:bg-[#1d2229] border border-[#262a30] rounded-2xl p-3.5 flex flex-col gap-2.5 transition-all shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0066ff]/20 text-[#b3c5ff]">
                          {ex.muscleGroup}
                        </span>
                        <span className="text-[10px] font-semibold text-[#8c90a1] bg-[#101419] px-2 py-0.5 rounded-md border border-[#262a30]">
                          {ex.equipment}
                        </span>
                        <span className="text-[10px] font-semibold text-[#8c90a1]">
                          {ex.difficulty}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-white mt-1">
                        {ex.name}
                      </h4>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectAndAdd(ex)}
                      className={`h-9 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        isAdded
                          ? 'bg-[#00a572] text-white'
                          : 'bg-[#0066ff] hover:bg-[#0054d6] text-white shadow-md'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Adicionado!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Target muscles tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-[10px] font-bold text-[#8c90a1]">Foco:</span>
                    {ex.targetMuscles.map((tm, i) => (
                      <span
                        key={i}
                        className="bg-[#101419] text-[#c2c6d8] px-2 py-0.5 rounded-md text-[10px] border border-[#262a30]/60"
                      >
                        {tm}
                      </span>
                    ))}
                  </div>

                  {/* Biomechanical tip */}
                  <div className="bg-[#12161c] p-2 rounded-xl text-[11px] text-[#8c90a1] flex items-start gap-1.5 border border-[#262a30]/50">
                    <Info className="w-3.5 h-3.5 text-[#0066ff] shrink-0 mt-0.5" />
                    <span className="leading-snug">{ex.tips}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#262a30] flex items-center justify-between text-xs text-[#8c90a1]">
          <span>Exercícios com séries, cargas e repetições sugeridas padrão.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-white font-bold hover:underline cursor-pointer"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
