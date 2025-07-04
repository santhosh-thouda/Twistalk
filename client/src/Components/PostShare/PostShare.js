import React, { useState, useRef } from 'react';
import './PostShare.css';
import { useDispatch, useSelector } from 'react-redux';
import { uploadImage, uploadPost } from '../../actions/UploadAction';

const PostShare = () => {
    const serverPublic = "http://localhost:5000/images/";
    const [image, setImage] = useState(null);
    const imageRef = useRef();
    const desc = useRef();
    const { user } = useSelector((state) => state.authReducer.authData);
    const dispatch = useDispatch();

    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    const reset = () => {
        setImage(null);
        desc.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (desc.current.value === "" && !image) {
            alert("Please write something or upload an image");
            return;
        }

        const newPost = {
            userId: user._id,
            desc: desc.current.value,
        };

        try {
            if (image) {
                const data = new FormData();
                const filename = Date.now() + '-' + image.name;
                data.append("file", image);
                data.append("name", filename);
                const res = await dispatch(uploadImage(data)); // ✅ wait for filename
                newPost.image = res.filename; // ✅ use response
            }

            dispatch(uploadPost(newPost));
            reset();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="PostShare">
            <img
                src={
                    user.profilePicture
                        ? serverPublic + user.profilePicture
                        : serverPublic + "defaultProfile.png"
                }
                alt=""
            />

            <div>
                <input ref={desc} type="text" placeholder="What's happening?" />

                <div className="postOptions">
                    <div
                        className="option"
                        style={{ color: "var(--photo)" }}
                        onClick={() => imageRef.current.click()}
                    >
                        📷 Photo
                    </div>
                    <div className="option" style={{ color: "var(--video)" }}>
                        ▶️ Video
                    </div>
                    <div className="option" style={{ color: "var(--location)" }}>
                        📍 Location
                    </div>
                    <div className="option" style={{ color: "var(--shedule)" }}>
                        📅 Schedule
                    </div>
                    <button className="button ps-button" onClick={handleSubmit}>
                        Share
                    </button>

                    <div style={{ display: "none" }}>
                        <input
                            type="file"
                            name="image"
                            ref={imageRef}
                            onChange={onImageChange}
                        />
                    </div>
                </div>

                {image && (
                    <div className="previewImage">
                        <span
                            onClick={() => setImage(null)}
                            style={{ cursor: 'pointer', fontSize: '20px' }}
                        >
                            ✕
                        </span>
                        <img src={URL.createObjectURL(image)} alt="preview" />
                        <div style={{ fontSize: '14px', marginTop: '6px', color: '#555' }}>
                            Caption: {desc.current?.value || "No caption"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostShare;
