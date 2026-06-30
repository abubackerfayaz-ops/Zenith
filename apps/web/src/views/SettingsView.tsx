import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, X, User } from 'lucide-react';
import api from '../lib/api';
import { uploadImage } from '../lib/upload';
import { useAuth } from '../lib/auth-context';

interface SettingsViewProps {
  onBack?: () => void;
}

export default function SettingsView({ onBack }: SettingsViewProps) {
  const { user: authUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authUser) return;
    setDisplayName(authUser.displayName || '');
    setBio(authUser.bio || '');
    setProfilePicture(authUser.profilePicture || '');
    setCoverImage(authUser.coverImage || '');
  }, [authUser]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      let newPfp = profilePicture;
      let newCover = coverImage;
      if (pfpFile) newPfp = await uploadImage(pfpFile);
      if (coverFile) newCover = await uploadImage(coverFile);

      await api.patch('/users/me', {
        displayName: displayName.trim(),
        bio: bio.trim(),
        profilePicture: newPfp,
        coverImage: newCover,
      });

      if (authUser) {
        const updated = {
          ...authUser,
          displayName: displayName.trim(),
          bio: bio.trim(),
          profilePicture: newPfp,
          coverImage: newCover,
        };
        localStorage.setItem('zenith_user', JSON.stringify(updated));
      }

      setMessage('Saved successfully');
      setPfpFile(null);
      setCoverFile(null);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hidden px-5 py-5 font-body">
      <div className="flex items-center gap-3 mb-5">
        {onBack && (
          <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
        <User size={20} className="text-purple-400" />
        <h1 className="text-white text-xl font-black font-display">Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} className="max-w-md space-y-4">
        <div className="glass rounded-2xl p-4">
          <label className="text-white/50 text-xs block mb-1">Profile Picture</label>
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-purple-500/30 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {profilePicture && !pfpFile ? (
                <img src={profilePicture} className="w-full h-full object-cover" />
              ) : pfpFile ? (
                <img src={URL.createObjectURL(pfpFile)} className="w-full h-full object-cover" />
              ) : (
                (displayName || authUser?.username || '?').slice(0, 2).toUpperCase()
              )}
            </div>
            <label className="cursor-pointer text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
              <Upload size={12} />
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={e => setPfpFile(e.target.files?.[0] || null)} />
            </label>
            {(profilePicture || pfpFile) && (
              <button type="button" onClick={() => { setProfilePicture(''); setPfpFile(null); }} className="text-xs text-white/30 hover:text-red-400 transition-colors">
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <label className="text-white/50 text-xs block mb-1">Cover Image</label>
          <div className="flex items-center gap-3">
            {coverImage || coverFile ? (
              <div className="w-full h-20 rounded-xl overflow-hidden bg-[#1a1a3e]">
                <img src={coverFile ? URL.createObjectURL(coverFile) : coverImage} className="w-full h-full object-cover" />
              </div>
            ) : null}
            <label className="cursor-pointer text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
              <Upload size={12} />
              {coverImage || coverFile ? 'Change' : 'Upload cover'}
              <input type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
            </label>
            {(coverImage || coverFile) && (
              <button type="button" onClick={() => { setCoverImage(''); setCoverFile(null); }} className="text-xs text-white/30 hover:text-red-400 transition-colors">
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <label className="text-white/50 text-xs block mb-1">Display Name</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full bg-white/[.06] border border-white/[.08] rounded-xl px-3 py-2 text-white text-sm outline-none placeholder:text-white/30"
            placeholder="Your display name"
          />
        </div>

        <div className="glass rounded-2xl p-4">
          <label className="text-white/50 text-xs block mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full bg-white/[.06] border border-white/[.08] rounded-xl px-3 py-2 text-white text-sm outline-none placeholder:text-white/30 resize-none h-20"
            placeholder="Write something about yourself..."
            maxLength={160}
          />
          <div className="text-white/20 text-[10px] text-right mt-1">{bio.length}/160</div>
        </div>

        {message && (
          <p className={`text-sm text-center ${message === 'Saved successfully' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-2xl text-white font-bold text-base disabled:opacity-60 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center gap-2"
          style={{ boxShadow: '0 0 28px rgba(139,92,246,.4)' }}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </form>
    </div>
  );
}
