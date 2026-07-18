import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Moon, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    priceAlerts: true,
    predictionUpdates: true,
    darkMode: true,
    language: 'en',
    twoFactor: false,
    publicProfile: false,
    dataSharing: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const handleSave = () => toast.success('Settings saved!');

  const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#00E5FF]' : 'bg-white/10'}`}
      style={{ height: 22, width: 40 }}
    >
      <motion.div
        animate={{ x: checked ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
        style={{ top: 3, width: 16, height: 16 }}
      />
    </button>
  );

  const Section = ({ title, icon: Icon, children }: any) => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
      <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#00E5FF]" /> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );

  const SettingRow = ({ label, desc, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm text-white font-medium">{label}</div>
        {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Customize your StockAI experience</p>
      </div>

      <Section title="Notifications" icon={Bell}>
        <SettingRow label="Push Notifications" desc="Browser & mobile alerts" checked={settings.notifications} onChange={() => toggle('notifications')} />
        <div className="border-t border-white/5" />
        <SettingRow label="Email Alerts" desc="Receive alerts via email" checked={settings.emailAlerts} onChange={() => toggle('emailAlerts')} />
        <SettingRow label="Price Alerts" desc="Notify when watchlist targets hit" checked={settings.priceAlerts} onChange={() => toggle('priceAlerts')} />
        <SettingRow label="AI Prediction Updates" desc="New prediction notifications" checked={settings.predictionUpdates} onChange={() => toggle('predictionUpdates')} />
      </Section>

      <Section title="Appearance & Language" icon={Moon}>
        <SettingRow label="Dark Mode" desc="Recommended for trading environments" checked={settings.darkMode} onChange={() => toggle('darkMode')} />
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm text-white font-medium">Language</div>
            <div className="text-xs text-gray-500 mt-0.5">Interface language</div>
          </div>
          <select
            value={settings.language}
            onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
            className="cyber-input w-36 py-1.5 text-sm"
          >
            <option value="en" style={{ background: '#0A0F1E' }}>English</option>
            <option value="es" style={{ background: '#0A0F1E' }}>Español</option>
            <option value="de" style={{ background: '#0A0F1E' }}>Deutsch</option>
            <option value="jp" style={{ background: '#0A0F1E' }}>日本語</option>
          </select>
        </div>
      </Section>

      <Section title="Security & Privacy" icon={Shield}>
        <SettingRow label="Two-Factor Authentication" desc="Extra security for your account" checked={settings.twoFactor} onChange={() => toggle('twoFactor')} />
        <div className="border-t border-white/5" />
        <SettingRow label="Public Profile" desc="Allow others to see your profile" checked={settings.publicProfile} onChange={() => toggle('publicProfile')} />
        <SettingRow label="Data Sharing" desc="Help improve AI models with anonymized data" checked={settings.dataSharing} onChange={() => toggle('dataSharing')} />
      </Section>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSave}
        className="neon-button px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
      >
        <Save className="w-4 h-4" /> Save Settings
      </motion.button>
    </div>
  );
}
