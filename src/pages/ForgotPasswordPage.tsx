import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Activity, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (error: any) {
      toast.error(error.code === 'auth/user-not-found' ? 'No account found with that email.' : 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 md:p-10">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <span className="font-display font-bold text-xl text-white">Stock<span className="text-[#00E5FF]">AI</span></span>
          </Link>

          {sent ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-neon-green" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm">We sent a password reset link to <strong className="text-white">{email}</strong></p>
              <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-[#00E5FF] hover:text-cyan-300">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Reset password</h1>
              <p className="text-gray-400 text-sm mb-8">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="cyber-input pl-10"
                      required
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="neon-button w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Send Reset Link'}
                </motion.button>
              </form>
              <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
