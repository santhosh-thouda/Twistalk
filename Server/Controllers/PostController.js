import postModel from '../Models/postModel.js';
import mongoose from 'mongoose';
import UserModel from "../Models/userModel.js";

// Create new post
export const createPost = async (req, res) => {
    const newPost = new postModel(req.body);

    try {
        await newPost.save();
        res.status(200).json(newPost)
    } catch (error) {
        res.status(500).json(error)
    }
}

// get a post
export const getPost = async (req, res) => {
    const id = req.params.id

    try {
        const post = await postModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

//Update a Post
export const updatePost = async (req, res) => {
    const postId = req.params.id
    const { userId } = req.body

    try {
        const post = await postModel.findById(postId)
        if (post.userId === userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("Post Updated Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// delete a post
export const deletePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
        const post = await postModel.findById(id);
        if (post.userId === userId) {
            await post.deleteOne();
            res.status(200).json("Post deleted Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// Like/Dislike a Post
export const like_dislike_Post = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;
    try {
        const post = await postModel.findById(id);
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            // Emit notification to post owner (if not self)
            if (post.userId !== userId) {
                const io = req.app.get('io');
                if (io) {
                    const sender = await UserModel.findById(userId);
                    io.to(post.userId.toString()).emit('notification', {
                        type: 'like',
                        from: userId,
                        fromName: sender.firstname + ' ' + sender.lastname,
                        fromAvatar: sender.profilePicture,
                        postId: id,
                        message: 'liked your post.'
                    });
                }
            }
            res.status(200).json("Post liked.")
        } else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("Post unliked.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// Get timeline Posts
export const timeline = async (req, res) => {
    const userId = req.params.id;
    const requesterId = req.user?.id || req.body?._id;

    try {
        const targetUser = await UserModel.findById(userId);
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        if (targetUser.isPrivate && requesterId !== userId && !targetUser.followers.includes(requesterId)) {
            return res.status(403).json({ error: 'This profile is private. Only followers can see posts.' });
        }

        const currenUserPosts = await postModel.find({ userId: userId });
        const followingUserPosts = await UserModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "following",
                    foreignField: "userId",
                    as: "followingUserPosts"
                }
            },
            {
                $project: {
                    followingUserPosts: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json(currenUserPosts.concat(...followingUserPosts[0].followingUserPosts).sort((a, b) => {
            return b.createdAt - a.createdAt;
        }));
    } catch (error) {
        res.status(500).json(error)
    }
}
