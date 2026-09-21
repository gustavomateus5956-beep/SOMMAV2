import React, { useState, useEffect } from 'react';
import { BookOpen, Check } from 'lucide-react';
import { Routine, Exercise, WorkoutSessionRecord, CompletedExerciseLog, SetTypeKey } from '../types';
import { ExportCardModal, WorkoutExportData } from './ExportCardModal';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { storageService } from '../services/storageService';
import { useUser } from '../context/UserContext';
import { useWorkout } from '../context/WorkoutContext';
import { SetTypeSelectorModal } from './SetTypeSelectorModal';
import { ExerciseFeedbackModal } from './ExerciseFeedbackModal';

import { ActiveWorkoutHeader } from './active-workout/ActiveWorkoutHeader';
import { ActiveWorkoutExerciseCard } from './active-workout/ActiveWorkoutExerciseCard';
import { ActiveWorkoutCelebrationModal } from './active-workout/ActiveWorkoutCelebrationModal';
import { IncompleteSetsModal, DiscardWorkoutModal } from './active-workout/ActiveWorkoutConfirmModals';

interface ActiveWorkoutModalProps {
  routine: Routine | null;
  onClose: () => void;
  onMinimize?: () => void;
  onFinishWorkout: (summary: {
    name: string;
    durationMinutes: number;
    totalVolume: number;
    setsCompleted: number;
  }) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  routine,
  onClose,
  onMinimize,
  onFinishWorkout
}) => {
  const { user, updateUser } = useUser();
  const {
    activeSession,
    minimizeWorkout,
    updateExercises: syncExercisesToContext,
    setRestSeconds: setContextRestSeconds,
    setIsRestPaused: setContextIsRestPaused,
    setIsTimerPaused: setContextIsTimerPaused,
    setLastActivePosition,
    discardWorkout: contextDiscardWorkout
  } = useWorkout();

  const [seconds, setSeconds] = useState(activeSession?.seconds || 0);
  const [isTimerPaused, setIsTimerPaused] = useState(activeSession?.isTimerPaused || false);
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    if (activeSession && activeSession.exercises && activeSession.exercises.length > 0) {
      return activeSession.exercises;
    }
    return [];
  });
  const [workoutName, setWorkoutName] = useState(
    activeSession?.workoutName || routine?.name || 'Treino Personalizado'
  );
  const [isFinished, setIsFinished] = useState(false);
  const [showIncompleteConfirm, setShowIncompleteConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [editingSetType, setEditingSetType] = useState<{ exIndex: number; setIndex: number } | null>(null);
  const [feedbackExercise, setFeedbackExercise] = useState<Exercise | null>(null);

  // Rest timer states
  const [restSeconds, setRestSeconds] = useState<number | null>(activeSession?.restSeconds ?? null);
  const [isRestPaused, setIsRestPaused] = useState(activeSession?.isRestPaused || false);
  const defaultRestTime = 60; // 60 seconds standard

  // Sync with global timer in WorkoutContext (keeps running when minimized!)
  useEffect(() => {
    if (activeSession) {
      setSeconds(activeSession.seconds);
      setRestSeconds(activeSession.restSeconds);
    }
  }, [activeSession?.seconds, activeSession?.restSeconds]);

  // Initialize exercises with previous performance references
  useEffect(() => {
    if (routine && routine.exercises.length > 0) {
      const cloned = JSON.parse(JSON.stringify(routine.exercises)) as Exercise[];
      // Enrich with previous exercise data if available for current user
      if (user?.id) {
        cloned.forEach((ex) => {
          const past = storageService.getLastExercisePerformance(user.id, ex.name);
          if (past && past.sets.length > 0) {
            ex.sets.forEach((set, idx) => {
              if (past.sets[idx]) {
                set.prevWeight = past.sets[idx].weight;
                set.prevReps = past.sets[idx].reps;
              }
            });
          }
        });
      }
      setExercises(cloned);
      setWorkoutName(routine.name);
    } else {
      // Empty workout initial state
      setExercises([
        {
          id: 'custom-ex-1',
          name: 'Supino Reto com Barra',
          muscleGroup: 'Peitoral',
          sets: [
            { id: 'cs1', setNumber: 1, prevWeight: 80, prevReps: 10, weight: 80, reps: 10, completed: false },
            { id: 'cs2', setNumber: 2, prevWeight: 84, prevReps: 8, weight: 84, reps: 8, completed: false },
            { id: 'cs3', setNumber: 3, prevWeight: 90, prevReps: 6, weight: 90, reps: 6, completed: false }
          ]
        }
      ]);
      setWorkoutName('Treino Livre');
    }
  }, [routine, user?.id]);

  // Main workout elapsed timer
  useEffect(() => {
    if (isTimerPaused || isFinished) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, isFinished]);

  // Rest countdown timer
  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0 || isRestPaused) return;
    const interval = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev === null || prev <= 1) {
          setContextRestSeconds(null);
          return null;
        }
        const next = prev - 1;
        setContextRestSeconds(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restSeconds, isRestPaused, setContextRestSeconds]);

  // Sync state to WorkoutContext whenever exercises change
  const updateExercisesAndSync = (newExercises: Exercise[]) => {
    setExercises(newExercises);
    syncExercisesToContext(newExercises);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRemoveExercise = (exIndex: number) => {
    const updated = exercises.filter((_, idx) => idx !== exIndex);
    updateExercisesAndSync(updated);
  };

  const handleAddExerciseFromLibrary = (exerciseData: {
    name: string;
    muscleGroup: string;
    equipment?: string;
  }) => {
    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name: exerciseData.name,
      muscleGroup: exerciseData.muscleGroup,
      equipment: exerciseData.equipment,
      sets: [
        {
          id: `s-${Date.now()}-1`,
          setNumber: 1,
          type: 'working',
          weight: 40,
          reps: 10,
          completed: false
        },
        {
          id: `s-${Date.now()}-2`,
          setNumber: 2,
          type: 'working',
          weight: 40,
          reps: 10,
          completed: false
        },
        {
          id: `s-${Date.now()}-3`,
          setNumber: 3,
          type: 'working',
          weight: 40,
          reps: 10,
          completed: false
        }
      ]
    };
    updateExercisesAndSync([...exercises, newEx]);
    setShowExerciseLibrary(false);
  };

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const targetEx = { ...updated[exIndex] };
    const sets = [...targetEx.sets];
    const currentStatus = sets[setIndex].completed;
    sets[setIndex] = {
      ...sets[setIndex],
      completed: !currentStatus
    };
    targetEx.sets = sets;
    updated[exIndex] = targetEx;
    updateExercisesAndSync(updated);

    // Save position for quick resume
    setLastActivePosition(exIndex, setIndex);

    // If completed and rest timer wasn't running, trigger standard rest timer
    if (!currentStatus) {
      setRestSeconds(defaultRestTime);
      setContextRestSeconds(defaultRestTime);
      setIsRestPaused(false);
      setContextIsRestPaused(false);
    }
  };

  const updateSetField = (
    exIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: number
  ) => {
    const updated = [...exercises];
    const targetEx = { ...updated[exIndex] };
    const sets = [...targetEx.sets];
    sets[setIndex] = {
      ...sets[setIndex],
      [field]: value
    };
    targetEx.sets = sets;
    updated[exIndex] = targetEx;
    updateExercisesAndSync(updated);
  };

  const adjustSetWeight = (exIndex: number, setIndex: number, delta: number) => {
    const current = exercises[exIndex]?.sets[setIndex]?.weight || 0;
    const nextVal = Math.max(0, current + delta);
    updateSetField(exIndex, setIndex, 'weight', nextVal);
  };

  const addSetToExercise = (exIndex: number) => {
    const updated = [...exercises];
    const targetEx = { ...updated[exIndex] };
    const prevSet = targetEx.sets[targetEx.sets.length - 1];
    targetEx.sets.push({
      id: `s-${Date.now()}-${targetEx.sets.length + 1}`,
      setNumber: targetEx.sets.length + 1,
      type: 'working',
      prevWeight: prevSet?.weight || 60,
      prevReps: prevSet?.reps || 10,
      weight: prevSet?.weight || 60,
      reps: prevSet?.reps || 10,
      completed: false
    });
    updateExercisesAndSync(updated);
  };

  const removeLastSet = (exIndex: number) => {
    const updated = [...exercises];
    if (updated[exIndex].sets.length > 1) {
      updated[exIndex].sets.pop();
      updateExercisesAndSync(updated);
    }
  };

  // Metrics calculation
  let totalVolume = 0;
  let totalCompletedSets = 0;
  let totalSetsCount = 0;
  let detectedPrs = 0;

  exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      totalSetsCount++;
      if (set.completed) {
        totalVolume += (set.weight || 0) * (set.reps || 0);
        totalCompletedSets++;
        if (set.prevWeight && set.weight > set.prevWeight && set.reps >= (set.prevReps || 0)) {
          detectedPrs++;
        }
      }
    });
  });

  const progressPercentage =
    totalSetsCount > 0 ? Math.round((totalCompletedSets / totalSetsCount) * 100) : 0;

  const handleFinishAttempt = () => {
    const uncompleted = totalSetsCount - totalCompletedSets;
    if (uncompleted > 0) {
      setShowIncompleteConfirm(true);
    } else {
      setIsFinished(true);
    }
  };

  const confirmFinishWorkout = () => {
    setShowIncompleteConfirm(false);
    setIsFinished(true);
  };

  const handleUpdateSetType = (type: SetTypeKey) => {
    if (!editingSetType) return;
    const { exIndex, setIndex } = editingSetType;
    const updated = [...exercises];
    const targetEx = { ...updated[exIndex] };
    const sets = [...targetEx.sets];
    sets[setIndex] = {
      ...sets[setIndex],
      type
    };
    targetEx.sets = sets;
    updated[exIndex] = targetEx;
    updateExercisesAndSync(updated);
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      minimizeWorkout();
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(false);
    contextDiscardWorkout();
    onClose();
  };

  // Final persistence to user storage & Context
  const handleSaveAndExit = () => {
    const durationMinutes = Math.max(1, Math.round(seconds / 60));
    const now = new Date();

    const completedExercises: CompletedExerciseLog[] = exercises.map((ex) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: ex.muscleGroup,
      professionalNote: ex.professionalNote,
      sets: ex.sets.map((s) => ({
        setNumber: s.setNumber,
        type: s.type || 'working',
        targetWeight: s.targetWeight,
        targetReps: s.targetReps,
        weight: s.weight,
        reps: s.reps,
        completed: s.completed,
        prevWeight: s.prevWeight,
        prevReps: s.prevReps,
        isPr: Boolean(s.prevWeight && s.weight > s.prevWeight && s.reps >= (s.prevReps || 0)),
        instruction: s.instruction
      }))
    }));

    const sessionRecord: WorkoutSessionRecord = {
      id: `workout-session-${Date.now()}`,
      userId: user?.id || 'user_lucas_default',
      routineId: routine?.id,
      routineName: workoutName,
      muscleGroups: exercises.map((e) => e.muscleGroup).slice(0, 2).join(' & '),
      startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
      finishedAt: now.toISOString(),
      dateDisplay: 'Hoje',
      durationMinutes,
      durationFormatted: `${durationMinutes} min`,
      totalVolume,
      totalCompletedSets,
      totalExercises: exercises.length,
      prsCount: detectedPrs,
      exercises: completedExercises,
      notes: routine?.category ? `Categoria: ${routine.category}` : undefined
    };

    if (user?.id) {
      storageService.saveWorkoutSession(user.id, sessionRecord);
      updateUser({
        totalWorkouts: (user.totalWorkouts || 0) + 1,
        totalPrs: (user.totalPrs || 0) + detectedPrs
      });
    }

    contextDiscardWorkout();

    onFinishWorkout({
      name: workoutName,
      durationMinutes,
      totalVolume,
      setsCompleted: totalCompletedSets
    });
    onClose();
  };

  // Prepare payload for social export modal
  const exportWorkoutPayload: WorkoutExportData = {
    title: workoutName,
    duration: formatTimer(seconds),
    volume: `${totalVolume.toLocaleString()} kg`,
    exercisesCount: exercises.length,
    completedSets: totalCompletedSets,
    prsCount: detectedPrs,
    exercisesPreview: exercises.slice(0, 4).map((ex) => ({
      name: ex.name,
      detail: `${ex.sets.filter((s) => s.completed).length}/${ex.sets.length} séries • ${ex.muscleGroup}`
    }))
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end md:justify-center items-center">
      <div className="w-full max-w-[500px] h-[95vh] md:h-[90vh] bg-[#101419] border border-[#262a30] rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Top Sticky Bar: Live Timer, Progress, Rest Bar and Sub-Header */}
        <ActiveWorkoutHeader
          isTimerPaused={isTimerPaused}
          seconds={seconds}
          onTogglePauseTimer={() => {
            const next = !isTimerPaused;
            setIsTimerPaused(next);
            setContextIsTimerPaused(next);
          }}
          onMinimize={handleMinimize}
          onRequestDiscard={() => setShowDiscardConfirm(true)}
          totalCompletedSets={totalCompletedSets}
          totalSetsCount={totalSetsCount}
          progressPercentage={progressPercentage}
          restSeconds={restSeconds}
          isRestPaused={isRestPaused}
          onAddRestSeconds={(delta) => {
            if (delta > 0) {
              setRestSeconds((prev) => (prev ? prev + delta : delta));
            } else {
              setRestSeconds((prev) => (prev && prev > 15 ? prev + delta : null));
            }
          }}
          onTogglePauseRest={() => {
            const next = !isRestPaused;
            setIsRestPaused(next);
            setContextIsRestPaused(next);
          }}
          onSkipRest={() => {
            setRestSeconds(null);
            setContextRestSeconds(null);
          }}
          workoutName={workoutName}
          onWorkoutNameChange={setWorkoutName}
          exerciseCount={exercises.length}
          totalVolume={totalVolume}
          detectedPrs={detectedPrs}
          formatTimer={formatTimer}
        />

        {/* Scrollable Exercises & Sets Area (Hevy-style Cards) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
          {exercises.map((exercise, exIndex) => (
            <ActiveWorkoutExerciseCard
              key={exercise.id || `ex-${exIndex}`}
              exercise={exercise}
              exIndex={exIndex}
              totalExercises={exercises.length}
              onOpenFeedback={setFeedbackExercise}
              onStartRest={() => {
                setRestSeconds(defaultRestTime);
                setIsRestPaused(false);
              }}
              onRemoveExercise={handleRemoveExercise}
              onEditSetType={(eIdx, sIdx) => setEditingSetType({ exIndex: eIdx, setIndex: sIdx })}
              onAdjustSetWeight={adjustSetWeight}
              onUpdateSetField={updateSetField}
              onToggleSetComplete={toggleSetComplete}
              onAddSet={addSetToExercise}
              onRemoveLastSet={removeLastSet}
            />
          ))}

          {/* Add Exercise from SOMMA Library */}
          <button
            type="button"
            onClick={() => setShowExerciseLibrary(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#14181f] hover:bg-[#1c2025] border border-dashed border-[#262a30] hover:border-[#0066ff] text-[#0066ff] hover:text-[#b3c5ff] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Adicionar Exercício da Biblioteca SOMMA</span>
          </button>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 bg-[#181c21] border-t border-[#262a30] flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowDiscardConfirm(true)}
            className="h-12 px-4 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Pausar / Sair
          </button>
          <button
            type="button"
            onClick={handleFinishAttempt}
            className="flex-1 h-12 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0066ff]/20 transition-all cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Finalizar Treino</span>
          </button>
        </div>

        {/* Confirmation Modal for Incomplete Sets */}
        <IncompleteSetsModal
          isOpen={showIncompleteConfirm}
          pendingSetsCount={totalSetsCount - totalCompletedSets}
          onContinueWorkout={() => setShowIncompleteConfirm(false)}
          onConfirmFinish={confirmFinishWorkout}
        />

        {/* Confirmation Modal for Discard / Pause */}
        <DiscardWorkoutModal
          isOpen={showDiscardConfirm}
          onMinimize={() => {
            setShowDiscardConfirm(false);
            handleMinimize();
          }}
          onDiscard={handleDiscard}
          onCancel={() => setShowDiscardConfirm(false)}
        />

        {/* Celebratory Finish Summary Screen */}
        <ActiveWorkoutCelebrationModal
          isOpen={isFinished}
          workoutName={workoutName}
          seconds={seconds}
          totalVolume={totalVolume}
          totalCompletedSets={totalCompletedSets}
          detectedPrs={detectedPrs}
          exercises={exercises}
          formatTimer={formatTimer}
          onOpenExport={() => setShowExportModal(true)}
          onSaveAndExit={handleSaveAndExit}
        />

      </div>

      {/* Social Export Modal */}
      {showExportModal && (
        <ExportCardModal
          workoutData={exportWorkoutPayload}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* In-Workout Exercise Library Modal */}
      {showExerciseLibrary && (
        <ExerciseLibraryModal
          title="Adicionar Exercício ao Treino"
          onClose={() => setShowExerciseLibrary(false)}
          onAddExercise={handleAddExerciseFromLibrary}
        />
      )}

      {/* Set Type Selector Modal */}
      {editingSetType && (
        <SetTypeSelectorModal
          setNumber={exercises[editingSetType.exIndex]?.sets[editingSetType.setIndex]?.setNumber || 1}
          currentType={exercises[editingSetType.exIndex]?.sets[editingSetType.setIndex]?.type || 'working'}
          exerciseName={exercises[editingSetType.exIndex]?.name || 'Exercício'}
          onClose={() => setEditingSetType(null)}
          onSelectType={handleUpdateSetType}
        />
      )}

      {/* Exercise Feedback & Question Modal (Teacher & Feed) */}
      {feedbackExercise && (
        <ExerciseFeedbackModal
          exercise={feedbackExercise}
          routineName={workoutName}
          currentWeight={feedbackExercise.sets.find((s) => s.completed && s.weight > 0)?.weight || feedbackExercise.sets[0]?.weight}
          currentReps={feedbackExercise.sets.find((s) => s.completed && s.reps > 0)?.reps || feedbackExercise.sets[0]?.reps}
          onClose={() => setFeedbackExercise(null)}
          onSendMessageToCoach={(msg) => {
            try {
              const existingNotifs = JSON.parse(localStorage.getItem('somma_coach_queries') || '[]');
              existingNotifs.unshift({
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                ...msg
              });
              localStorage.setItem('somma_coach_queries', JSON.stringify(existingNotifs));
            } catch (e) {
              console.error(e);
            }
          }}
          onPostToFeed={(post) => {
            try {
              const existingPosts = JSON.parse(localStorage.getItem('somma_community_posts') || '[]');
              existingPosts.unshift({
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                likes: 1,
                comments: 0,
                ...post
              });
              localStorage.setItem('somma_community_posts', JSON.stringify(existingPosts));
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}
    </div>
  );
};
