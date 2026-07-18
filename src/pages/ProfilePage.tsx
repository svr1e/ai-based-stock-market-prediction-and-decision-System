import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile, auth } from '@/lib/firebase';
import { User, Mail, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateUserProfile(auth.currentUser, { displayName: name });
      setUser({ ...user!, displayName: name });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account information</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center overflow-hidden ring-2 ring-[#00E5FF]/30">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-black">
                  {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00E5FF] flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{user?.displayName || 'User'}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
              <span className="text-[11px] font-semibold text-[#00E5FF]">Pro Plan</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Display Name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="cyber-input" placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input value={user?.email || ''} disabled className="cyber-input opacity-50 cursor-not-allowed" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Plan</label>
              <input value="Pro" disabled className="cyber-input opacity-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Member Since</label>
              <input value={new Date().getFullYear().toString()} disabled className="cyber-input opacity-50 cursor-not-allowed" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            disabled={saving}
            className="neon-button px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
