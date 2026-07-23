import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    experience_level: '',
    bio: '',
    profile_image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        experience_level: user.experience_level || 'beginner',
        bio: user.bio || '',
        profile_image: null,
      });
      if (user.profile_image) {
        setPreviewImage(user.profile_image);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profile_image: file,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('experience_level', formData.experience_level);
      data.append('bio', formData.bio);
      if (formData.profile_image) {
        data.append('profile_image', formData.profile_image);
      }

      const response = await authService.updateProfile(data);
      updateUser(response);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
    setLoading(false);
  };

  const experienceLevels = [
    { value: 'beginner', label: '🌱 Beginner - New to fish farming' },
    { value: 'intermediate', label: '🌿 Intermediate - Some experience' },
    { value: 'advanced', label: '🌳 Advanced - Experienced farmer' },
  ];

  return (
    <div className="min-h-screen bg-sea-foam p-4 mt-3 mb-5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-deep-ocean mb-6">👤 Profile Settings</h1>

        <div className="bg-white rounded-brand-lg shadow-card p-6">
          <form onSubmit={handleSubmit}>
            {/* Profile Image */}
            <div className="mb-6">
              <label className="block text-deep-ocean font-medium text-sm mb-2">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-deep-ocean/10 flex items-center justify-center text-4xl overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    '🐟'
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm text-dark-navy/60 file:mr-4 file:py-2 file:px-4 file:rounded-brand file:border-0 file:bg-deep-ocean file:text-white file:hover:bg-deep-ocean/90"
                  />
                </div>
              </div>
            </div>

            {/* First Name */}
            <div className="mb-4">
              <label className="block text-deep-ocean font-medium text-sm mb-2">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition"
                required
              />
            </div>

            {/* Last Name */}
            <div className="mb-4">
              <label className="block text-deep-ocean font-medium text-sm mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition"
                required
              />
            </div>

            {/* Email (Read Only) */}
            <div className="mb-4">
              <label className="block text-deep-ocean font-medium text-sm mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                className="w-full px-4 py-3 border border-gray-200 rounded-brand bg-gray-50 text-dark-navy/60"
                disabled
              />
              <p className="text-xs text-dark-navy/40 mt-1">
                Email cannot be changed. Contact support for assistance.
              </p>
            </div>

            {/* Experience Level */}
            <div className="mb-4">
              <label className="block text-deep-ocean font-medium text-sm mb-2">
                Experience Level
              </label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition bg-white"
              >
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-deep-ocean font-medium text-sm mb-2">
                Bio (Optional)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition resize-none"
                placeholder="Tell us about yourself and your fish farming journey..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-deep-ocean text-white py-3 px-4 rounded-brand font-medium hover:bg-deep-ocean/90 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;