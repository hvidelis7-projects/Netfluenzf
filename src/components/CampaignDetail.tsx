/**
 * Full-screen campaign workspace: deliverables, escrow vault UI, chat, audit log.
 * Mutations go up through `onUpdateCampaign`; money movements call context helpers.
 */

import React, { useState, useEffect } from 'react';
import { Campaign, UserRole } from '../types';
import { playSound } from '../audio.ts';
import ChatInterface from './ChatInterface';
import { useApp } from '../context/AppContext';

interface CampaignDetailProps {
  campaign: Campaign;
  role: UserRole;
  onClose: () => void;
  onUpdateCampaign: (campaign: Campaign) => void;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaign, role, onClose, onUpdateCampaign }) => {
  const { updateEscrowBalance, addTransaction, updateWalletBalance, addNotification, availableInfluencers } = useApp();
  const [proofUrl, setProofUrl] = useState(campaign.proofUrl || '');
  const influencer = campaign.assignedInfluencerId
    ? availableInfluencers.find((inf) => inf.id === campaign.assignedInfluencerId)
    : undefined;

  useEffect(() => {
    setProofUrl(campaign.proofUrl || '');
  }, [campaign.id, campaign.proofUrl]);

  /** Appends to `campaign.messages` and persists via parent. */
  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      senderRole: role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...(campaign.messages || []), newMessage];
    
    onUpdateCampaign({
      ...campaign,
      messages: updatedMessages
    });
  };

  const notify = (msg: string) => addNotification(msg);

  /** Influencer: sets proof URL and moves status to `auditing`. */
  const handleSubmitProof = () => {
    if (!proofUrl) return;
    playSound('success');
    const newLog = {
      date: new Date().toLocaleString(),
      action: 'Work submitted for review',
      hash: `0x${Math.random().toString(16).substr(2, 8)}`
    };
    onUpdateCampaign({ 
      ...campaign, 
      proofUrl, 
      status: 'auditing',
      logs: [newLog, ...(campaign.logs || [])]
    });
    notify("Work submitted for review");
  };

  /** Brand: releases escrow, completes campaign, logs transaction. */
  const handleReleasePayment = () => {
    playSound('success');
    const newLog = {
      date: new Date().toLocaleString(),
      action: 'Payment released to creator',
      hash: `0x${Math.random().toString(16).substr(2, 8)}`
    };
    
    updateEscrowBalance(-campaign.budget);
    addTransaction({
        id: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        date: 'Just now',
        type: 'Payment released',
        amount: -campaign.budget,
        status: 'Success',
        method: 'Secure hold'
    });

    onUpdateCampaign({ 
      ...campaign, 
      status: 'completed',
      logs: [newLog, ...(campaign.logs || [])]
    });
    notify("Payment Released!");
    setTimeout(onClose, 1500);
  };

  /** Draft → active: optional lock from brand wallet into escrow for funded launches. */
  const handleActivate = () => {
    playSound('success');
    const newLog = {
      date: new Date().toLocaleString(),
      action: 'Contract Activated',
      hash: `0x${Math.random().toString(16).substr(2, 8)}`
    };
    
    if (role === UserRole.BRAND && campaign.budget > 0) {
         updateWalletBalance(-campaign.budget);
         updateEscrowBalance(campaign.budget);
         addTransaction({
            id: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            date: 'Just now',
            type: 'Payment held',
            amount: -campaign.budget,
            status: 'Success',
            method: 'Secure hold'
         });
    }

    onUpdateCampaign({ 
      ...campaign, 
      status: 'active',
      logs: [newLog, ...(campaign.logs || [])]
    });
    notify("Contract Activated!");
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-white/80 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col">
      <div className="p-6 flex-shrink-0 flex items-center justify-between border-b border-gray-200/50 bg-white/50 backdrop-blur-lg">
        <div className="flex flex-col">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse"></span>
             <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Payment protected</span>
             <span className={`ml-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                campaign.status === 'active' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' : 
                campaign.status === 'auditing' ? 'bg-amber-100/50 text-amber-700 border-amber-200' : 
                campaign.status === 'completed' ? 'bg-blue-100/50 text-blue-700 border-blue-200' :
                campaign.status === 'paid' ? 'bg-purple-100/50 text-purple-700 border-purple-200' :
                'bg-gray-100/50 text-gray-600 border-gray-200'
             }`}>
               {campaign.status}
             </span>
           </div>
           <span className="text-gray-900 font-bold">{campaign.id}</span>
        </div>
        <button onClick={() => { playSound('click'); onClose(); }} className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center text-gray-900 text-3xl font-light shadow-sm hover:bg-white transition-colors hover:rotate-90 duration-300">&times;</button>
      </div>

      <div className="flex-grow p-6 space-y-8 overflow-y-auto custom-scroll">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: Campaign Info & Chat */}
          <div className="space-y-8">
             <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] space-y-6 border border-white/60 shadow-sm transition-transform hover:scale-[1.01] duration-500">
                <div className="space-y-1">
                  <h2 className="text-4xl font-bold serif italic text-gray-900 tracking-tighter leading-none">{campaign.title}</h2>
                  <p className="text-lg text-gray-600 font-light italic">{campaign.brand}</p>
                </div>
                <p className="text-sm text-gray-700 font-light leading-relaxed">{campaign.description}</p>
                
                {/* Deliverables Section */}
                <div className="space-y-4 pt-2">
                   <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deliverables</h3>
                      {role === UserRole.BRAND && campaign.status === 'draft' && (
                        <button 
                          onClick={() => {
                            const desc = prompt("Enter deliverable description (e.g. '1 Instagram Reel')");
                            if (desc) {
                                const newDeliverable = {
                                    id: Date.now().toString(),
                                    type: 'Post' as const,
                                    platform: (campaign.platform === 'Multi' ? 'Instagram' : campaign.platform) as any,
                                    status: 'pending' as const,
                                    dueDate: campaign.timeline?.endDate || new Date().toISOString()
                                };
                                // In a real app, we'd add this to the campaign object properly
                                // For now, we'll just simulate it visually or update if we had a deliverables array in the type
                                // Since we do have it in types, let's update it.
                                const updatedDeliverables = [...(campaign.deliverables || []), { ...newDeliverable, description: desc }];
                                onUpdateCampaign({ ...campaign, deliverables: updatedDeliverables });
                            }
                          }}
                          className="text-[9px] font-bold text-[#FF5500] hover:text-orange-600 uppercase tracking-widest"
                        >
                          + Add Item
                        </button>
                      )}
                   </div>
                   <div className="space-y-2">
                      {(campaign.deliverables && campaign.deliverables.length > 0) ? (
                          campaign.deliverables.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white/40 p-3 rounded-xl border border-white/50">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${item.status === 'approved' ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}>
                                    {item.status === 'approved' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-xs font-bold text-gray-800">{item.description || item.type}</p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">{item.platform} • {new Date(item.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${
                                        item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                        item.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                        {item.status}
                                    </span>
                                    
                                    {/* Actions */}
                                    {role === UserRole.INFLUENCER && item.status === 'pending' && (
                                        <button 
                                            onClick={() => {
                                                const updatedDeliverables = [...(campaign.deliverables || [])];
                                                updatedDeliverables[idx] = { ...item, status: 'submitted' };
                                                onUpdateCampaign({ ...campaign, deliverables: updatedDeliverables });
                                                notify("Deliverable marked as submitted");
                                            }}
                                            className="text-[8px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                                        >
                                            Submit
                                        </button>
                                    )}
                                    
                                    {role === UserRole.BRAND && item.status === 'submitted' && (
                                        <button 
                                            onClick={() => {
                                                const updatedDeliverables = [...(campaign.deliverables || [])];
                                                updatedDeliverables[idx] = { ...item, status: 'approved' };
                                                onUpdateCampaign({ ...campaign, deliverables: updatedDeliverables });
                                                notify("Deliverable approved");
                                                playSound('success');
                                            }}
                                            className="text-[8px] font-bold text-green-600 hover:text-green-800 uppercase tracking-widest border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                                        >
                                            Approve
                                        </button>
                                    )}
                                </div>
                            </div>
                          ))
                      ) : (
                          <p className="text-xs text-gray-400 italic">No specific deliverables defined yet.</p>
                      )}
                   </div>
                </div>

                {/* Visual Smart Contract Vault */}
                <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:scale-110 transition-transform duration-1000">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                   </div>
                   <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Payment hold</p>
                            <p className="text-xs font-mono text-gray-400 break-all opacity-70">0x71C...9A2F</p>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            campaign.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                         }`}>
                            {campaign.status === 'completed' ? 'Released' : 'Locked'}
                         </div>
                      </div>
                      
                      <div className="flex items-end justify-between">
                         <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Contract Value</p>
                            <p className="text-3xl font-bold serif italic">KES {campaign.budget.toLocaleString()}</p>
                         </div>
                         {campaign.status !== 'completed' && (
                             <svg className="w-6 h-6 text-orange-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                         )}
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 pl-2">Messages</h3>
                <ChatInterface 
                  currentUserRole={role} 
                  recipientName={role === UserRole.BRAND ? (influencer?.name || 'Creator') : campaign.brand}
                  messages={campaign.messages || []}
                  onSendMessage={handleSendMessage}
                />
              </div>
          </div>

          {/* RIGHT COLUMN: Actions & Logs */}
          <div className="space-y-8">
            {/* Role-Specific Actions */}
            {campaign.status === 'draft' && (
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] space-y-6 border border-white/60 h-fit shadow-sm">
                 <h3 className="text-lg font-bold serif italic brand-text">Not started yet</h3>
                 <p className="text-sm text-gray-600">This campaign is still a draft. Review the details and start when you are ready.</p>
                 <button onClick={handleActivate} className="w-full py-5 button-brand rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-transform">
                   {role === UserRole.BRAND ? 'Approve & launch' : 'Accept & join'}
                 </button>
              </div>
            )}

            {role === UserRole.BRAND && campaign.assignedInfluencerId && campaign.status !== 'draft' && (
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] space-y-6 border border-white/60 h-fit shadow-sm">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold serif italic brand-text">Creator</h3>
                    <div className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">Active</div>
                </div>
                {influencer ? (
                <div className="flex items-center gap-4">
                  <img src={influencer.image} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900">{influencer.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">{influencer.followers.toLocaleString()} Followers</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className="text-xs text-[#FF5500] font-bold">Trust {influencer.trustScore}</span>
                    </div>
                  </div>
                </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    This creator is assigned on the campaign but does not appear in the current directory snapshot (they may be new or outside the loaded profile set).
                  </p>
                )}
                {campaign.proofUrl ? (
                  <div className="bg-white/80 p-4 rounded-2xl border border-gray-200">
                    <p className="text-[9px] text-gray-400 uppercase font-black mb-2">Proof of Work</p>
                    <a href={campaign.proofUrl} target="_blank" className="text-sm text-[#FF5500] underline truncate block hover:text-orange-700 transition-colors">{campaign.proofUrl}</a>
                  </div>
                ) : (
                  <div className="bg-gray-100/50 p-4 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-sm italic text-gray-500 text-center">Creator has not submitted work yet.</p>
                  </div>
                )}

                {campaign.status === 'auditing' && (
                  <button onClick={handleReleasePayment} className="w-full py-5 button-brand rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-transform">Authorize Release</button>
                )}
              </div>
            )}

            {role === UserRole.INFLUENCER && campaign.status !== 'draft' && (
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] space-y-6 border border-white/60 h-fit shadow-sm">
                <h3 className="text-lg font-bold serif italic brand-text">Submit Your Work</h3>
                {campaign.status === 'active' ? (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600">Paste a link to your post or video (for example on Instagram or TikTok). Your brand will use it to verify your work.</p>
                    <input 
                      type="text"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/80 border border-gray-200 rounded-2xl p-4 text-sm text-gray-900 focus:outline-none focus:border-[#FF5500] transition-colors shadow-inner"
                    />
                    <button onClick={handleSubmitProof} className="w-full py-5 button-brand rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-transform">Submit for review</button>
                  </div>
                ) : (
                  <div className="bg-white/80 p-6 rounded-2xl border border-gray-200 text-center space-y-2">
                     <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl shadow-sm">✓</div>
                     <p className="text-sm font-bold text-gray-900">
                       {campaign.status === 'auditing' ? 'Under review' : 'Completed'}
                     </p>
                     <p className="text-xs text-gray-500">See the activity log below for updates.</p>
                  </div>
                )}
              </div>
            )}

             <div className="bg-white/60 backdrop-blur-md border border-white/60 p-6 rounded-[2.5rem] space-y-4 shadow-sm">
                 <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Activity log</h3>
                 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                    {campaign.logs?.map((log, i) => (
                      <div key={i} className="relative flex items-start gap-4">
                         <div className="absolute left-0 mt-1.5 w-3 h-3 rounded-full border-2 border-[#FF5500] bg-white z-10 shadow-sm"></div>
                         <div className="pl-6 space-y-0.5 w-full">
                            <div className="flex justify-between items-center">
                              <p className="text-xs font-bold text-gray-900">{log.action}</p>
                              <span className="text-[9px] font-mono text-gray-500 bg-white/50 px-2 py-0.5 rounded border border-gray-200 shadow-sm">{log.hash}</span>
                            </div>
                            <p className="text-[9px] text-gray-500 font-medium">{log.date}</p>
                         </div>
                      </div>
                    ))}
                    {!campaign.logs && <p className="text-xs text-gray-400 italic pl-6">No activity recorded yet.</p>}
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
