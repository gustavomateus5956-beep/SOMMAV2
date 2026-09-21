import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Info, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { Exercise } from '../types';

interface ExerciseGuidanceSectionProps {
  exercise: Exercise;
  defaultExpanded?: boolean;
  onOpenFeedback?: () => void;
}

export const ExerciseGuidanceSection: React.FC<ExerciseGuidanceSectionProps> = ({
  exercise,
  defaultExpanded = false,
  onOpenFeedback
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasProfessionalNote = Boolean(exercise.professionalNote?.trim());
  const hasInstructions = Boolean(exercise.instructions?.trim() || exercise.tips?.trim() || (exercise.executionTips && exercise.executionTips.length > 0));

  if (!hasProfessionalNote && !hasInstructions && !onOpenFeedback) {
    return null;
  }

  // Parse execution steps if available as array or multi-line string
  const steps: string[] = exercise.executionTips && exercise.executionTips.length > 0
    ? exercise.executionTips
    : exercise.instructions
      ? exercise.instructions.split('\n').map((s) => s.trim()).filter(Boolean)
      : exercise.tips
        ? [exercise.tips]
        : [];

  return (
    <div className="rounded-xl bg-[#12161c] border border-[#262a30]/80 overflow-hidden text-xs">
      {/* Professional Orientation Banner if exists */}
      {hasProfessionalNote && (
        <div className="p-3 bg-gradient-to-r from-[#0066ff]/10 via-[#161a22] to-[#00a572]/5 border-b border-[#262a30]/60">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0066ff] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0066ff]" />
              <span>Orientação do Profissional</span>
            </div>

            {onOpenFeedback && (
              <button
                type="button"
                onClick={onOpenFeedback}
                className="px-2 py-0.5 rounded-md bg-[#0066ff]/15 hover:bg-[#0066ff]/25 text-[#b3c5ff] hover:text-white text-[10px] font-bold flex items-center gap-1 border border-[#0066ff]/30 transition-colors cursor-pointer"
                title="Tirar dúvida com o professor ou postar no feed"
              >
                <MessageSquarePlus className="w-3 h-3 text-[#0066ff]" />
                <span>Dúvida / Feed</span>
              </button>
            )}
          </div>
          <p className="text-xs font-medium text-[#c2c6d8] italic leading-relaxed pl-5 border-l-2 border-[#0066ff]">
            "{exercise.professionalNote}"
          </p>
        </div>
      )}

      {/* Expandable Execution Instructions */}
      {hasInstructions && (
        <div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between text-[#8c90a1] hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#0066ff]" />
              <span className="text-[11px] font-semibold">
                {isExpanded ? 'Ocultar instruções de execução' : 'Instruções do exercício'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold text-[#b3c5ff]">
              <span>{isExpanded ? 'Recolher' : 'Ver instruções'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {isExpanded && (
            <div className="px-3 pb-3 pt-1 border-t border-[#262a30]/50 space-y-2 animate-in fade-in duration-200">
              {steps.length > 0 ? (
                <div className="space-y-1.5">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-[#c2c6d8] leading-snug">
                      <span className="w-4 h-4 rounded-full bg-[#1c2025] border border-[#262a30] text-[#0066ff] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#8c90a1] leading-relaxed">
                  {exercise.instructions || exercise.tips}
                </p>
              )}

              {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#8c90a1] font-bold uppercase">Músculos-alvo:</span>
                  {exercise.targetMuscles.map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-[#1c2025] text-[#b3c5ff] text-[10px] border border-[#262a30]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
