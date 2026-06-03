/**
 * Dual-mode discovery: brands browse public creator profiles; creators browse marketplace listings from Firestore.
 * Detail modals support invite / apply (draft campaigns) and optional `analyzeInfluencerFit` when Gemini is configured.
 */

import React, { useState } from 'react';
import { UserRole, Influencer, Campaign } from '../types';
import { playSound } from '../audio.ts';
import { useApp } from '../context/AppContext';
import { analyzeInfluencerFit } from '../services/geminiService';
import { useModalBackNavigation } from '../hooks/useModalBackNavigation';
import { sendTransactionalNotification } from '../services/notificationService';

const Marketplace: React.FC = () => {
  const { role, user, addCampaign, addNotification, marketplaceCampaigns, availableInfluencers } = useApp();
  const [search, setSearch] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useModalBackNavigation(!!selectedInfluencer, () => setSelectedInfluencer(null));
  useModalBackNavigation(!!selectedCampaign, () => setSelectedCampaign(null));

  const [proposalSent, setProposalSent] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ score: number; reason: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredInfluencers = availableInfluencers.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.niche.some((n) => n.toLowerCase().includes(search.toLowerCase())) ||
      i.location.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCampaigns = marketplaceCampaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase()) ||
    c.niche.toLowerCase().includes(search.toLowerCase())
  );

  /** Brand: creates a draft campaign assigned to the selected creator. */
  const handleInvite = () => {
    if (!selectedInfluencer) return;
    
    playSound('success');
    setProposalSent(true);
    
    const newCampaign: Campaign = {
      id: `C-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      title: `Campaign with ${selectedInfluencer.name}`,
      brand: user?.name || 'Brand account',
      budget: 0,
      niche: selectedInfluencer.niche[0],
      status: 'draft',
      description: 'Initial proposal sent via Marketplace.',
      platform: 'Instagram',
      assignedInfluencerId: selectedInfluencer.id,
      logs: [{ date: new Date().toLocaleString(), action: 'Proposal Sent', hash: `0x${Math.random().toString(16).substr(2, 8)}` }]
    };
    
    addCampaign(newCampaign);
    addNotification(`Proposal sent to ${selectedInfluencer.name}`);
    
    // Dispatch transactional alert
    void sendTransactionalNotification({
      toEmail: selectedInfluencer.email,
      toPushToken: selectedInfluencer.pushToken,
      title: 'New Campaign Proposal',
      body: `Brand "${user?.name || 'A Brand'}" sent you a campaign proposal: "${newCampaign.title}".`,
      type: 'both'
    });

    setTimeout(() => { 
      setProposalSent(false); 
      setSelectedInfluencer(null); 
      setAiAnalysis(null);
    }, 2000);
  };

  /** Creator: clones listing into a draft application tied to `user.id`. */
  const handleApply = () => {
    if (!selectedCampaign) return;
    playSound('success');
    setProposalSent(true);

    const application: Campaign = {
        ...selectedCampaign,
        id: `APP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        status: 'draft',
        assignedInfluencerId: user?.id,
        logs: [{ date: new Date().toLocaleString(), action: 'Application Submitted', hash: `0x${Math.random().toString(16).substr(2, 8)}` }]
    };

    addCampaign(application);
    addNotification(`Applied to ${selectedCampaign.title}`);

    // Dispatch transactional alert to brand
    void sendTransactionalNotification({
      title: 'New Campaign Application',
      body: `Creator "${user?.name || 'A Creator'}" applied to campaign: "${selectedCampaign.title}".`,
      type: 'both'
    });

    setTimeout(() => {
        setProposalSent(false);
        setSelectedCampaign(null);
    }, 2000);
  };

  /** Runs AI fit scoring against a sample brand brief (no campaign picker yet). */
  const handleAnalyze = async () => {
    if (!selectedInfluencer) return;
    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);
    try {
      const analysis = await analyzeInfluencerFit(
        'Brand awareness campaign for a premium lifestyle product in Nairobi.',
        selectedInfluencer
      );
      setAiAnalysis(analysis);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 pt-24 pb-20 space-y-10 min-h-screen">
      {/* Search Header */}
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black serif italic brand-text tracking-tighter uppercase leading-none">
            {role === UserRole.BRAND ? 'Find creators' : 'Find campaigns'}
          </h1>
          <p className="text-gray-900 text-sm font-bold italic bg-white/30 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
            {role === UserRole.BRAND ? 'Browse verified creators for your next campaign.' : 'Browse open briefs from brands.'}
          </p>
        </div>
        
        <div className="relative group">
          <input 
            type="text" 
            placeholder={role === UserRole.BRAND ? "Search niche or location..." : "Search brands or campaigns..."}
            className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl px-6 py-5 text-base font-medium text-gray-900 focus:outline-none focus:border-[#FF5500] focus:bg-white/60 transition-all placeholder:text-gray-600 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#FF5500]">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {role === UserRole.BRAND && filteredInfluencers.length === 0 ? (
          <div className="col-span-full glass-card rounded-[2rem] p-12 text-center border border-dashed border-gray-200/80">
            <p className="text-sm font-medium text-gray-600">No creators match your search.</p>
            <button
              type="button"
              className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#FF5500]"
              onClick={() => setSearch('')}
            >
              Clear search
            </button>
          </div>
        ) : null}
        {role === UserRole.INFLUENCER && filteredCampaigns.length === 0 ? (
          <div className="col-span-full glass-card rounded-[2rem] p-12 text-center border border-dashed border-gray-200/80">
            <p className="text-sm font-medium text-gray-600">No open campaigns match your search.</p>
            <button
              type="button"
              className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#FF5500]"
              onClick={() => setSearch('')}
            >
              Clear search
            </button>
          </div>
        ) : null}
        {role === UserRole.BRAND ? (
            filteredInfluencers.map((influencer) => (
            <div 
                key={influencer.id} 
                className="group cursor-pointer space-y-4"
                onClick={() => { playSound('click'); setSelectedInfluencer(influencer); setAiAnalysis(null); setAiError(null); }}
            >
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/40 shadow-lg transition-transform active:scale-95 group-hover:shadow-xl group-hover:translate-y-[-5px] duration-500">
                <img src={influencer.image} className="absolute inset-0 w-full h-full object-cover" alt={influencer.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 box-shadow-green"></span>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest shadow-black/20 text-shadow-sm">{influencer.trustScore} Trust</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                    <h3 className="text-lg font-bold text-white serif italic truncate">{influencer.name}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-[8px] text-white/90 uppercase font-black tracking-widest">{influencer.location}</p>
                        {influencer.verified && (
                            <span className="w-3 h-3 bg-[#FF5500] rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                        )}
                    </div>
                </div>
                </div>
            </div>
            ))
        ) : (
            filteredCampaigns.map((campaign) => (
                <div 
                    key={campaign.id} 
                    className="group cursor-pointer"
                    onClick={() => { playSound('click'); setSelectedCampaign(campaign); }}
                >
                    <div className="bg-white/60 backdrop-blur-md border border-white/50 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:bg-white/80 transition-all h-full flex flex-col justify-between group-hover:-translate-y-1 duration-300">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="bg-gray-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-600">
                                    {campaign.platform}
                                </div>
                                <span className="text-lg font-black serif italic brand-text">KES {campaign.budget.toLocaleString()}</span>
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-base sm:text-xl font-bold text-gray-900 group-hover:text-[#FF5500] transition-colors truncate" title={campaign.title}>{campaign.title}</h3>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{campaign.brand}</p>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                {campaign.description}
                            </p>
                        </div>

                        <div className="pt-6 mt-4 border-t border-gray-100 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Verified Brand</span>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:translate-x-1 transition-transform">View Details →</span>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Full-screen Mobile Detailed View - Glass Modal for Influencer */}
      {selectedInfluencer && (
        <div
          className="fixed inset-0 z-[3000] bg-white/80 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="influencer-modal-title"
        >
          <div className="relative h-[45vh] md:h-[60vh] lg:h-[70vh] flex-shrink-0">
             <img src={selectedInfluencer.image} className="w-full h-full object-cover" alt="" />
             <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
             {/* Gradient to blend image into the glass content below */}
             <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/80 to-transparent"></div>
             
             <button type="button" aria-label="Close" onClick={() => { playSound('click'); setSelectedInfluencer(null); }} className="absolute top-6 left-6 w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 text-3xl font-light shadow-xl hover:bg-white transition-all">&times;</button>
          </div>

          <div className="flex-grow p-4 md:p-8 space-y-8 overflow-y-auto custom-scroll bg-white/60 backdrop-blur-xl rounded-t-[3rem] -mt-10 border-t border-white/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
             <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                   <div className="bg-green-100/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Verified on Trifluenz</span>
                   </div>
                   <div className="h-[1px] flex-grow bg-gray-200/50"></div>
                </div>
                <h2 id="influencer-modal-title" className="text-5xl font-bold serif italic text-gray-900 tracking-tighter leading-none">{selectedInfluencer.name}</h2>
                <p className="text-xl text-gray-700 font-light italic leading-relaxed">
                   Based in {selectedInfluencer.location}, specializing in {selectedInfluencer.niche.join(', ')}. Joined {selectedInfluencer.joinedDate}.
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl space-y-0.5 border border-white/60 shadow-sm">
                   <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Trust Score</p>
                   <div className="flex items-baseline gap-1">
                     <p className="text-2xl font-black serif text-[#FF5500] italic">{selectedInfluencer.trustScore}</p>
                     <span className="text-xs text-gray-500">/ 100</span>
                   </div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl space-y-0.5 border border-white/60 shadow-sm">
                   <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Fans</p>
                   <p className="text-2xl font-black serif text-gray-900 italic">{(selectedInfluencer.followers / 1000).toFixed(1)}k</p>
                </div>
             </div>

             {/* AI Analysis Section */}
             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Compatibility Check</h3>
                   {!aiAnalysis && (
                     <button 
                       onClick={handleAnalyze}
                       disabled={isAnalyzing}
                       className="text-[9px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
                     >
                       {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                     </button>
                   )}
                </div>
                
                {aiError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 space-y-2" role="alert">
                    <p className="text-sm text-red-800">{aiError}</p>
                    <button
                      type="button"
                      onClick={() => void handleAnalyze()}
                      className="text-[10px] font-black uppercase tracking-widest text-red-700 underline"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {aiAnalysis && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                     <div className="flex items-center gap-2">
                        <div className="text-3xl font-black serif italic text-indigo-900">{aiAnalysis.score}%</div>
                        <div className="text-xs font-medium text-indigo-700">Match Score</div>
                     </div>
                     <p className="text-sm text-indigo-800 leading-relaxed">{aiAnalysis.reason}</p>
                  </div>
                )}
             </div>

             <div className="pt-4 pb-10">
                <button 
                  onClick={handleInvite}
                  disabled={proposalSent}
                  className="w-full py-4 md:py-6 button-brand rounded-full text-[10px] md:text-[12px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform"
                >
                  {proposalSent ? "Invitation sent!" : "Send invitation"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal for Influencer */}
      {selectedCampaign && (
          <div
            className="fixed inset-0 z-[3000] bg-white/80 backdrop-blur-xl animate-in fade-in duration-300 flex items-center justify-center p-4 md:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-modal-title"
          >
              <div className="bg-white/90 backdrop-blur-xl w-full max-w-2xl p-4 md:p-6 rounded-[2.5rem] shadow-2xl border border-white/50 space-y-6 max-h-[90vh] overflow-y-auto custom-scroll relative">
                  <button type="button" aria-label="Close" onClick={() => { playSound('click'); setSelectedCampaign(null); }} className="absolute top-8 right-8 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200">&times;</button>
                  
                  <div className="space-y-2">
                      <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-600 mb-2">
                          {selectedCampaign.platform}
                      </div>
                      <h2 id="campaign-modal-title" className="text-3xl md:text-4xl font-black serif italic brand-text">{selectedCampaign.title}</h2>
                      <p className="text-lg font-bold text-gray-900">{selectedCampaign.brand}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Budget</p>
                          <p className="text-xl font-black serif italic text-gray-900">KES {selectedCampaign.budget.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Timeline</p>
                          <p className="text-sm font-bold text-gray-900">
                              {selectedCampaign.timeline ? `${selectedCampaign.timeline.startDate} - ${selectedCampaign.timeline.endDate}` : 'Flexible'}
                          </p>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Brief</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedCampaign.description}</p>
                  </div>

                  <button 
                      onClick={handleApply}
                      disabled={proposalSent}
                      className="w-full py-4 md:py-5 button-brand rounded-xl text-xs md:text-sm font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
                  >
                      {proposalSent ? "Application sent!" : "Apply now"}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Marketplace;
