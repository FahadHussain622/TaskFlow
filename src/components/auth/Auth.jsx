import React, { useState } from 'react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      onLogin({ name: isLogin ? 'Fahad' : formData.name, email: formData.email });
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000')] bg-cover bg-center flex items-center justify-center p-4 font-sans relative">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md -z-10"></div>
      
      <div className="max-w-md w-full bg-white/80 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 tracking-tight mb-2">TaskFlow</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Productivity Reimagined</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">Full Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 bg-white/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">Email Address</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3.5 bg-white/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-5 py-3.5 bg-white/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl transition-all uppercase text-xs tracking-widest">
            {isLogin ? 'Enter Workspace' : 'Create Account'}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-8 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
          {isLogin ? "Need an account? Sign up" : "Already registered? Sign in"}
        </button>
      </div>
    </div>
  );
}