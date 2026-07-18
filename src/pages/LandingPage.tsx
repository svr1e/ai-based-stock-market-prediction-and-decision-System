import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain, TrendingUp, Shield, Zap, BarChart2, Globe, Check,
  ChevronRight, Star, ArrowRight, Activity, Lock, Bell
} from 'lucide-react';

// Floating particle component
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      style={style}
      animate={{
        y: [0, -30, 0],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration: Math.random() * 3 + 2,
        repeat: Infinity,
        delay: Math.random() * 2,
        ease: 'easeInOut',
      }}
      className="absolute rounded-full"
    />
  );
}

function HeroSection() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 4 + 1}px`,
      height: `${Math.random() * 4 + 1}px`,
      backgroundColor: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#7B2FFF' : '#00FF88',
    }
  }));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/5 via-transparent to-transparent" />
      
      {/* Glowing orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"
      />

      {/* Particles */}
      {particles.map((p, i) => <Particle key={i} style={p.style} />)}

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-8"
        >
          <Zap className="w-4 h-4" />
          <span>AI-Powered Investment Intelligence Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-6"
        >
          Predict Markets
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#7B2FFF] to-[#00E5FF] animate-glow-pulse">
            With AI Precision
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Harness the power of LSTM, GRU, XGBoost & FinBERT for real-time stock predictions, 
          sentiment analysis, and portfolio optimization. Your Bloomberg Terminal — reimagined.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="neon-button px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 min-w-[200px] justify-center"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="outline-neon-button px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2 min-w-[200px] justify-center"
            >
              View Demo
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-wrap justify-center gap-6 md:gap-12 text-center"
        >
          {[
            { value: '94.2%', label: 'Prediction Accuracy' },
            { value: '$2.4B+', label: 'Assets Analyzed' },
            { value: '50K+', label: 'Active Traders' },
            { value: '7', label: 'AI Models' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-black text-[#00E5FF] font-display">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-20 relative"
        >
          <div className="relative gradient-border p-1 rounded-2xl max-w-5xl mx-auto shadow-2xl">
            <div className="rounded-xl overflow-hidden bg-[#0A0F1E] aspect-video flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-16 h-16 text-[#00E5FF]/30 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">Live Dashboard Preview</p>
              </div>
              {/* Mini chart bars for visual effect */}
              <div className="absolute bottom-8 left-8 right-8 flex items-end gap-1 h-24 opacity-20">
                {Array.from({ length: 40 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-sm"
                    style={{ height: `${20 + Math.random() * 80}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Glow beneath */}
          <div className="absolute -bottom-8 inset-x-16 h-16 bg-cyan-500/20 blur-3xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: Brain,
      color: '#00E5FF',
      title: 'Multi-Model AI Predictions',
      desc: 'LSTM, GRU, XGBoost & Random Forest ensemble for maximum accuracy across all market conditions.',
    },
    {
      icon: BarChart2,
      color: '#7B2FFF',
      title: 'Technical Analysis Suite',
      desc: 'RSI, MACD, Bollinger Bands, VWAP, ATR, ADX and 15+ indicators with real-time updates.',
    },
    {
      icon: Globe,
      color: '#00FF88',
      title: 'Sentiment Intelligence',
      desc: 'FinBERT-powered news analysis combined with Twitter/Reddit sentiment for holistic market view.',
    },
    {
      icon: Shield,
      color: '#FF6B35',
      title: 'Risk & Crash Detection',
      desc: 'Isolation Forest anomaly detection for flash crash warnings and portfolio risk scoring.',
    },
    {
      icon: TrendingUp,
      color: '#FF0080',
      title: 'Portfolio Optimization',
      desc: 'AI-driven allocation recommendations with Sharpe ratio optimization and diversification analysis.',
    },
    {
      icon: Zap,
      color: '#00E5FF',
      title: 'Explainable AI (XAI)',
      desc: 'SHAP values reveal exactly why each prediction was made — transparent, trusted, actionable.',
    },
  ];

  return (
    <section ref={ref} id="features" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="cyber-tag mb-4 inline-block">Platform Capabilities</span>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mt-4 mb-4">
            Everything You Need to
            <span className="text-[#00E5FF]"> Trade Smarter</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Enterprise-grade AI infrastructure packed into an intuitive platform for individual and institutional traders.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const plans = [
    {
      name: 'Starter',
      price: '0',
      desc: 'Perfect for learning and paper trading',
      features: ['5 stock predictions/day', 'Basic charts', 'News sentiment', 'Watchlist (10 stocks)', 'Email support'],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '49',
      desc: 'For serious individual traders',
      features: ['Unlimited predictions', 'All AI models', 'Portfolio optimization', 'Risk analysis', 'AI chatbot', 'WebSocket live data', 'PDF/Excel export', 'Priority support'],
      cta: 'Start Pro Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: '199',
      desc: 'For funds and institutional trading',
      features: ['Everything in Pro', 'Custom AI models', 'API access', 'Admin panel', 'Multi-user accounts', 'Custom alerts', 'SLA guarantee', 'Dedicated manager'],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <section ref={ref} id="pricing" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="cyber-tag mb-4 inline-block">Pricing</span>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mt-4 mb-4">
            Simple, <span className="text-[#00E5FF]">Transparent</span> Pricing
          </h2>
          <p className="text-gray-400">Start free, scale as you grow.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-2xl p-6 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-cyan-500/10 to-purple-500/5 border-2 border-[#00E5FF]/40 shadow-neon'
                  : 'glass-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#7B2FFF] text-black text-xs font-bold">
                  Most Popular
                </div>
              )}
              <h3 className="font-display text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">${plan.price}</span>
                {plan.price !== '0' && <span className="text-gray-500 text-sm">/month</span>}
              </div>
              <Link to="/register">
                <button className={`w-full py-3 rounded-xl font-semibold text-sm mb-6 ${
                  plan.highlighted ? 'neon-button' : 'outline-neon-button'
                }`}>
                  {plan.cta}
                </button>
              </Link>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-neon-green flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const testimonials = [
    { name: 'Alex Chen', role: 'Quantitative Analyst', avatar: 'AC', text: 'StockAI\'s LSTM predictions have consistently outperformed my manual analysis. The SHAP explanations are a game-changer for understanding AI decisions.' },
    { name: 'Sarah Williams', role: 'Portfolio Manager', avatar: 'SW', text: 'The portfolio optimization alone saved our fund $200K last quarter. The risk assessment is incredibly precise and actionable.' },
    { name: 'Marcus Johnson', role: 'Retail Investor', avatar: 'MJ', text: 'Finally, institutional-grade tools accessible to individual traders. The UI is stunning and the predictions are surprisingly accurate.' },
  ];

  return (
    <section ref={ref} id="testimonials" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="cyber-tag mb-4 inline-block">Testimonials</span>
          <h2 className="font-display text-4xl font-black text-white mt-4">
            Trusted by <span className="text-[#00E5FF]">50,000+</span> Traders
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#00E5FF] text-[#00E5FF]" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold text-black">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative gradient-border rounded-3xl p-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-3xl" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
              Start Trading Smarter <span className="text-[#00E5FF]">Today</span>
            </h2>
            <p className="text-gray-400 mb-8">Join thousands of traders using AI to get an edge in the markets.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="neon-button px-8 py-4 rounded-xl font-bold flex items-center gap-2"
                >
                  Get Started Free <ChevronRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-black" />
            </div>
            <span className="font-display font-bold">
              <span className="text-white">Stock</span>
              <span className="text-[#00E5FF]">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>© 2026 StockAI. All rights reserved.</span>
            <div className="flex items-center gap-1 text-xs">
              <Lock className="w-3 h-3" />
              <span>Enterprise Security</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="#features" className="hover:text-[#00E5FF] transition">Features</a>
            <a href="#pricing" className="hover:text-[#00E5FF] transition">Pricing</a>
            <Link to="/login" className="hover:text-[#00E5FF] transition">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-[#050816] min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-black" />
            </div>
            <span className="font-display font-bold text-lg">
              <span className="text-white">Stock</span>
              <span className="text-[#00E5FF]">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="text-sm text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="neon-button text-sm px-4 py-2 rounded-lg">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
