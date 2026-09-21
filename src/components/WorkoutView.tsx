import React, { useState, useEffect } from 'react';
import {
  Plus,
  Flame,
  Calendar,
  Dumbbell,
  Clock,
  Play,
  Eye,
  CheckCircle2,
  Award,
  BookOpen,
  History,
  RotateCcw,
  TrendingUp,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Routine, Exercise, WorkoutSessionRecord, TabType } from '../types';
import { INITIAL_ROUTINES } from '../data/mockData';
import { SommaTrainBadge } from './SommaTrainBadge';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { WorkoutSessionDetailModal } from './WorkoutSessionDetailModal';
import { storageService } from '../services/storageService';
import { useUser } from '../context/UserContext';
import { useWorkout } from '../context/WorkoutContext';
import { PageHeader } from './PageHeader';

interface WorkoutViewProps {
  onStartRoutine: (routine: Routine | null) => void;
  onViewRoutineDetail: (routine: Routine) => void;
  onNavigate?: (tab: TabType) => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  onStartRoutine,
  onViewRoutineDetail,
  onNavigate
}) => {
  const { user } = useUser();
  const { workoutStatus, activeSession, maximizeWorkout } = useWorkout();
  const [routines, setRoutines] = useState<Routine[]>(INITIAL_ROUTINES);
  const [showNewRoutineModal, setShowNewRoutineModal] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineMuscle, setNewRoutineMuscle] = useState('');
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [targetRoutineForExercise, setTargetRoutineForExercise] = useState<Routine | null>(null);
  
  // Historical sessions for current logged in user
  const [historySessions, setHistorySessions] = useState<WorkoutSessionRecord[]>([]);
  const [selectedHistorySession, setSelectedHistorySession] = useState<WorkoutSessionRecord | null>(null);

  // Load user-specific sessions whenever user changes or view is focused
  const loadUserSessions = () => {
    if (user?.id) {
      const sessions = storageService.getWorkoutSessions(user.id);
      setHistorySessions(sessions);
    } else {
      setHistorySessions([]);
    }
  };

  useEffect(() => {
    loadUserSessions();
  }, [user?.id]);

  // Check if today's workout was completed today
  const todaySession = historySessions.find((s) => s.dateDisplay === 'Hoje' || s.dateDisplay.toLowerCase().includes('hoje'));
  const todayPlannedRoutine = routines[0] || INITIAL_ROUTINES[0];

  const handleCreateRoutine = () => {
    if (!newRoutineName.trim()) return;
    const newRoutine: Routine = {
      id: `custom-${Date.now()}`,
      name: newRoutineName.trim(),
      category: newRoutineMuscle.trim() || 'Personalizado',
      muscleGroups: newRoutineMuscle.trim() || 'Vários',
      lastSession: 'Nunca realizado',
      exercisesCount: 3,
      estimatedMinutes: 50,
      exercises: [
        {
          id: `ex-cust-1`,
          name: 'Supino Reto com Barra',
          muscleGroup: 'Peitoral',
          sets: [
            { id: 'cs-1', setNumber: 1, prevWeight: 80, prevReps: 10, weight: 80, reps: 10, completed: false },
            { id: 'cs-2', setNumber: 2, prevWeight: 84, prevReps: 8, weight: 84, reps: 8, completed: false }
          ]
        },
        {
          id: `ex-cust-2`,
          name: 'Desenvolvimento Militar',
          muscleGroup: 'Ombros',
          sets: [
            { id: 'cs-3', setNumber: 1, prevWeight: 20, prevReps: 10, weight: 20, reps: 10, completed: false },
            { id: 'cs-4', setNumber: 2, prevWeight: 22, prevReps: 8, weight: 22, reps: 8, completed: false }
          ]
        }
      ]
    };
    setRoutines([newRoutine, ...routines]);
    setNewRoutineName('');
    setNewRoutineMuscle('');
    setShowNewRoutineModal(false);
  };

  const handleAddExerciseFromLibrary = (exercise: Exercise) => {
    if (targetRoutineForExercise) {
      setRoutines((prev) =>
        prev.map((r) => {
          if (r.id === targetRoutineForExercise.id) {
            const updated = [...r.exercises, exercise];
            return {
              ...r,
              exercises: updated,
              exercisesCount: updated.length
            };
          }
          return r;
        })
      );
    } else {
      // Start instant workout with selected exercise
      onStartRoutine({
        id: `workout-${Date.now()}`,
        name: 'Treino com Exercício Selecionado',
        category: exercise.muscleGroup,
        muscleGroups: exercise.muscleGroup,
        lastSession: 'Hoje',
        exercisesCount: 1,
        estimatedMinutes: 45,
        exercises: [exercise]
      });
      setShowExerciseLibrary(false);
    }
  };

  const handleRepeatHistoricalSession = (session: WorkoutSessionRecord) => {
    const routineFromHistory: Routine = {
      id: session.routineId || `routine-${Date.now()}`,
      name: session.routineName,
      category: session.muscleGroups || 'Treino',
      muscleGroups: session.muscleGroups,
      lastSession: session.dateDisplay,
      exercisesCount: session.exercises.length,
      estimatedMinutes: session.durationMinutes,
      exercises: session.exercises.map((ex) => ({
        id: ex.exerciseId,
        name: ex.exerciseName,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets.map((s, sIdx) => ({
          id: `s-${sIdx}`,
          setNumber: s.setNumber,
          prevWeight: s.weight,
          prevReps: s.reps,
          weight: s.weight,
          reps: s.reps,
          completed: false
        }))
      }))
    };
    onStartRoutine(routineFromHistory);
  };

  return (
    <div className="flex flex-col w-full pb-24 md:pb-12 gap-5">
      {/* Top Welcome & Consistency Header */}
      <section className="flex flex-col gap-4">
        <PageHeader
          category="CENTRAL DE TREINAMENTO"
          title="Treino"
          subtitle="Rotinas ativas, prescrições e histórico de sessões"
          badge={
            <div className="flex items-center gap-1.5 bg-[#1c2025] px-3 py-1.5 rounded-full border border-[#262a30]">
              <Flame className="w-4 h-4 text-[#4edea3] fill-[#4edea3]" />
              <span className="text-xs font-bold text-white">
                {user?.streakDays || 14} Dias
              </span>
            </div>
          }
        />

        {/* Quick Action Buttons: Iniciar Treino Vazio + Biblioteca */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onStartRoutine(null)}
            className="h-[52px] bg-[#0066ff] hover:bg-[#0054d6] active:scale-[0.98] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Iniciar Treino Vazio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetRoutineForExercise(null);
              setShowExerciseLibrary(true);
            }}
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
      </section>

      {/* 1. SEÇÃO TREINO DE HOJE */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-bold text-white tracking-tight uppercase text-[11px] text-[#8c90a1]">
            Treino de Hoje
          </h2>
          {todaySession ? (
            <span className="text-xs text-[#4edea3] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Concluído Hoje
            </span>
          ) : (
            <span className="text-xs text-[#b3c5ff] font-semibold">Programado</span>
          )}
        </div>

        {/* Em Andamento Banner if Minimized */}
        {workoutStatus === 'minimized' && activeSession && (
          <div className="bg-[#1c2025] p-4 md:p-5 rounded-2xl border border-[#0066ff]/50 flex flex-col gap-3.5 shadow-lg shadow-[#0066ff]/10 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0066ff]/20 text-[#79a9ff] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066ff] animate-ping" />
                    EM ANDAMENTO
                  </span>
                  <span className="text-xs text-[#8c90a1] font-mono">{Math.floor(activeSession.seconds / 60)} min decorridos</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{activeSession.workoutName}</h3>
                <span className="text-xs text-[#8c90a1]">{activeSession.muscleGroups}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0066ff]/20 border border-[#0066ff]/40 flex items-center justify-center text-[#79a9ff]">
                <Dumbbell className="w-5 h-5" />
              </div>
            </div>

            <button
              type="button"
              onClick={maximizeWorkout}
              className="w-full h-11 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retomar Treino em Andamento</span>
            </button>
          </div>
        )}

        {todaySession ? (
          /* Card when today's workout has already been completed */
          <div className="bg-[#1c2025] p-4 md:p-5 rounded-2xl border border-[#00a572]/40 flex flex-col gap-3.5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a572]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00a572]/20 text-[#4edea3] text-[10px] font-extrabold uppercase tracking-wider">
                    PAGO HOJE
                  </span>
                  <span className="text-xs text-[#8c90a1]">{todaySession.dateDisplay}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{todaySession.routineName}</h3>
                <span className="text-xs text-[#8c90a1]">{todaySession.muscleGroups || 'Treino Completo'}</span>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#00a572]/20 border border-[#00a572]/40 flex items-center justify-center text-[#4edea3]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 py-1 border-y border-[#262a30]">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#8c90a1] font-semibold uppercase">Duração</span>
                <span className="text-sm font-bold text-white">{todaySession.durationFormatted}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#8c90a1] font-semibold uppercase">Volume Total</span>
                <span className="text-sm font-bold text-[#4edea3] tabular-nums">
                  {todaySession.totalVolume.toLocaleString()} kg
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#8c90a1] font-semibold uppercase">Séries</span>
                <span className="text-sm font-bold text-[#b3c5ff]">{todaySession.totalCompletedSets} feitas</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <button
                type="button"
                onClick={() => setSelectedHistorySession(todaySession)}
                className="flex-1 h-11 bg-[#262a30] hover:bg-[#31353b] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Ver Resumo Completo</span>
              </button>

              <button
                type="button"
                onClick={() => onStartRoutine(todayPlannedRoutine)}
                className="h-11 px-4 bg-[#0066ff]/20 hover:bg-[#0066ff]/30 text-[#b3c5ff] border border-[#0066ff]/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Iniciar outro treino hoje"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Treinar Novamente</span>
              </button>
            </div>
          </div>
        ) : (
          /* Card when today's workout has not been started yet */
          <div className="bg-[#1c2025] p-4 md:p-5 rounded-2xl border border-[#262a30] hover:border-[#0066ff]/40 flex flex-col gap-3.5 shadow-sm transition-all">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0066ff]/20 text-[#b3c5ff] text-[10px] font-extrabold uppercase tracking-wider">
                    {todayPlannedRoutine.category || 'Treino A'}
                  </span>
                  {todayPlannedRoutine.isProfessionalCertified && todayPlannedRoutine.certifiedBy && (
                    <SommaTrainBadge certificate={todayPlannedRoutine.certifiedBy} size="sm" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{todayPlannedRoutine.name}</h3>
                <span className="text-xs text-[#8c90a1]">
                  {todayPlannedRoutine.muscleGroups || 'Peitoral, Ombros e Tríceps'}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#262a30] text-[#c2c6d8] text-xs font-semibold">
                Hoje
              </span>
            </div>

            <div className="flex items-center gap-4 py-1 border-y border-[#262a30] text-xs text-[#c2c6d8]">
              <div className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-[#8c90a1]" />
                <span>{todayPlannedRoutine.exercisesCount} exercícios</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#424656]"></div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#8c90a1]" />
                <span>~{todayPlannedRoutine.estimatedMinutes} min</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#424656]"></div>
              <div className="flex items-center gap-1 text-[#4edea3]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Sobrecarga progressiva</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartRoutine(todayPlannedRoutine)}
              className="w-full h-12 bg-[#0066ff] hover:bg-[#0054d6] active:scale-[0.98] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>INICIAR TREINO</span>
            </button>
          </div>
        )}
      </section>

      {/* 2. SEÇÃO SEUS TREINOS / MINHAS ROTINAS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">Seus Treinos</h2>
            <span className="bg-[#262a30] text-[#c2c6d8] px-2 py-0.5 rounded-full text-[11px] font-bold">
              {routines.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowNewRoutineModal(true)}
            className="text-[#0066ff] hover:text-[#b3c5ff] text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Rotina</span>
          </button>
        </div>

        {/* Routines Stack */}
        <div className="flex flex-col gap-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="bg-[#1c2025] p-4 rounded-2xl border border-[#262a30] flex flex-col gap-3 shadow-sm hover:border-[#31353b] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col pr-2 gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white leading-snug">{routine.name}</h3>
                    {routine.isProfessionalCertified && routine.certifiedBy && (
                      <SommaTrainBadge certificate={routine.certifiedBy} size="sm" />
                    )}
                  </div>
                  <span className="text-xs text-[#8c90a1]">
                    {routine.muscleGroups || routine.category} • Última sessão: {routine.lastSession}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-[#262a30] text-[11px] font-bold text-[#b3c5ff] shrink-0">
                  {routine.category}
                </span>
              </div>

              <div className="flex items-center gap-4 py-0.5 text-xs text-[#c2c6d8]">
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-[#8c90a1]" />
                  <span>{routine.exercisesCount} exercícios</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[#424656]"></div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#8c90a1]" />
                  <span>~{routine.estimatedMinutes} min</span>
                </div>
              </div>

              {/* Action row: Iniciar + Adicionar Exercício + Visualizar */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onStartRoutine(routine)}
                  className="flex-1 h-11 bg-[#0066ff] hover:bg-[#0054d6] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Iniciar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetRoutineForExercise(routine);
                    setShowExerciseLibrary(true);
                  }}
                  className="h-11 px-3 bg-[#262a30] hover:bg-[#31353b] text-[#b3c5ff] hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Adicionar exercício da biblioteca a este treino"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exercício</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewRoutineDetail(routine)}
                  aria-label={`Visualizar detalhes de ${routine.name}`}
                  className="h-11 px-3.5 bg-[#262a30] hover:bg-[#31353b] text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SEÇÃO HISTÓRICO DE TREINOS */}
      <section className="flex flex-col gap-3 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#0066ff]" />
            <h2 className="text-sm font-bold text-white tracking-tight">Histórico de Treinos</h2>
          </div>
          <span className="text-xs text-[#8c90a1]">{historySessions.length} sessões</span>
        </div>

        {historySessions.length === 0 ? (
          <div className="bg-[#1c2025] p-6 rounded-2xl border border-[#262a30] text-center flex flex-col items-center gap-2">
            <History className="w-8 h-8 text-[#8c90a1]" />
            <span className="text-sm font-bold text-white">Nenhum treino registrado ainda</span>
            <p className="text-xs text-[#8c90a1] max-w-xs">
              Conclua sua primeira sessão para visualizar seu histórico e progressão de volume.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {historySessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedHistorySession(session)}
                className="w-full bg-[#1c2025] hover:bg-[#262a30] p-3.5 rounded-2xl border border-[#262a30] hover:border-[#31353b] flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-[#14181f] border border-[#262a30] flex items-center justify-center text-[#4edea3] shrink-0 group-hover:border-[#0066ff]/40 transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#4edea3]">
                        {session.dateDisplay}
                      </span>
                      <span className="text-[#424656] text-xs">•</span>
                      <span className="text-xs text-[#8c90a1]">{session.durationFormatted}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate leading-snug mt-0.5">
                      {session.routineName}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-[#8c90a1] mt-0.5">
                      <span>{session.totalExercises} exercícios</span>
                      <span>•</span>
                      <span className="text-[#b3c5ff] font-semibold tabular-nums">
                        {session.totalVolume.toLocaleString()} kg
                      </span>
                      {session.prsCount && session.prsCount > 0 ? (
                        <>
                          <span>•</span>
                          <span className="text-[#ffb59d] font-bold flex items-center gap-0.5">
                            <Award className="w-3 h-3" />
                            {session.prsCount} PR
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#8c90a1] group-hover:text-white transition-colors shrink-0">
                  <span className="text-xs font-semibold hidden sm:inline">Ver detalhes</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Modal for creating a new routine */}
      {showNewRoutineModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1c2025] border border-[#262a30] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">Criar Nova Rotina de Treino</h3>
            <p className="text-xs text-[#8c90a1]">
              Defina o título e foco muscular da rotina para estruturar suas séries.
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-[#8c90a1] uppercase block mb-1">
                  Nome da Rotina
                </label>
                <input
                  type="text"
                  placeholder="Ex: Treino D - Ombros e Abdômen"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#181c21] border border-[#262a30] text-white text-sm focus:border-[#0066ff] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#8c90a1] uppercase block mb-1">
                  Foco Muscular
                </label>
                <input
                  type="text"
                  placeholder="Ex: Deltóides e Core"
                  value={newRoutineMuscle}
                  onChange={(e) => setNewRoutineMuscle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#181c21] border border-[#262a30] text-white text-sm focus:border-[#0066ff] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewRoutineModal(false)}
                className="flex-1 h-10 rounded-xl bg-[#262a30] text-xs font-semibold text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateRoutine}
                className="flex-1 h-10 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] text-xs font-bold text-white cursor-pointer"
              >
                Salvar Rotina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Session Detail Modal */}
      {selectedHistorySession && (
        <WorkoutSessionDetailModal
          session={selectedHistorySession}
          onClose={() => setSelectedHistorySession(null)}
          onRepeatWorkout={handleRepeatHistoricalSession}
        />
      )}

      {/* Exercise Library Modal */}
      {showExerciseLibrary && (
        <ExerciseLibraryModal
          title={
            targetRoutineForExercise
              ? `Adicionar à rotina: ${targetRoutineForExercise.name}`
              : 'Biblioteca de Exercícios SOMMA'
          }
          onClose={() => {
            setShowExerciseLibrary(false);
            setTargetRoutineForExercise(null);
          }}
          onAddExercise={handleAddExerciseFromLibrary}
        />
      )}
    </div>
  );
};
