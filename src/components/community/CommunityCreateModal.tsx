import React from 'react';
import { 
  X, 
  Camera, 
  Zap, 
  Image as ImageIcon, 
  Clock, 
  Check, 
  UploadCloud, 
  Plus 
} from 'lucide-react';

interface CommunityCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  postType: 'feed' | 'routine';
  onPostTypeChange: (type: 'feed' | 'routine') => void;
  newMuscleGroup: string;
  onMuscleGroupChange: (val: string) => void;
  newHighlightBadge: string;
  onHighlightBadgeChange: (val: string) => void;
  newCaption: string;
  onCaptionChange: (val: string) => void;
  newPostImage: string | null;
  onRemoveImage: () => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSetPresetImage: (url: string) => void;
  onPublish: () => void;
}

export const CommunityCreateModal: React.FC<CommunityCreateModalProps> = ({
  isOpen,
  onClose,
  postType,
  onPostTypeChange,
  newMuscleGroup,
  onMuscleGroupChange,
  newHighlightBadge,
  onHighlightBadgeChange,
  newCaption,
  onCaptionChange,
  newPostImage,
  onRemoveImage,
  onImageSelect,
  fileInputRef,
  onSetPresetImage,
  onPublish
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#181c21] border border-[#262a30] rounded-3xl p-5 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#262a30]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0066ff]/20 text-[#0066ff] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Criar Nova Publicação</h3>
              <p className="text-[11px] text-[#8c90a1]">Escolha entre post permanente no feed ou Rotina 24h</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c2025] hover:bg-[#262a30] text-[#c2c6d8] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post Format Selector: Rotina (24h) vs Feed */}
        <div className="grid grid-cols-2 gap-2 bg-[#101419] p-1.5 rounded-2xl border border-[#262a30]">
          <button
            type="button"
            onClick={() => onPostTypeChange('routine')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              postType === 'routine'
                ? 'bg-[#0066ff] text-white shadow-sm'
                : 'text-[#8c90a1] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#ffb59d]" />
            <span>Rotina (24h)</span>
          </button>
          <button
            type="button"
            onClick={() => onPostTypeChange('feed')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              postType === 'feed'
                ? 'bg-[#0066ff] text-white shadow-sm'
                : 'text-[#8c90a1] hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Post no Feed</span>
          </button>
        </div>

        {/* Rotina 24h helper notice */}
        {postType === 'routine' && (
          <div className="bg-[#0066ff]/10 border border-[#0066ff]/30 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-[#b3c5ff]">
            <Clock className="w-4 h-4 text-[#4edea3] shrink-0" />
            <span>Esta rotina ficará ativa por <strong>24 horas</strong> no topo da comunidade para inspirar outros atletas.</span>
          </div>
        )}

        {/* Title / Muscle Target */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#c2c6d8]">Grupo Muscular</label>
            <input
              type="text"
              value={newMuscleGroup}
              onChange={(e) => onMuscleGroupChange(e.target.value)}
              placeholder="Ex: Peitoral e Ombros"
              className="h-10 px-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-xs outline-none focus:border-[#0066ff]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#c2c6d8]">Destaque / PR</label>
            <input
              type="text"
              value={newHighlightBadge}
              onChange={(e) => onHighlightBadgeChange(e.target.value)}
              placeholder="Ex: PR 96kg Supino"
              className="h-10 px-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-xs outline-none focus:border-[#0066ff]"
            />
          </div>
        </div>

        {/* Caption */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#c2c6d8]">
            {postType === 'routine' ? 'Descrição da Rotina de Hoje' : 'Legenda da Foto'}
          </label>
          <textarea
            placeholder={
              postType === 'routine'
                ? 'Ex: Rotina cumprida com foco em cadência lenta e contração máxima...'
                : 'Compartilhe suas percepções de carga, intensidade ou conquista...'
            }
            value={newCaption}
            onChange={(e) => onCaptionChange(e.target.value)}
            className="w-full h-20 p-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-xs placeholder:text-[#8c90a1] focus:border-[#0066ff] outline-none resize-none"
          />
        </div>

        {/* Photo Upload Box */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#c2c6d8] flex items-center justify-between">
            <span>Foto da Rotina ou Shape</span>
            {newPostImage && (
              <button
                type="button"
                onClick={onRemoveImage}
                className="text-[11px] text-[#ffb59d] hover:underline cursor-pointer"
              >
                Remover foto
              </button>
            )}
          </label>

          {newPostImage ? (
            <div className="relative rounded-xl overflow-hidden border border-[#262a30] h-40 bg-black">
              <img
                src={newPostImage}
                alt="Preview da foto selecionada"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/70 text-[10px] font-bold text-[#4edea3] flex items-center gap-1">
                <Check className="w-3 h-3" /> Foto Pronta
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-24 rounded-2xl border-2 border-dashed border-[#262a30] hover:border-[#0066ff]/60 bg-[#101419] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <UploadCloud className="w-5 h-5 text-[#0066ff]" />
              <span className="text-xs font-bold text-white">Toque para selecionar foto</span>
              <span className="text-[10px] text-[#8c90a1]">Foto do shape ou aparelho</span>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={onImageSelect}
            className="hidden"
          />
        </div>

        {/* Presets */}
        {!newPostImage && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#8c90a1]">
            <span>Ou use um exemplo:</span>
            <button
              type="button"
              onClick={() =>
                onSetPresetImage(
                  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop'
                )
              }
              className="px-2 py-0.5 rounded-md bg-[#262a30] hover:bg-[#31353b] text-[#b3c5ff] cursor-pointer"
            >
              Academia
            </button>
            <button
              type="button"
              onClick={() =>
                onSetPresetImage(
                  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop'
                )
              }
              className="px-2 py-0.5 rounded-md bg-[#262a30] hover:bg-[#31353b] text-[#b3c5ff] cursor-pointer"
            >
              Halteres
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-[#262a30]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onPublish}
            className="flex-1 h-11 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] text-xs font-bold text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{postType === 'routine' ? 'Publicar Rotina 24h' : 'Publicar no Feed'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
