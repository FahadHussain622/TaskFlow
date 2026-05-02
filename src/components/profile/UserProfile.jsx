import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, User, Lock, Trash2,
  Check, Eye, EyeOff, AlertTriangle, Save,
  Mail, ShieldCheck, LayoutDashboard, ListTodo,
} from 'lucide-react';

const API = 'http://localhost:5000';

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function countTasks(boardData) {
  let total = 0;
  Object.values(boardData).forEach(lists =>
    lists.forEach(list => { total += list.cards.length; })
  );
  return total;
}

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
      {children}
    </label>
  );
}

function TextInput({ value, onChange, type = 'text', placeholder, disabled, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-11' : 'pl-5'} pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl
                    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all
                    font-bold text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
  );
}

function SaveToast({ show }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50
                    bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest
                    px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
      <Check size={14} className="text-emerald-400" /> Saved successfully
    </div>
  );
}

function PersonalInfoTab({ user, onSave }) {
  const [name,  setName]  = useState(user.name  || '');
  const [email, setEmail] = useState(user.email || '');
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setName(user.name  || ''); }, [user.name]);
  useEffect(() => { setEmail(user.email || ''); }, [user.email]);

  const handleChange = setter => e => {
    setter(e.target.value);
    setDirty(true);
    setError('');
  };

  const handleSave = async () => {
    if (!name.trim())  return setError('Name cannot be empty.');
    if (!email.trim()) return setError('Email cannot be empty.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email.');

    setSaving(true);
    try {
      await onSave({ name: name.trim(), email: email.trim() });
      setDirty(false);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Full Name</FieldLabel>
        <TextInput value={name} onChange={handleChange(setName)} placeholder="Your name" icon={User} />
      </div>
      <div>
        <FieldLabel>Email Address</FieldLabel>
        <TextInput value={email} onChange={handleChange(setEmail)} placeholder="you@example.com" type="email" icon={Mail} />
      </div>

      {error && <p className="text-[11px] font-bold text-rose-500 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>}

      <button
        onClick={handleSave}
        disabled={!dirty || saving}
        className="flex items-center gap-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest
                   px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
      </button>

      <SaveToast show={toast} />
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all
                     font-bold text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-medium"
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-slate-100'}`} />
        ))}
      </div>
      {score > 0 && (
        <span className={`text-[9px] font-black uppercase tracking-widest ${score <= 1 ? 'text-rose-400' : score === 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
          {labels[score]}
        </span>
      )}
    </div>
  );
}

function SecurityTab({ onPasswordChange }) {
  const [current, setCurrent]   = useState('');
  const [next,    setNext]      = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error,   setError]     = useState('');
  const [toast,   setToast]     = useState(false);
  const [saving,  setSaving]    = useState(false);

  const handleSave = async () => {
    setError('');
    if (!current)         return setError('Please enter your current password.');
    if (next.length < 6)  return setError('New password must be at least 6 characters.');
    if (next !== confirm)  return setError('Passwords do not match.');
    if (next === current)  return setError('New password must differ from the current one.');

    setSaving(true);
    try {
      await onPasswordChange(current, next);
      setCurrent(''); setNext(''); setConfirm('');
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-2">
        <ShieldCheck size={18} className="text-indigo-500 flex-shrink-0" />
        <p className="text-[11px] font-bold text-indigo-600 leading-relaxed">
          Use a strong, unique password. We recommend at least 8 characters
          including uppercase letters, numbers, and symbols.
        </p>
      </div>

      <PasswordField label="Current Password"     value={current} onChange={e => { setCurrent(e.target.value);  setError(''); }} placeholder="••••••••" />
      <div>
        <PasswordField label="New Password"       value={next}    onChange={e => { setNext(e.target.value);    setError(''); }} placeholder="••••••••" />
        <StrengthBar password={next} />
      </div>
      <PasswordField label="Confirm New Password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} placeholder="••••••••" />

      {error && <p className="text-[11px] font-bold text-rose-500 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest
                   px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Lock size={14} /> {saving ? 'Updating…' : 'Update Password'}
      </button>

      <SaveToast show={toast} />
    </div>
  );
}

function DangerZoneTab({ onDeleteAccount }) {
  const [step,   setStep]   = useState('idle');
  const [typed,  setTyped]  = useState('');
  const [busy,   setBusy]   = useState(false);
  const CONFIRM_PHRASE = 'delete my account';
  const canDelete = typed.toLowerCase() === CONFIRM_PHRASE;

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDeleteAccount();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex gap-4">
        <AlertTriangle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-black text-rose-700 uppercase tracking-widest mb-1">Permanent Action</p>
          <p className="text-xs font-medium text-rose-500 leading-relaxed">
            Deleting your account will permanently remove all your boards, lists,
            and task cards from the database. This action cannot be undone.
          </p>
        </div>
      </div>

      {step === 'idle' && (
        <button
          onClick={() => setStep('confirm')}
          className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200
                     text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl
                     hover:bg-rose-100 hover:border-rose-300 transition-all"
        >
          <Trash2 size={14} /> Delete My Account
        </button>
      )}

      {step === 'confirm' && (
        <div className="space-y-4 bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            To confirm, type{' '}
            <span className="font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">
              {CONFIRM_PHRASE}
            </span>{' '}
            below:
          </p>
          <input
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            autoFocus
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl
                       focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all
                       font-bold text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-medium"
          />
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={!canDelete || busy}
              className="flex items-center gap-2 bg-rose-600 text-white text-[10px] font-black
                         uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-rose-700 transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
            >
              <Trash2 size={14} /> {busy ? 'Deleting…' : 'Confirm Delete'}
            </button>
            <button
              onClick={() => { setStep('idle'); setTyped(''); }}
              className="text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl
                         bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: 'info',     label: 'Personal Info', icon: User  },
  { id: 'security', label: 'Security',      icon: Lock  },
  { id: 'danger',   label: 'Danger Zone',   icon: Trash2 },
];

export default function UserProfile({ user, setUser, boards, boardData, onLogout }) {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [avatarSrc, setAvatarSrc] = useState(user.avatar || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/users/me`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => {
        if (!data._id) return;
        const avatarUrl = data.avatar
          ? (data.avatar.startsWith('http') ? data.avatar : `${API}/${data.avatar}`)
          : null;
        setAvatarSrc(avatarUrl);
        setUser(u => ({ ...u, name: data.name, email: data.email, avatar: avatarUrl }));
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, name: data.name, email: data.email, avatar: avatarUrl }));
      })
      .catch(console.error);
  }, []);

  const handleSaveInfo = async ({ name, email }) => {
    const res  = await fetch(`${API}/api/users/me`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body:    JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Update failed');

    setUser(u => ({ ...u, name: data.name, email: data.email }));
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...stored, name: data.name, email: data.email }));
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    const res  = await fetch(`${API}/api/users/password`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body:    JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Password change failed');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = ev => setAvatarSrc(ev.target.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res  = await fetch(`${API}/api/users/avatar`, {
        method:  'POST',
        headers: authHeader(),
        body:    formData,
      });
      const data = await res.json();
      if (res.ok && data.avatar) {
        const avatarUrl = data.avatar.startsWith('http')
          ? data.avatar
          : `${API}/${data.avatar}`;
        setAvatarSrc(avatarUrl);
        setUser(u => ({ ...u, avatar: avatarUrl }));
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, avatar: avatarUrl }));
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch(`${API}/api/users/me`, {
        method:  'DELETE',
        headers: authHeader(),
      });
    } catch (err) {
      console.error('Delete account error:', err);
    }
    onLogout();
  };

  const totalBoards = boards.length;
  const totalTasks  = countTasks(boardData);
  const stats = [
    { label: 'Boards',      value: totalBoards, icon: LayoutDashboard },
    { label: 'Total Tasks', value: totalTasks,  icon: ListTodo        },
  ];

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000')] bg-cover bg-center bg-fixed font-sans relative">
      <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[2px] -z-10" />

      <div className="max-w-5xl mx-auto px-6 py-8">

        <header className="flex items-center gap-4 mb-8 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-sm">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-slate-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">My Profile</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Settings</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

          <div className="space-y-5">

            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-lg p-8 text-center">

              <div className="relative inline-block mb-5">
                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-indigo-600 flex items-center justify-center shadow-xl ring-4 ring-white">
                  {avatarSrc
                    ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-3xl font-black text-white">{initials(user.name)}</span>
                  }
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg
                             hover:bg-indigo-700 transition-all ring-2 ring-white"
                  title="Upload profile picture"
                >
                  <Camera size={13} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <p className="text-lg font-black text-slate-800 mb-1 leading-tight">{user.name}</p>
              <p className="text-xs font-medium text-slate-400 mb-6">{user.email}</p>

              <div className="flex justify-center gap-3">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex-1 bg-slate-50 rounded-2xl p-3 text-center">
                    <Icon size={14} className="text-indigo-400 mx-auto mb-1" />
                    <p className="text-xl font-black text-slate-800 leading-none">{value}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <nav className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-lg p-3 space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all
                    ${activeTab === id
                      ? id === 'danger'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-indigo-600 text-white shadow-md'
                      : id === 'danger'
                        ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-lg p-10">

            <div className="mb-8 pb-6 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                {activeTab === 'info'     && 'Personal Information'}
                {activeTab === 'security' && 'Change Password'}
                {activeTab === 'danger'   && 'Danger Zone'}
              </h2>
              <p className="text-xs font-medium text-slate-400">
                {activeTab === 'info'     && 'Update your name and email address.'}
                {activeTab === 'security' && 'Keep your account secure with a strong password.'}
                {activeTab === 'danger'   && 'These actions are permanent and cannot be reversed.'}
              </p>
            </div>

            {activeTab === 'info'     && <PersonalInfoTab user={user} onSave={handleSaveInfo} />}
            {activeTab === 'security' && <SecurityTab onPasswordChange={handlePasswordChange} />}
            {activeTab === 'danger'   && <DangerZoneTab onDeleteAccount={handleDeleteAccount} />}
          </div>
        </div>
      </div>
    </div>
  );
}