import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth({ onLogin }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setFormData({ name: '', email: '', password: '' }); 
          onLogin(data.user); 
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Server connection failed. Is the backend running?");
      }
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
        });
        
        const data = await response.json();
        
        if (response.status === 201) {
          const userOtp = window.prompt("Account created! Enter the 6-digit code sent to " + formData.email);
          
          if (userOtp) {
            const verifyRes = await fetch('http://localhost:5000/api/auth/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: formData.email, otp: userOtp })
            });
            
            if (verifyRes.ok) {
              // Seamless switch to Login without the annoying alert
              setFormData({ name: '', email: '', password: '' });
              setIsLogin(true);
            } else {
              alert("Invalid Verification Code.");
            }
          }
        } else if (data.message === "User already exists") {
          // Seamless switch if they already have an account
          setFormData({ name: '', email: '', password: '' });
          setIsLogin(true);
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Registration failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000')] bg-cover bg-center flex items-center justify-center p-4 font-sans relative">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md -z-10"></div>
      <div className="max-w-md w-full bg-white/80 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 mb-2">TaskFlow</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Productivity Reimagined</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-black uppercase mb-2">Full Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 bg-white/50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-black uppercase mb-2">Email Address</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3.5 bg-white/50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-black uppercase mb-2">Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-5 py-3.5 bg-white/50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl transition-all uppercase text-xs tracking-widest">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        <button onClick={() => { setIsLogin(!isLogin); setFormData({ name: '', email: '', password: '' }); }} className="w-full mt-8 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
          {isLogin ? "Need an account? Sign up" : "Already registered? Sign in"}
        </button>
      </div>
    </div>
  );
}