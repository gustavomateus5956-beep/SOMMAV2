import React, { useState, useRef } from 'react';
import { 
  Users, 
  Flame
} from 'lucide-react';
import { 
  MOCK_POSTS, 
  MOCK_LOCAL_ATHLETES, 
  MOCK_ACTIVE_PARTNER_AVATARS, 
  MOCK_DAILY_ROUTINES, 
  DISCOVERABLE_ATHLETES 
} from '../data/mockData';
import { FeedPost, RoutineFlash, DiscoverAthlete } from '../types';
import { RoutineViewerModal } from './RoutineViewerModal';
import { DiscoverAthletesSection } from './DiscoverAthletesSection';
import { PageHeader } from './PageHeader';

import { CommunityRoutinesStrip } from './community/CommunityRoutinesStrip';
import { CommunityFeedControls } from './community/CommunityFeedControls';
import { CommunityFeedPostCard } from './community/CommunityFeedPostCard';
import { CommunitySuggestedAthletes } from './community/CommunitySuggestedAthletes';
import { CommunityCreateModal } from './community/CommunityCreateModal';

interface CommunityViewProps {
  onBack?: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'seguindo' | 'explorar'>('seguindo');
  const [posts, setPosts] = useState<FeedPost[]>(MOCK_POSTS);
  const [routines, setRoutines] = useState<RoutineFlash[]>(MOCK_DAILY_ROUTINES);
  const [athletes, setAthletes] = useState(MOCK_LOCAL_ATHLETES);
  const [discoverAthletes, setDiscoverAthletes] = useState<DiscoverAthlete[]>(DISCOVERABLE_ATHLETES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postType, setPostType] = useState<'feed' | 'routine'>('routine');
  const [viewingRoutineIndex, setViewingRoutineIndex] = useState<number | null>(null);

