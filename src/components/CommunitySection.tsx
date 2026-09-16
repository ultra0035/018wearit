import React from 'react';
import { Camera, Heart, MapPin, Sparkles, Tag, Plus } from 'lucide-react';
import { CommunityPhoto } from '../types';

interface CommunitySectionProps {
  photos: CommunityPhoto[];
  onLikePhoto: (id: string) => void;
  onOpenPhotoUpload: () => void;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({
  photos,
  onLikePhoto,
  onOpenPhotoUpload
}) => {
  return (
    <section className="py-14 sm:py-20 border-t border-[#1c1d22] bg-[#0d0e11] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5500]" />
              <span className="text-[#ff5500] font-mono text-xs uppercase tracking-widest font-extrabold">
                COMMUNITY STREET LOOKS
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-display tracking-tight mt-1">
              WEAR WHAT WE DIAL (018)
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Streetwear and bespoke knitwear styled by our community across Klerksdorp, North West, Gauteng, and nationwide.
            </p>
          </div>

          <button
            onClick={onOpenPhotoUpload}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#ff5500] hover:bg-[#e04a00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff5500]/25 transition-all transform hover:-translate-y-0.5"
          >
            <Camera className="w-4 h-4" />
            <span>Upload Your 018 Look</span>
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[#141519] border border-[#23252d] rounded-2xl overflow-hidden group hover:border-[#ff5500]/40 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                {/* Source Badge (Camera / Gallery) */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-zinc-300 border border-white/10 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-[#ff5500]" />
                  <span>{photo.source === 'camera' ? 'Live Snap' : 'Gallery'}</span>
                </div>

                {/* Like Button */}
                <button
                  onClick={() => onLikePhoto(photo.id)}
                  className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-transform active:scale-90"
                >
                  <Heart className="w-3.5 h-3.5 text-[#ff5500] fill-[#ff5500]" />
                  <span>{photo.likes}</span>
                </button>
              </div>

              {/* Card Meta */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-display truncate">
                    {photo.userName}
                  </span>
                  <span className="text-[11px] font-mono text-[#ff5500]">
                    {photo.handle}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  <span className="truncate">{photo.location}</span>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed pt-1">
                  "{photo.caption}"
                </p>

                {photo.productTagged && (
                  <div className="pt-2 border-t border-[#1e2028] flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                    <Tag className="w-3 h-3 text-[#ff5500]" />
                    <span className="truncate">{photo.productTagged}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
