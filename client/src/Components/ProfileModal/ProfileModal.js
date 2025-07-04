import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { uploadImage } from '../../actions/UploadAction';
import { updateUser } from '../../actions/UserAction';
import './ProfileModal.css';

function ProfileModal({ modalOpened, setModalOpened, data }) {
  const { password, ...other } = data;
  const [formData, setFormData] = useState(other);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const param = useParams();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  }

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      event.target.name === "profileImage"
        ? setProfileImage(img)
        : setCoverImage(img);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let UserData = formData;
    try {
      if (profileImage) {
        const data = new FormData();
        data.append("file", profileImage);
        const uploadRes = await dispatch(uploadImage(data));
        if (uploadRes && uploadRes.url) {
          UserData.profilePicture = uploadRes.url;
        }
      }
      if (coverImage) {
        const data = new FormData();
        data.append("file", coverImage);
        const uploadRes = await dispatch(uploadImage(data));
        if (uploadRes && uploadRes.url) {
          UserData.coverPicture = uploadRes.url;
        }
      }
      await dispatch(updateUser(param.id, UserData));
      setModalOpened(false);
    } catch (error) {
      console.log('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!modalOpened) return null;

  return (
    <div className="profile-modal-overlay" onClick={() => setModalOpened(false)}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3>Update Your Profile</h3>
          <button 
            className="profile-modal-close" 
            onClick={() => setModalOpened(false)}
          >
            ✕
          </button>
        </div>

        <form className='infoForm' onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Personal Information</h4>
            <div className="input-group">
              <input 
                type="text" 
                placeholder='First Name' 
                className='infoInput' 
                name="firstname"
                onChange={handleChange} 
                value={formData.firstname || ''} 
              />
              <input 
                type="text" 
                placeholder='Last Name' 
                className='infoInput' 
                name="lastname"
                onChange={handleChange} 
                value={formData.lastname || ''} 
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Professional Information</h4>
            <div className="input-group">
              <input 
                type="text" 
                placeholder='Works At' 
                className='infoInput' 
                name="worksAt"
                onChange={handleChange} 
                value={formData.worksAt || ''} 
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Location</h4>
            <div className="input-group">
              <input 
                type="text" 
                placeholder='Lives in' 
                className='infoInput' 
                name="livesin"
                onChange={handleChange} 
                value={formData.livesin || ''} 
              />
              <input 
                type="text" 
                placeholder='Country' 
                className='infoInput' 
                name="country"
                onChange={handleChange} 
                value={formData.country || ''} 
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Personal Details</h4>
            <div className="input-group">
              <input 
                type="text" 
                placeholder='Relationship Status' 
                className='infoInput' 
                name="relationship"
                onChange={handleChange} 
                value={formData.relationship || ''} 
              />
            </div>
            <div className="input-group">
              <textarea 
                placeholder='About yourself...' 
                className='infoInput' 
                name="about"
                onChange={handleChange} 
                value={formData.about || ''} 
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Privacy</h4>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={!!formData.isPrivate}
                  onChange={handleChange}
                />
                Private Profile (only followers can see your posts and details)
              </label>
            </div>
          </div>

          <div className="form-section">
            <h4>Profile Images</h4>
            <div className="image-upload-group">
              <div className="image-upload">
                <label>Profile Image</label>
                <input 
                  type="file" 
                  name='profileImage' 
                  onChange={onImageChange}
                  accept="image/*"
                />
                {profileImage && (
                  <div className="image-preview">
                    <img src={URL.createObjectURL(profileImage)} alt="Profile preview" />
                  </div>
                )}
              </div>
              <div className="image-upload">
                <label>Cover Image</label>
                <input 
                  type="file" 
                  name='coverImage' 
                  onChange={onImageChange}
                  accept="image/*"
                />
                {coverImage && (
                  <div className="image-preview">
                    <img src={URL.createObjectURL(coverImage)} alt="Cover preview" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className='button cancel-button' 
              onClick={() => setModalOpened(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className='button infoButton' 
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal; 