  // New Post/Routine Form State
  const [newCaption, setNewCaption] = useState('');
  const [newPostTitle] = useState('Treino A - Peito & Tríceps');
  const [newMuscleGroup, setNewMuscleGroup] = useState('Peitoral e Ombros');
  const [newHighlightBadge, setNewHighlightBadge] = useState('Novo PR no Supino');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleCheer = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isCheered = p.userCheered;
          const currentCount = p.cheerCount ?? 0;
          return {
            ...p,
            userCheered: !isCheered,
            cheerCount: isCheered ? Math.max(0, currentCount - 1) : currentCount + 1
          };
        }
        return p;
      })
    );
  };

  const handleCopyRoutine = (postId: string) => {
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleFollowAthlete = (index: number) => {
    setAthletes((prev) =>
      prev.map((a, i) => (i === index ? { ...a, following: !a.following } : a))
    );
  };

  const handleToggleFollowDiscoverAthlete = (id: string) => {
    setDiscoverAthletes((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              following: !a.following,
              followersCount: a.following ? a.followersCount - 1 : a.followersCount + 1
            }
          : a
      )
    );
  };

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComments = [
            ...(p.comments || []),
            {
              id: `c-${Date.now()}`,
              author: 'Lucas Andrade',
              role: 'Você',
              text: commentInput.trim()
            }
          ];
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: newComments
          };
        }
        return p;
      })
    );
    setCommentInput('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (postType === 'routine') {
      // Create new 24h Routine
      const newRoutine: RoutineFlash = {
        id: `routine-${Date.now()}`,
        authorName: 'Sua Rotina',
        authorAvatar: 'https://lh3.googleusercontent.com/aida/AEtjO1URm0XDVMSrJNRDc_1GLuvyv0l5c4j4WEL9rP3UPflZRz5H1m9TZPGBMK00H335edXtA8GKJ3D11CB0zoo-_xT8BX4Of8ILIXCOvazguboO4Lw5pTVsG7iJggnbin_E1GWeZ841ZBSPfxaiVabJ12AEsVjplJzt2l3sdqKXs6S9GfMO-qHvR_UCqAjtllBiVgbQolwJ6Cwt3wA0KGJybX7eKNw07aG_W4HSTR08k3vGpETwMxoMon6YKB-UxRSpFwJWPCD7sWLk24k',
        isUser: true,
        hasUnseen: false,
        imageUrl: newPostImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        caption: newCaption.trim() || 'Rotina de treino cumprida com consistência!',
        timeAgo: 'Agora mesmo',
        expiresInHours: 24, // 24-hour expiration cycle
        targetMuscle: newMuscleGroup,
        todayVolume: '7.850 kg movidos',
        statBadge: newHighlightBadge || 'Treino Pago',
        workoutHighlight: 'Rotina do Dia'
      };
      setRoutines([newRoutine, ...routines.filter(r => !r.isUser)]);
    } else {
      // Create new Feed Post
      const newPost: FeedPost = {
        id: `user-post-${Date.now()}`,
        authorName: 'Lucas Andrade',
        authorBadge: 'Você',
        authorVerified: true,
        authorAvatar: 'https://lh3.googleusercontent.com/aida/AEtjO1URm0XDVMSrJNRDc_1GLuvyv0l5c4j4WEL9rP3UPflZRz5H1m9TZPGBMK00H335edXtA8GKJ3D11CB0zoo-_xT8BX4Of8ILIXCOvazguboO4Lw5pTVsG7iJggnbin_E1GWeZ841ZBSPfxaiVabJ12AEsVjplJzt2l3sdqKXs6S9GfMO-qHvR_UCqAjtllBiVgbQolwJ6Cwt3wA0KGJybX7eKNw07aG_W4HSTR08k3vGpETwMxoMon6YKB-UxRSpFwJWPCD7sWLk24k',
        timeAgo: 'Agora mesmo',
        location: 'SOMMA Training Lab',
        tag1: 'ROTINA CONCLUÍDA',
        tag2: newMuscleGroup.toUpperCase(),
        title: newPostTitle || 'Treino do Dia Finalizado',
        caption: newCaption.trim(),
        imageUrl: newPostImage || undefined,
        duration: '52 min',
        volume: '7.850 kg',
        exercisesCount: 5,
        prsCount: 1,
        exercisesPreview: [
          { name: 'Supino Reto Barra', detail: '4 × 8 @ 96 kg', isPr: true },
          { name: 'Supino Inclinado Halteres', detail: '3 × 10 @ 34 kg' }
        ],
        cheerCount: 1,
        userCheered: true,
        commentsCount: 0
      };
      setPosts([newPost, ...posts]);
    }

    // Reset Form
    setNewCaption('');
    setNewPostImage(null);
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col w-full pb-24 md:pb-12 gap-5">
      {/* Standardized Page Header */}
      <PageHeader
        category="SOCIAL & PERFORMANCE"
        title="Comunidade"
        subtitle="Feed de treinos, rotinas em 24h e interação entre atletas"
        onBack={onBack}
        badge={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c2025] border border-[#262a30]">
            <Users className="w-4 h-4 text-[#0066ff]" />
            <span className="text-xs font-bold text-white">Atletas</span>
          </div>
        }
      />

      {/* 1. REMODELED "ROTINAS (24H)" STRIP */}
      <CommunityRoutinesStrip
        routines={routines}
        onAddRoutine={() => {
          setPostType('routine');
          setShowCreateModal(true);
        }}
        onViewRoutine={(index) => setViewingRoutineIndex(index)}
      />

      {/* 2. Sub-tabs: Seguindo vs Explorar + Seguindo Shortcuts */}
      <CommunityFeedControls
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCreatePhoto={() => {
          setPostType('feed');
          setShowCreateModal(true);
        }}
        activePartnerAvatars={MOCK_ACTIVE_PARTNER_AVATARS}
      />

      {/* 3. EXPLORAR VIEW (When Explorar Tab is selected) */}
      {activeTab === 'explorar' && (
        <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200">
          {/* Main Explore Bar & User Discovery Grid */}
          <DiscoverAthletesSection
            athletes={discoverAthletes}
            onToggleFollow={handleToggleFollowDiscoverAthlete}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Heading for Explore Feed */}
          <div className="flex items-center justify-between pt-2 border-t border-[#262a30]/80">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#cc4204]" />
              <h4 className="text-sm font-bold text-white">Publicações em Alta na Comunidade</h4>
            </div>
            <span className="text-xs text-[#8c90a1]">Tendências da SOMMA+</span>
          </div>
        </div>
      )}

      {/* 4. FEED STREAM */}
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <CommunityFeedPostCard
            key={post.id}
            post={post}
            onToggleCheer={handleToggleCheer}
            onCopyRoutine={handleCopyRoutine}
            isCopied={copiedId === post.id}
            isCommentsOpen={activeCommentsPostId === post.id}
            onToggleComments={() =>
              setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)
            }
            commentInput={commentInput}
            onCommentInputChange={setCommentInput}
            onSendComment={() => handleSendComment(post.id)}
          />
        ))}
      </div>

      {/* 5. Suggested Athletes Section */}
      <CommunitySuggestedAthletes
        athletes={athletes}
        onToggleFollow={handleToggleFollowAthlete}
      />

      {/* --- CREATE POST OR 24H ROUTINE MODAL --- */}
      <CommunityCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        postType={postType}
        onPostTypeChange={setPostType}
        newMuscleGroup={newMuscleGroup}
        onMuscleGroupChange={setNewMuscleGroup}
        newHighlightBadge={newHighlightBadge}
        onHighlightBadgeChange={setNewHighlightBadge}
        newCaption={newCaption}
        onCaptionChange={setNewCaption}
        newPostImage={newPostImage}
        onRemoveImage={() => setNewPostImage(null)}
        onImageSelect={handleImageUpload}
        fileInputRef={fileInputRef}
        onSetPresetImage={setNewPostImage}
        onPublish={handlePublish}
      />

      {/* --- 24H ROUTINE VIEWER MODAL --- */}
      {viewingRoutineIndex !== null && (
        <RoutineViewerModal
          routines={routines}
          initialIndex={viewingRoutineIndex}
          onClose={() => setViewingRoutineIndex(null)}
        />
      )}

    </div>
  );
};
