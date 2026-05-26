/**
 * Role-aware hub: tabs for overview, campaigns, analytics, wallet, deliverables.
 * Brands can create campaigns (escrow lock from wallet); influencers see gamification.
 * Campaign cards navigate to `/campaign/:id` (refresh-safe).
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { UserRole, Campaign } from '../types';
import Analytics from '../components/Analytics';
import { generateCampaignIdeas } from '../services/geminiService';
import { playSound } from '../audio.ts';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    role, 
    user,
    campaigns, 
    addCampaign, 
    updateCampaign,
    addMarketplaceCampaign,
    walletBalance, 
    updateWalletBalance,
    escrowBalance, 
    updateEscrowBalance,
    transactions, 
    addTransaction,
    addNotification,
    availableInfluencers,
  } = useApp();

  const recentActivityRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'analytics' | 'wallet' | 'deliverables'>('overview');

  const [showWalletModal, setShowWalletModal] = useState(false);
  /** Brands add funds; creators withdraw (M-Pesa mock). */
  const [walletModalMode, setWalletModalMode] = useState<'withdraw' | 'topup'>('withdraw');
  const [walletAmount, setWalletAmount] = useState('');
  const [isProcessingWallet, setIsProcessingWallet] = useState(false);
  /** Influencer-only: progress bar vs monthly earnings target. */
  const [monthlyGoal, setMonthlyGoal] = useState(50000);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState('');

  /** Demo “level” derived from wallet balance (not persisted). */
  const xp = walletBalance % 10000;
  const level = Math.floor(walletBalance / 10000) + 1;
  const nextLevelXp = 10000;
  const progress = (xp / nextLevelXp) * 100;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
      title: '',
      description: '',
      budget: '',
      platform: 'Instagram' as Campaign['platform'],
      niche: '',
      startDate: '',
      endDate: '',
      assignedInfluencerId: ''
  });

  const notify = (msg: string) => addNotification(msg);

  /** M-Pesa withdrawal mock: debits wallet, logs transaction, confetti + sound. */
  const handleWithdraw = () => {
    const amount = Number(walletAmount);
    if (amount > walletBalance || amount <= 0) return;
    setIsProcessingWallet(true);
    setTimeout(() => {
      updateWalletBalance(-amount);
      addTransaction({
        id: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        date: 'Just now',
        type: 'Withdrawal',
        amount: -amount,
        status: 'Success',
        method: 'M-Pesa'
      });
      setIsProcessingWallet(false);
      setShowWalletModal(false);
      setWalletAmount('');
      notify("Withdrawal successful via M-Pesa");
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF5500', '#000000', '#FFFFFF']
      });
      playSound('success');
    }, 1500);
  };

  /** Simulated bank / M-Pesa top-up for brand wallet. */
  const handleTopUp = () => {
    const amount = Number(walletAmount);
    if (amount <= 0) return;
    setIsProcessingWallet(true);
    setTimeout(() => {
      updateWalletBalance(amount);
      addTransaction({
        id: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        date: 'Just now',
        type: 'Deposit',
        amount,
        status: 'Success',
        method: 'M-Pesa'
      });
      setIsProcessingWallet(false);
      setShowWalletModal(false);
      setWalletAmount('');
      notify("Top-up successful");
      playSound('success');
    }, 1500);
  };

  const openWalletModal = (mode: 'withdraw' | 'topup') => {
    setWalletModalMode(mode);
    setWalletAmount('');
    setShowWalletModal(true);
    playSound('click');
  };

  const scrollToActivity = () => {
    playSound('click');
    recentActivityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleUpdateGoal = () => {
     if (Number(tempGoal) > 0) {
        setMonthlyGoal(Number(tempGoal));
        setShowGoalModal(false);
        notify("Monthly Goal Updated!");
        playSound('success');
     }
  };

  /** Fills description from `generateCampaignIdeas` (mock AI). */
  const handleGenerateIdea = async () => {
    playSound('click');
    if (!newCampaign.title || !newCampaign.niche) {
      notify("Please enter a title and niche first.");
      return;
    }
    setIsGeneratingAI(true);
    const idea = await generateCampaignIdeas(newCampaign.title, newCampaign.niche, newCampaign.platform);
    setNewCampaign(prev => ({ ...prev, description: idea }));
    setIsGeneratingAI(false);
    playSound('success'); // Sound to indicate success
  };

  /** Creates campaign, moves budget from wallet → escrow, appends ledger row. */
  const handleCreateCampaign = () => {
     if (!newCampaign.title || !newCampaign.budget) return;
     const campaign: Campaign = {
       id: `C-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
       title: newCampaign.title,
       brand: user?.name || 'Brand account',
       budget: Number(newCampaign.budget),
       niche: newCampaign.niche || 'General',
       status: 'active',
       description: newCampaign.description,
       platform: newCampaign.platform,
       assignedInfluencerId: newCampaign.assignedInfluencerId || undefined,
       timeline: {
         startDate: newCampaign.startDate || new Date().toISOString().split('T')[0],
         endDate: newCampaign.endDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
       },
       logs: [{ date: new Date().toLocaleString(), action: 'Campaign Created', hash: `0x${Math.random().toString(16).substr(2, 8)}` }]
     };
     
     const budget = Number(newCampaign.budget);
     if (budget > walletBalance) {
        notify("Insufficient funds in wallet.");
        return;
     }
     
     updateWalletBalance(-budget);
     updateEscrowBalance(budget);
     
     addCampaign(campaign);
     addMarketplaceCampaign(campaign);
     
     addTransaction({
        id: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        date: 'Just now',
        type: 'Payment held',
        amount: -budget,
        status: 'Success',
        method: 'Secure hold'
     });

     setShowCreateModal(false);
     setNewCampaign({ title: '', description: '', budget: '', platform: 'Instagram', niche: '', startDate: '', endDate: '', assignedInfluencerId: '' });
     notify("Campaign created");
  };

  return (
    <div className="max-w-7xl mx-auto px-5 pt-24 pb-20 space-y-8 min-h-screen relative">
       {/* Background Gradient Blob */}
       <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply animate-pulse"></div>
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <h1 className="text-4xl md:text-5xl font-black serif italic brand-text tracking-tighter uppercase leading-none">
                 {role === UserRole.BRAND ? 'Brand home' : 'Creator home'}
               </h1>
               {role === UserRole.INFLUENCER && (
                  <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg transform -rotate-2 border border-white/20">
                     Lvl {level}
                  </div>
               )}
            </div>
            <div className="flex items-center gap-4">
               <p className="text-gray-900 font-medium text-sm italic bg-white/30 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                 {role === UserRole.BRAND ? 'Manage campaigns and payments in one place.' : 'Track your jobs and earnings.'}
               </p>
               {role === UserRole.INFLUENCER && (
                  <div className="flex items-center gap-2 bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/30">
                     <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF5500] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                     </div>
                     <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{Math.floor(xp)} / {nextLevelXp} XP</span>
                  </div>
               )}
            </div>
          </div>
          
          <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-full border border-white/40 shadow-sm overflow-x-auto">
             {([
               { id: 'overview' as const, label: 'Overview' },
               { id: 'campaigns' as const, label: 'Campaigns' },
               { id: 'analytics' as const, label: 'Insights' },
               { id: 'wallet' as const, label: 'Wallet' },
               { id: 'deliverables' as const, label: 'Tasks' },
             ]).map(({ id, label }) => (
               <button
                 key={id}
                 onClick={() => { playSound('click'); setActiveTab(id); }}
                 className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                   activeTab === id ? 'bg-white shadow-md text-[#FF5500] scale-105' : 'text-gray-500 hover:text-gray-900 hover:bg-white/30'
                 }`}
               >
                 {label}
               </button>
             ))}
          </div>
       </div>

       {/* Content */}
       <div className="animate-in fade-in duration-500">
          {activeTab === 'overview' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/40 backdrop-blur-lg border border-white/50 p-6 rounded-[2rem] space-y-2 shadow-sm">
                   <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest">Total {role === UserRole.BRAND ? 'spent' : 'earnings'}</p>
                   <p className="text-4xl font-black serif italic text-gray-900">KES {walletBalance.toLocaleString()}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-lg border border-white/50 p-6 rounded-[2rem] space-y-2 shadow-sm">
                   <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest">{role === UserRole.BRAND ? 'In escrow' : 'Trust score'}</p>
                   <p className="text-4xl font-black serif italic brand-text">
                     {role === UserRole.BRAND ? `KES ${escrowBalance.toLocaleString()}` : '98/100'}
                   </p>
                </div>
                <div className="bg-white/40 backdrop-blur-lg border border-white/50 p-6 rounded-[2rem] space-y-2 shadow-sm">
                   <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest">Active campaigns</p>
                   <p className="text-4xl font-black serif italic text-gray-900">{campaigns.filter(c => c.status === 'active' || c.status === 'auditing').length}</p>
                </div>
             </div>
          )}

          {activeTab === 'analytics' && (
            <Analytics role={role} />
          )}

          {activeTab === 'campaigns' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-bold serif italic text-gray-900">Your campaigns</h2>
                   {role === UserRole.BRAND && (
                     <button onClick={() => { playSound('click'); setShowCreateModal(true); }} className="px-6 py-3 button-brand rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                       + New Campaign
                     </button>
                   )}
                </div>

                <div className="grid gap-4">
                   {campaigns.length === 0 ? (
                      <div className="glass-card rounded-[2rem] p-12 text-center border border-dashed border-gray-200/80">
                         <p className="text-sm font-medium text-gray-600 mb-4">No campaigns yet.</p>
                         {role === UserRole.BRAND ? (
                           <button
                             type="button"
                             onClick={() => { playSound('click'); setShowCreateModal(true); }}
                             className="button-brand px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest"
                           >
                             Create your first campaign
                           </button>
                         ) : (
                           <button
                             type="button"
                             onClick={() => { playSound('click'); navigate('/marketplace'); }}
                             className="button-brand px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest"
                           >
                             Browse marketplace
                           </button>
                         )}
                      </div>
                   ) : (
                   campaigns.map((campaign) => (
                      <div 
                        key={campaign.id} 
                        onClick={() => { playSound('click'); navigate(`/campaign/${campaign.id}`); }}
                        className="glass-card p-6 rounded-[2rem] hover:bg-white/80 transition-all cursor-pointer group"
                      >
                         <div className="flex justify-between items-start">
                            <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FF5500] transition-colors">{campaign.title}</h3>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                     campaign.status === 'active' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' : 
                                     campaign.status === 'auditing' ? 'bg-amber-100/50 text-amber-700 border-amber-200' : 
                                     campaign.status === 'completed' ? 'bg-blue-100/50 text-blue-700 border-blue-200' :
                                     campaign.status === 'paid' ? 'bg-purple-100/50 text-purple-700 border-purple-200' :
                                     'bg-gray-100/50 text-gray-600 border-gray-200'
                                  }`}>
                                    {campaign.status}
                                  </span>
                               </div>
                               <p className="text-sm text-gray-600 font-medium">{campaign.brand} • {campaign.platform}</p>
                               {campaign.timeline && (
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                   {campaign.timeline.startDate} — {campaign.timeline.endDate}
                                 </p>
                               )}
                            </div>
                            <p className="text-lg font-black serif italic text-gray-900">KES {campaign.budget.toLocaleString()}</p>
                         </div>
                      </div>
                   ))
                   )}
                </div>
             </div>
          )}

          {activeTab === 'wallet' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                  className="md:col-span-2 rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm"
                  role="note"
                >
                  <strong className="font-semibold">Illustrative wallet only.</strong> Balances, top-ups, withdrawals,
                  and M-Pesa labels here simulate product workflows. They are not a bank or payment institution. Connect a
                  licensed payments partner before handling real funds.
                </div>
                <div className="space-y-6">
                   <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <svg className="w-32 h-32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.86 0 .53-.41 1.37-1.96 1.37-1.6 0-2.16-.85-2.22-1.92H8.25c.07 1.71 1.11 3.01 2.65 3.42V20h2.19v-1.65c1.54-.33 2.81-1.28 2.81-2.95 0-2.02-1.66-2.92-3.59-3.41z"/></svg>
                      </div>
                      <div className="relative z-10 space-y-6">
                        <div className="space-y-1">
                           <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Available Balance</p>
                           <p className="text-5xl font-bold serif italic tracking-tight">KES {walletBalance.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => openWalletModal(role === UserRole.BRAND ? 'topup' : 'withdraw')} className="flex-1 bg-white text-gray-900 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
                             {role === UserRole.BRAND ? 'Top up' : 'Withdraw'}
                           </button>
                           <button type="button" onClick={scrollToActivity} className="flex-1 bg-white/10 text-white border border-white/20 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors">
                             History
                           </button>
                        </div>
                      </div>
                   </div>

                   {/* Earnings Chart (New Feature) */}
                   <div className="glass-card p-6 rounded-[2.5rem] space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Earnings Trend (6 Months)</h3>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { name: 'Jan', value: 12000 },
                            { name: 'Feb', value: 18000 },
                            { name: 'Mar', value: 15000 },
                            { name: 'Apr', value: 25000 },
                            { name: 'May', value: 32000 },
                            { name: 'Jun', value: 45000 },
                          ]}>
                            <defs>
                              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                              itemStyle={{ color: '#10B981', fontWeight: 'bold', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   {/* Monthly Goal Widget (Gamification) */}
                   {role === UserRole.INFLUENCER && (
                      <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group">
                         <div className="flex justify-between items-start z-10 relative">
                            <div>
                               <h3 className="text-lg font-bold serif italic text-gray-900">Monthly Goal</h3>
                               <p className="text-xs text-gray-500 font-medium mt-1">Keep pushing! You're doing great.</p>
                            </div>
                            <button 
                              onClick={() => setShowGoalModal(true)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 hover:text-[#FF5500] transition-colors"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                         </div>
                         
                         <div className="mt-6 relative">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                               <span>KES {walletBalance.toLocaleString()}</span>
                               <span>KES {monthlyGoal.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-gradient-to-r from-[#FF5500] to-orange-400 rounded-full transition-all duration-1000 relative"
                                 style={{ width: `${Math.min((walletBalance / monthlyGoal) * 100, 100)}%` }}
                               >
                                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                               </div>
                            </div>
                            <p className="text-right text-[10px] font-bold text-[#FF5500] mt-2">
                               {Math.round((walletBalance / monthlyGoal) * 100)}% Achieved
                            </p>
                         </div>
                      </div>
                   )}

                   {/* Pending Payments (New Feature) */}
                   <div className="glass-card rounded-[2.5rem] p-8">
                      <h3 className="text-lg font-bold serif italic text-gray-900 mb-6">Pending Payments</h3>
                      <div className="space-y-4">
                         {campaigns.filter(c => c.status === 'auditing' || c.status === 'active').length > 0 ? (
                           campaigns.filter(c => c.status === 'auditing' || c.status === 'active').map(c => (
                             <div key={c.id} className="flex justify-between items-center p-3 bg-white/40 rounded-xl border border-white/50">
                                <div>
                                  <p className="text-xs font-bold text-gray-900">{c.title}</p>
                                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">{c.status === 'auditing' ? 'Under Review' : 'In Progress'}</p>
                                </div>
                                <p className="text-sm font-black text-gray-400">KES {c.budget.toLocaleString()}</p>
                             </div>
                           ))
                         ) : (
                           <p className="text-xs text-gray-400 italic text-center py-4">No pending payments.</p>
                         )}
                      </div>
                   </div>

                   <div ref={recentActivityRef} className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 shadow-sm h-fit scroll-mt-24">
                      <h3 className="text-lg font-bold serif italic text-gray-900 mb-6">Recent activity</h3>
                      <div className="space-y-6">
                         {transactions.map((tx) => (
                           <div key={tx.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {tx.amount > 0 ? '↓' : '↑'}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-gray-900">{tx.type}</p>
                                    <p className="text-xs text-gray-500">{tx.date} • {tx.method}</p>
                                 </div>
                              </div>
                              <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                 {tx.amount > 0 ? '+' : ''}KES {Math.abs(tx.amount).toLocaleString()}
                              </p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}
          {activeTab === 'deliverables' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold serif italic text-gray-900">Tasks</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* To Do Column */}
                   <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[2rem] shadow-sm space-y-4 h-fit">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">To Do</h3>
                      </div>
                      {campaigns.filter(c => c.status !== 'draft').flatMap(c => (c.deliverables || []).map(d => ({ ...d, campaignTitle: c.title, campaignId: c.id })))
                        .filter(d => d.status === 'pending')
                        .map((task, idx) => (
                           <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                              const campaign = campaigns.find(c => c.id === task.campaignId);
                              if (campaign) navigate(`/campaign/${campaign.id}`);
                           }}>
                              <p className="text-xs font-bold text-gray-900 mb-1">{task.description || task.type}</p>
                              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">{task.campaignTitle}</p>
                              <div className="flex justify-between items-center">
                                 <span className="text-[9px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                                 <span className="text-[10px]">{task.platform === 'Instagram' ? '📸' : task.platform === 'TikTok' ? '🎵' : '📹'}</span>
                              </div>
                           </div>
                        ))}
                        {campaigns.filter(c => c.status !== 'draft').flatMap(c => (c.deliverables || []).filter(d => d.status === 'pending')).length === 0 && (
                           <p className="text-xs text-gray-400 italic text-center py-8">No pending tasks.</p>
                        )}
                   </div>

                   {/* Submitted Column */}
                   <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[2rem] shadow-sm space-y-4 h-fit">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">In Review</h3>
                      </div>
                      {campaigns.filter(c => c.status !== 'draft').flatMap(c => (c.deliverables || []).map(d => ({ ...d, campaignTitle: c.title, campaignId: c.id })))
                        .filter(d => d.status === 'submitted')
                        .map((task, idx) => (
                           <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                              const campaign = campaigns.find(c => c.id === task.campaignId);
                              if (campaign) navigate(`/campaign/${campaign.id}`);
                           }}>
                              <p className="text-xs font-bold text-gray-900 mb-1">{task.description || task.type}</p>
                              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">{task.campaignTitle}</p>
                              <div className="flex justify-between items-center">
                                 <span className="text-[9px] font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">Submitted</span>
                              </div>
                           </div>
                        ))}
                        {campaigns.filter(c => c.status !== 'draft').flatMap(c => (c.deliverables || []).filter(d => d.status === 'submitted')).length === 0 && (
                           <p className="text-xs text-gray-400 italic text-center py-8">No tasks in review.</p>
                        )}
                   </div>

                   {/* Approved Column */}
                   <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[2rem] shadow-sm space-y-4 h-fit">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-green-500"></div>
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Completed</h3>
                      </div>
                      {campaigns.filter(c => c.status !== 'draft').flatMap(c => (c.deliverables || []).map(d => ({ ...d, campaignTitle: c.title, campaignId: c.id })))
                        .filter(d => d.status === 'approved')
                        .map((task, idx) => (
                           <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-gray-100 shadow-sm opacity-75 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => {
                              const campaign = campaigns.find(c => c.id === task.campaignId);
                              if (campaign) navigate(`/campaign/${campaign.id}`);
                           }}>
                              <p className="text-xs font-bold text-gray-900 mb-1 line-through">{task.description || task.type}</p>
                              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">{task.campaignTitle}</p>
                              <div className="flex justify-between items-center">
                                 <span className="text-[9px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Approved</span>
                              </div>
                           </div>
                        ))}
                        {campaigns.filter(c => c.status !== 'draft').flatMap(c => (c.deliverables || []).filter(d => d.status === 'approved')).length === 0 && (
                           <p className="text-xs text-gray-400 italic text-center py-8">No completed tasks yet.</p>
                        )}
                   </div>
                </div>
             </div>
          )}
       </div>

       {/* Create Campaign Modal */}
       {showCreateModal && (
          <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-xl flex items-center justify-center p-5 animate-in fade-in duration-300">
             <div className="bg-white/80 backdrop-blur-xl w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl border border-white/50 space-y-6 max-h-[90vh] overflow-y-auto custom-scroll">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-bold serif italic brand-text">New campaign</h2>
                   <button onClick={() => { playSound('click'); setShowCreateModal(false); }} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200">&times;</button>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Campaign Title</label>
                      <input 
                        className="w-full bg-white/60 border border-gray-200 p-4 rounded-xl focus:border-[#FF5500] focus:ring-0 outline-none transition-colors font-medium" 
                        value={newCampaign.title}
                        onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                        placeholder="e.g. Summer Launch"
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Budget (KES)</label>
                          <input 
                            type="number"
                            className="w-full bg-white/60 border border-gray-200 p-4 rounded-xl focus:border-[#FF5500] outline-none font-medium" 
                            value={newCampaign.budget}
                            onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
                            placeholder="50000"
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Niche</label>
                          <input 
                            className="w-full bg-white/60 border border-gray-200 p-4 rounded-xl focus:border-[#FF5500] outline-none font-medium" 
                            value={newCampaign.niche}
                            onChange={(e) => setNewCampaign({...newCampaign, niche: e.target.value})}
                            placeholder="Fashion, Tech..."
                          />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Start Date</label>
                          <input 
                            type="date"
                            className="w-full bg-white/60 border border-gray-200 p-4 rounded-xl focus:border-[#FF5500] outline-none font-medium text-sm" 
                            value={newCampaign.startDate}
                            onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">End Date</label>
                          <input 
                            type="date"
                            className="w-full bg-white/60 border border-gray-200 p-4 rounded-xl focus:border-[#FF5500] outline-none font-medium text-sm" 
                            value={newCampaign.endDate}
                            onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                          />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Assigned Influencer (Optional)</label>
                      <select 
                        className="w-full bg-white/60 border border-gray-200 p-4 rounded-xl focus:border-[#FF5500] outline-none font-medium text-sm"
                        value={newCampaign.assignedInfluencerId}
                        onChange={(e) => setNewCampaign({...newCampaign, assignedInfluencerId: e.target.value})}
                      >
                        <option value="">Select an Influencer</option>
                        {availableInfluencers.map((inf) => (
                          <option key={inf.id} value={inf.id}>
                            {inf.name} ({inf.niche.join(', ')})
                          </option>
                        ))}
                      </select>
                   </div>

                   <div className="space-y-1 relative">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Strategy & Description</label>
                        <button 
                          onClick={handleGenerateIdea}
                          disabled={isGeneratingAI}
                          className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isGeneratingAI ? (
                            <span className="animate-pulse">Generating...</span>
                          ) : (
                            <>
                              <span>✨ Auto-Fill Strategy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea 
                        className="w-full bg-white/60 border border-gray-200 p-4 rounded-xl h-32 resize-none focus:border-[#FF5500] outline-none font-medium text-sm leading-relaxed" 
                        value={newCampaign.description}
                        onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                        placeholder="Describe what you need, or use the Auto-Fill to generate a concept..."
                      />
                   </div>

                   <button onClick={handleCreateCampaign} className="w-full py-5 button-brand rounded-xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform">
                      Create campaign
                   </button>
                </div>
             </div>
          </div>
       )}

       {/* Wallet: top-up (brands) or withdraw (creators) */}
       {showWalletModal && (
          <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-xl flex items-center justify-center p-5 animate-in fade-in duration-300">
             <div className="bg-white/80 backdrop-blur-xl w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl border border-white/50 space-y-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">💸</div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-bold serif italic text-gray-900">
                     {walletModalMode === 'topup' ? 'Top up balance' : 'M-Pesa withdraw'}
                   </h2>
                   <p className="text-gray-500 text-sm">
                     {walletModalMode === 'topup'
                       ? 'Enter amount to add (demo). Funds appear in your wallet immediately.'
                       : 'Enter amount to send to your linked M-Pesa number.'}
                   </p>
                </div>
                <input 
                  type="number" 
                  autoFocus
                  min={0}
                  className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-gray-200 py-2 focus:border-[#FF5500] outline-none"
                  placeholder="0"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                />
                <div className="flex gap-3">
                   <button type="button" onClick={() => { playSound('click'); setShowWalletModal(false); setWalletAmount(''); }} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100">Cancel</button>
                   <button 
                    type="button"
                    onClick={walletModalMode === 'topup' ? handleTopUp : handleWithdraw}
                    disabled={isProcessingWallet}
                    className="flex-1 button-brand py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform disabled:opacity-70"
                   >
                     {isProcessingWallet ? 'Processing...' : 'Confirm'}
                   </button>
                </div>
             </div>
          </div>
       )}

       {/* Goal Modal */}
       {showGoalModal && (
          <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-xl flex items-center justify-center p-5 animate-in fade-in duration-300">
             <div className="bg-white/80 backdrop-blur-xl w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl border border-white/50 space-y-6 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-3xl">🎯</div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-bold serif italic text-gray-900">Set Monthly Goal</h2>
                   <p className="text-gray-500 text-sm">Challenge yourself to earn more!</p>
                </div>
                <input 
                  type="number" 
                  autoFocus
                  className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-gray-200 py-2 focus:border-[#FF5500] outline-none"
                  placeholder={monthlyGoal.toString()}
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                />
                <div className="flex gap-3">
                   <button onClick={() => { playSound('click'); setShowGoalModal(false); }} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100">Cancel</button>
                   <button 
                    onClick={handleUpdateGoal}
                    className="flex-1 button-brand py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                   >
                     Set Goal
                   </button>
                </div>
             </div>
          </div>
       )}

    </div>
  );
};

export default Dashboard;
