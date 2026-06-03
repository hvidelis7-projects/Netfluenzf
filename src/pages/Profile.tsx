/**
 * Editable profile for the current `user`; influencers get a Media Kit tab (share/PDF mock).
 * Requires `user` from context — returns null if logged out (shouldn’t happen when routed).
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, Influencer, UserProfile } from '../types';
import { playSound } from '../audio.ts';
import { isCloudinaryConfigured, uploadToCloudinary } from '../services/cloudinary';
import { useModalBackNavigation } from '../hooks/useModalBackNavigation';

const Profile: React.FC = () => {
  const { user, updateUserProfile, role, addNotification } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'mediakit'>('profile');

  useModalBackNavigation(isEditing, () => setIsEditing(false));
  useModalBackNavigation(activeTab === 'mediakit', () => setActiveTab('profile'));

  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    if (user && !isEditing) setFormData({ ...user });
  }, [user, isEditing]);

  if (!user) return null;

  const handleSave = () => {
    playSound('success');
    updateUserProfile(formData);
    setIsEditing(false);
    addNotification('Profile updated successfully');
  };

  const handleShareMediaKit = () => {
    playSound('click');
    const url = `https://trifluenz.app/u/${user.id}`;
    void navigator.clipboard.writeText(url).then(
      () => addNotification('Media kit link copied to clipboard'),
      () => addNotification(url)
    );
  };

  const handleDownloadPDF = () => {
    playSound('click');
    addNotification('Downloading Media Kit PDF...');
    setTimeout(() => {
        addNotification('Download complete!');
    }, 2000);
  };

  const handleAddContent = () => {
    playSound('click');
    portfolioInputRef.current?.click();
  };

  const handlePortfolioFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const input = e.target;
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      addNotification('Please choose an image file.');
      input.value = '';
      return;
    }
    try {
      if (isCloudinaryConfigured()) {
        const { url } = await uploadToCloudinary(file, { folder: 'trifluenz/portfolio', resourceType: 'image' });
        const next = [...(user.portfolio || []), url];
        updateUserProfile({ portfolio: next });
        addNotification('Image uploaded to your portfolio');
        playSound('success');
      } else {
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            const dataUrl = typeof reader.result === 'string' ? reader.result : '';
            if (!dataUrl) {
              reject(new Error('Could not read image'));
              return;
            }
            const next = [...(user.portfolio || []), dataUrl];
            updateUserProfile({ portfolio: next });
            addNotification('Image added for this session (configure Cloudinary for hosted URLs).');
            playSound('success');
            resolve();
          };
          reader.onerror = () => reject(new Error('Could not read file'));
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      addNotification(msg);
    } finally {
      input.value = '';
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addNotification('Please choose an image file.');
      return;
    }
    setAvatarBusy(true);
    try {
      if (isCloudinaryConfigured()) {
        const { url } = await uploadToCloudinary(file, { folder: 'trifluenz/avatars', resourceType: 'image' });
        handleChange('avatar', url);
        addNotification('Profile photo uploaded');
        playSound('success');
      } else {
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            const dataUrl = typeof reader.result === 'string' ? reader.result : '';
            if (!dataUrl) {
              reject(new Error('Could not read image'));
              return;
            }
            handleChange('avatar', dataUrl);
            addNotification('Profile photo updated for this session (add Cloudinary for hosted URLs).');
            playSound('success');
            resolve();
          };
          reader.onerror = () => reject(new Error('Could not read file'));
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      addNotification(msg);
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleChange = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-5 pt-24 pb-20 space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/20">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black serif italic brand-text tracking-tighter uppercase leading-none">Your profile</h1>
          <p className="text-gray-900 font-medium text-sm italic bg-white/30 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
            Update how others see you on Trifluenz.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
           {role === UserRole.INFLUENCER && (
             <div className="bg-white/40 backdrop-blur-md rounded-full border border-white/40 shadow-sm flex p-1">
                 <button 
                   onClick={() => setActiveTab('profile')}
                   className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   Profile
                 </button>
                 <button 
                   onClick={() => setActiveTab('mediakit')}
                   className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mediakit' ? 'bg-white shadow-md text-[#FF5500]' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   Media Kit
                 </button>
             </div>
           )}
           {activeTab === 'profile' && (
            <button 
              onClick={() => {
                if (isEditing) handleSave();
                else { playSound('click'); setFormData({ ...user }); setIsEditing(true); }
              }}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${
                isEditing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
           )}
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-1 space-y-6">
          <div className="bg-white/60 backdrop-blur-md border border-white/50 p-6 rounded-[2.5rem] shadow-sm text-center space-y-4 relative overflow-hidden group">
             <input
               ref={avatarInputRef}
               type="file"
               accept="image/*"
               className="sr-only"
               aria-hidden
               tabIndex={-1}
               onChange={(ev) => void handleAvatarFile(ev)}
             />
             <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
               <img
                 src={(isEditing ? formData.avatar : user.avatar) || user.avatar}
                 alt={user.name}
                 className="w-full h-full object-cover"
               />
               {isEditing && (
                 <button
                   type="button"
                   disabled={avatarBusy}
                   onClick={() => {
                     playSound('click');
                     avatarInputRef.current?.click();
                   }}
                   className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors disabled:cursor-wait disabled:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                 >
                   <span className="text-white text-xs font-bold uppercase">{avatarBusy ? '…' : 'Change'}</span>
                 </button>
               )}
             </div>
             
             <div className="space-y-1">
               {isEditing ? (
                 <input 
                   value={formData.name} 
                   onChange={(e) => handleChange('name', e.target.value)}
                   className="text-center w-full bg-white/50 border-b border-gray-300 focus:border-[#FF5500] outline-none font-bold text-xl"
                 />
               ) : (
                 <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
               )}
               <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{user.role}</p>
             </div>

             {user.verified && (
               <div className="inline-flex items-center gap-1.5 bg-green-100/50 px-3 py-1 rounded-full border border-green-200">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                 <span className="text-[8px] font-black text-green-700 uppercase tracking-widest">Verified</span>
               </div>
             )}
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/50 p-6 rounded-[2rem] shadow-sm space-y-4">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact Info</h3>
             <div className="space-y-3">
               <div className="space-y-1">
                 <label className="text-[9px] font-bold text-gray-400 uppercase">Email</label>
                 <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-bold text-gray-400 uppercase">Location</label>
                 {isEditing ? (
                   <input 
                     value={formData.location || ''} 
                     onChange={(e) => handleChange('location', e.target.value)}
                     className="w-full bg-white/50 border-b border-gray-300 focus:border-[#FF5500] outline-none text-sm"
                   />
                 ) : (
                   <p className="text-sm font-medium text-gray-900">{user.location || 'Not set'}</p>
                 )}
               </div>
             </div>
          </div>

          {/* Badges Section (Gamification) */}
          {role === UserRole.INFLUENCER && (
             <div className="bg-white/60 backdrop-blur-md border border-white/50 p-6 rounded-[2rem] shadow-sm space-y-4">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Badges</h3>
                <div className="flex flex-wrap gap-2">
                   <div className="group relative">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl cursor-help hover:scale-110 transition-transform">⚡️</div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Fast Responder</div>
                   </div>
                   <div className="group relative">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl cursor-help hover:scale-110 transition-transform">💎</div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Top Rated</div>
                   </div>
                   <div className="group relative">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl cursor-help hover:scale-110 transition-transform">🚀</div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Early Adopter</div>
                   </div>
                   <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-300 text-xs font-bold">+3</div>
                </div>
             </div>
          )}
        </div>

        {/* Right Column: Detailed Fields */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-md border border-white/50 p-8 rounded-[2.5rem] shadow-sm space-y-6">
             <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold serif italic brand-text">Profile Details</h3>
             </div>

             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bio</label>
                 {isEditing ? (
                   <textarea 
                     value={formData.bio || ''} 
                     onChange={(e) => handleChange('bio', e.target.value)}
                     className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 focus:border-[#FF5500] outline-none text-sm min-h-[100px]"
                   />
                 ) : (
                   <p className="text-sm text-gray-700 leading-relaxed">{user.bio || 'No bio yet.'}</p>
                 )}
               </div>

               {role === UserRole.INFLUENCER && (
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Niche</label>
                     {isEditing ? (
                       <input 
                         value={formData.niche?.join(', ') || ''} 
                         onChange={(e) => handleChange('niche', e.target.value.split(',').map((s: string) => s.trim()))}
                         className="w-full bg-white/50 border-b border-gray-300 focus:border-[#FF5500] outline-none text-sm"
                         placeholder="Fashion, Tech..."
                       />
                     ) : (
                       <div className="flex flex-wrap gap-2">
                         {user.niche?.map((n: string) => (
                           <span key={n} className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">{n}</span>
                         ))}
                       </div>
                     )}
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Engagement Rate</label>
                     <p className="text-2xl font-black serif italic text-gray-900">{user.engagementRate}%</p>
                   </div>
                 </div>
               )}

               {role === UserRole.BRAND && (
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Industry</label>
                     {isEditing ? (
                       <input 
                         value={formData.industry || ''} 
                         onChange={(e) => handleChange('industry', e.target.value)}
                         className="w-full bg-white/50 border-b border-gray-300 focus:border-[#FF5500] outline-none text-sm"
                       />
                     ) : (
                       <p className="text-sm font-medium text-gray-900">{user.industry}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Website</label>
                     {isEditing ? (
                       <input 
                         value={formData.website || ''} 
                         onChange={(e) => handleChange('website', e.target.value)}
                         className="w-full bg-white/50 border-b border-gray-300 focus:border-[#FF5500] outline-none text-sm"
                       />
                     ) : (
                       <a href={user.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#FF5500] underline">{user.website}</a>
                     )}
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Media Kit Header */}
            <div className="bg-white/60 backdrop-blur-md border border-white/50 p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center gap-8">
               <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               </div>
               <div className="text-center md:text-left space-y-2 flex-grow">
                  <h2 className="text-4xl font-black serif italic text-gray-900">{user.name}</h2>
                  <p className="text-lg text-gray-600">{user.bio}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                     {user.niche?.map((n: string) => (
                        <span key={n} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wide">{n}</span>
                     ))}
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                  <button onClick={handleShareMediaKit} className="px-6 py-3 button-brand rounded-full text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                     Share Media Kit
                  </button>
                  <button onClick={handleDownloadPDF} className="px-6 py-3 bg-white border border-gray-200 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
                     Download PDF
                  </button>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-center space-y-1">
                   <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Total Reach</p>
                   <p className="text-2xl sm:text-3xl font-black serif italic text-gray-900">{(user.followers || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-center space-y-1">
                   <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Engagement</p>
                   <p className="text-2xl sm:text-3xl font-black serif italic text-[#FF5500]">{user.engagementRate}%</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-center space-y-1">
                   <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Trust Score</p>
                   <p className="text-2xl sm:text-3xl font-black serif italic text-green-600">{(user as Influencer).trustScore || 98}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-center space-y-1">
                   <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Avg. Rate</p>
                   <p className="text-2xl sm:text-3xl font-black serif italic text-gray-900">$250</p>
                </div>
             </div>

            {/* Portfolio / Featured Content */}
            <div className="space-y-4">
               <input
                 ref={portfolioInputRef}
                 type="file"
                 accept="image/*"
                 className="hidden"
                 onChange={(ev) => void handlePortfolioFiles(ev)}
               />
               <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-bold serif italic text-gray-900">Featured content</h3>
                  <button type="button" onClick={handleAddContent} className="text-[10px] font-black uppercase tracking-widest text-[#FF5500] hover:text-orange-700">+ Add image</button>
               </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {(() => {
                    const uploaded = user.portfolio || [];
                    const filler = [1, 2, 3].map((i) => `https://picsum.photos/seed/${i + 50}/400/500`);
                    const images = [...uploaded, ...filler].slice(0, 3);
                    return images.map((src, idx) => (
                     <div key={`${src.slice(0, 40)}-${idx}`} className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer">
                        <img src={src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Portfolio" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                           <p className="text-white font-bold text-lg">{idx < uploaded.length ? 'Your upload' : 'Sample work'}</p>
                           <p className="text-white/80 text-xs uppercase tracking-widest">{idx < uploaded.length ? 'Added from your device' : 'Placeholder'}</p>
                        </div>
                     </div>
                    ));
                  })()}
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
