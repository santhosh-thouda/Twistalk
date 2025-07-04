import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ✅ Get All Users
export const getAllUsers = async (req, res) => {
  try {
    let users = await UserModel.find();
    users = users.map((user) => {
      const { password, ...otherDetails } = user._doc;
      return otherDetails;
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

// ✅ Get a Single User
export const getUser = async (req, res) => {
  const id = req.params.id;
  const requesterId = req.user?.id || req.body?._id;

  try {
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json("Invalid user!");

    // If profile is private and requester is not self or follower
    if (user.isPrivate && requesterId !== id && !user.followers.includes(requesterId)) {
      const { password, email, isAdmin, ...publicDetails } = user._doc;
      return res.status(200).json({
        ...publicDetails,
        isPrivate: true,
        private: true,
        message: 'This profile is private.',
      });
    }

    const { password, ...otherDetails } = user._doc;
    res.status(200).json(otherDetails);
  } catch (error) {
    res.status(500).json(error);
  }
};

// ✅ Update User
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { _id, password } = req.body;

  if (id !== _id) return res.status(403).json("Access Denied!");

  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(password.toString(), salt);
    }

    const user = await UserModel.findByIdAndUpdate(id, req.body, { new: true });
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY);

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json(error);
  }
};

// ✅ Delete User
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { _id, currentUserAdminStatus } = req.body;

  if (_id !== id && !currentUserAdminStatus) {
    return res.status(403).json("Access Denied!");
  }

  try {
    await UserModel.findByIdAndDelete(id);
    res.status(200).json("User deleted successfully");
  } catch (error) {
    res.status(500).json(error);
  }
};

// ✅ Follow User (fixes follower sync issue)
export const followUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;

  if (_id === id) return res.status(403).json("Action forbidden");

  try {
    const followUser = await UserModel.findById(id);
    const followingUser = await UserModel.findById(_id);

    if (!followUser.followers.includes(_id)) {
      await followUser.updateOne({ $push: { followers: _id } });
      await followingUser.updateOne({ $push: { following: id } });

      const io = req.app.get('io');
      if (io) {
        io.emit('followers-updated', { userId: id, type: 'follow' });
        io.emit('followers-updated', { userId: _id, type: 'follow' });

        const sender = await UserModel.findById(_id);
        io.to(id.toString()).emit('notification', {
          type: 'follow',
          from: _id,
          fromName: `${sender.firstname} ${sender.lastname}`,
          fromAvatar: sender.profilePicture,
          message: 'started following you.',
        });
      }

      res.status(200).json("User Followed!");
    } else {
      res.status(403).json("Already following");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// ✅ Unfollow User
export const UnFollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;

  if (_id === id) return res.status(403).json("Action forbidden");

  try {
    const followUser = await UserModel.findById(id);
    const followingUser = await UserModel.findById(_id);

    if (followUser.followers.includes(_id)) {
      await followUser.updateOne({ $pull: { followers: _id } });
      await followingUser.updateOne({ $pull: { following: id } });

      const io = req.app.get('io');
      if (io) {
        io.emit('followers-updated', { userId: id, type: 'unfollow' });
        io.emit('followers-updated', { userId: _id, type: 'unfollow' });
      }

      res.status(200).json("User Unfollowed!");
    } else {
      res.status(403).json("You do not follow this user");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
