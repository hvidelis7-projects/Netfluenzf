/**
 * Post-registration wizard: saves answers to the signed-in profile via `updateUserProfile`.
 * Branching: `UserRole.BRAND` vs creator steps from `useApp().role`.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { playSound } from '../audio.ts';
import { ArrowRight, ArrowLeft, CheckCircle2, Building2, Target, Wallet, User, Link, Tags } from 'lucide-react';

const GOALS = ['Brand Awareness', 'Lead Generation', 'Sales & Conversions', 'Content Creation'] as const;
const BUDGETS = ['Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+'] as const;
const CATEGORIES = ['Fashion', 'Beauty', 'Tech', 'Gaming', 'Lifestyle', 'Travel', 'Fitness', 'Food'] as const;

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { role, user, updateUserProfile, addNotification } = useApp();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [brand, setBrand] = useState({
    companyName: '',
    industry: 'Technology',
    website: '',
    goals: [] as string[],
    budgetRange: '',
  });

  const [creator, setCreator] = useState({
    displayName: '',
    bio: '',
    location: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    categories: [] as string[],
  });

  const toggleGoal = (g: string) => {
    setBrand((b) => ({
      ...b,
      goals: b.goals.includes(g) ? b.goals.filter((x) => x !== g) : [...b.goals, g],
    }));
  };

  const toggleCategory = (c: string) => {
    setCreator((cr) => ({
      ...cr,
      categories: cr.categories.includes(c) ? cr.categories.filter((x) => x !== c) : [...cr.categories, c],
    }));
  };

  const handleNext = () => {
    playSound('click');
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    playSound('click');
    setStep((s) => s - 1);
  };

  const handleComplete = () => {
    setIsLoading(true);
    playSound('click');
    setTimeout(() => {
      if (role === UserRole.BRAND) {
        const goalsLine = brand.goals.length ? `Campaign goals: ${brand.goals.join(', ')}` : '';
        const mergedBio = [user?.bio, goalsLine].filter(Boolean).join('\n\n');
        updateUserProfile({
          ...(brand.companyName.trim() ? { name: brand.companyName.trim() } : {}),
          industry: brand.industry,
          ...(brand.website.trim() ? { website: brand.website.trim() } : {}),
          ...(brand.budgetRange ? { budgetRange: brand.budgetRange } : {}),
          ...(mergedBio ? { bio: mergedBio } : {}),
        });
      } else {
        const links: { platform: string; url: string }[] = [];
        const ig = creator.instagram.replace(/^@/, '').trim();
        const tt = creator.tiktok.replace(/^@/, '').trim();
        if (ig) links.push({ platform: 'Instagram', url: `https://instagram.com/${ig}` });
        if (tt) links.push({ platform: 'TikTok', url: `https://www.tiktok.com/@${tt}` });
        if (creator.youtube.trim()) links.push({ platform: 'YouTube', url: creator.youtube.trim() });
        updateUserProfile({
          ...(creator.displayName.trim() ? { name: creator.displayName.trim() } : {}),
          ...(creator.bio.trim() ? { bio: creator.bio.trim() } : {}),
          ...(creator.location.trim() ? { location: creator.location.trim() } : {}),
          ...(creator.categories.length ? { niche: creator.categories } : {}),
          ...(links.length ? { platformLinks: links } : {}),
        });
      }
      setIsLoading(false);
      playSound('success');
      addNotification('Your answers have been saved to your profile');
      navigate('/dashboard', { replace: true });
    }, 600);
  };

  const renderBrandSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF5500]/10 rounded-xl text-[#FF5500]">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black serif italic brand-text">Company details</h2>
              </div>
              <p className="text-sm text-gray-500 font-medium">Share brand profile information.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Company name</label>
                <input
                  type="text"
                  value={brand.companyName}
                  onChange={(e) => setBrand((b) => ({ ...b, companyName: e.target.value }))}
                  className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Industry</label>
                <select
                  value={brand.industry}
                  onChange={(e) => setBrand((b) => ({ ...b, industry: e.target.value }))}
                  className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                >
                  <option>Technology</option>
                  <option>Fashion</option>
                  <option>Food & Beverage</option>
                  <option>Health & Wellness</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Website</label>
                <input
                  type="url"
                  value={brand.website}
                  onChange={(e) => setBrand((b) => ({ ...b, website: e.target.value }))}
                  className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF5500]/10 rounded-xl text-[#FF5500]">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black serif italic brand-text">Campaign goals</h2>
              </div>
              <p className="text-sm text-gray-500 font-medium">What are you looking to achieve?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {GOALS.map((goal) => (
                <label key={goal} className="flex items-center space-x-3 p-4 border border-white/50 bg-white/60 rounded-xl cursor-pointer hover:bg-white transition-all">
                  <input
                    type="checkbox"
                    checked={brand.goals.includes(goal)}
                    onChange={() => toggleGoal(goal)}
                    className="w-4 h-4 text-[#FF5500] rounded border-gray-300 focus:ring-[#FF5500]"
                  />
                  <span className="text-sm font-bold text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF5500]/10 rounded-xl text-[#FF5500]">
                  <Wallet className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black serif italic brand-text">Budget range</h2>
              </div>
              <p className="text-sm text-gray-500 font-medium">Select your typical campaign budget.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {BUDGETS.map((budget) => (
                <label key={budget} className="flex items-center space-x-3 p-4 border border-white/50 bg-white/60 rounded-xl cursor-pointer hover:bg-white transition-all">
                  <input
                    type="radio"
                    name="budget"
                    checked={brand.budgetRange === budget}
                    onChange={() => setBrand((b) => ({ ...b, budgetRange: budget }))}
                    className="w-4 h-4 text-[#FF5500] border-gray-300 focus:ring-[#FF5500]"
                  />
                  <span className="text-sm font-bold text-gray-700">{budget}</span>
                </label>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderCreatorSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF5500]/10 rounded-xl text-[#FF5500]">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black serif italic brand-text">Profile details</h2>
              </div>
              <p className="text-sm text-gray-500 font-medium">Let brands know who you are.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Display name</label>
                <input
                  type="text"
                  value={creator.displayName}
                  onChange={(e) => setCreator((c) => ({ ...c, displayName: e.target.value }))}
                  className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                  placeholder="Alex Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Bio</label>
                <textarea
                  value={creator.bio}
                  onChange={(e) => setCreator((c) => ({ ...c, bio: e.target.value }))}
                  className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                  placeholder="Enter a professional profile summary..."
                  rows={3}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Location</label>
                <input
                  type="text"
                  value={creator.location}
                  onChange={(e) => setCreator((c) => ({ ...c, location: e.target.value }))}
                  className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                  placeholder="Nairobi, Kenya"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF5500]/10 rounded-xl text-[#FF5500]">
                  <Link className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black serif italic brand-text">Social links</h2>
              </div>
              <p className="text-sm text-gray-500 font-medium">Connect your platforms.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Instagram</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/50 bg-white/40 text-gray-500 text-sm">@</span>
                  <input
                    type="text"
                    value={creator.instagram}
                    onChange={(e) => setCreator((c) => ({ ...c, instagram: e.target.value }))}
                    className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-xl bg-white/80 border border-white/50 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">TikTok</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/50 bg-white/40 text-gray-500 text-sm">@</span>
                  <input
                    type="text"
                    value={creator.tiktok}
                    onChange={(e) => setCreator((c) => ({ ...c, tiktok: e.target.value }))}
                    className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-xl bg-white/80 border border-white/50 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">YouTube</label>
                <input
                  type="url"
                  value={creator.youtube}
                  onChange={(e) => setCreator((c) => ({ ...c, youtube: e.target.value }))}
                  className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                  placeholder="https://youtube.com/c/..."
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF5500]/10 rounded-xl text-[#FF5500]">
                  <Tags className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black serif italic brand-text">Content categories</h2>
              </div>
              <p className="text-sm text-gray-500 font-medium">What do you create content about?</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const checked = creator.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full border text-xs font-bold transition-all hover:bg-white ${
                      checked
                        ? 'border-[#FF5500] bg-[#FF5500] text-white'
                        : 'border-white/50 bg-white/60 text-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#FF5500]' : 'bg-white/50'}`} />
          ))}
        </div>

        {role === UserRole.BRAND ? renderBrandSteps() : renderCreatorSteps()}

        <div className="mt-10 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-white/50 bg-white/50 hover:bg-white transition-all text-gray-600 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            type="button"
            onClick={step === 3 ? handleComplete : handleNext}
            disabled={isLoading}
            className="flex-1 py-3 sm:py-4 button-brand rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Saving...' : step === 3 ? (
              <>
                Complete <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
