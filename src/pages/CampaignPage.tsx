/**
 * Refresh-safe campaign workspace: `/campaign/:id` resolves from context.
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CampaignDetail from '../components/CampaignDetail';
import { useApp } from '../context/AppContext';

const CampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, updateCampaign, role } = useApp();
  const campaign = id ? campaigns.find((c) => c.id === id) : undefined;

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-5 pt-28 pb-20 min-h-screen">
        <div className="glass-card rounded-[2rem] p-10 text-center space-y-4 max-w-lg mx-auto">
          <h1 className="text-xl font-black serif italic text-gray-900">Campaign not found</h1>
          <p className="text-sm text-gray-600">
            This link may be outdated or the campaign was removed from your workspace.
          </p>
          <button
            type="button"
            className="button-brand px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest"
            onClick={() => navigate('/dashboard')}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <CampaignDetail
      campaign={campaign}
      role={role}
      onClose={() => navigate('/dashboard')}
      onUpdateCampaign={(updated) => updateCampaign(updated)}
    />
  );
};

export default CampaignPage;
