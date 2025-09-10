import { User } from "../models/userModel.js";
import { Meeting } from "../models/meetingModel.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Provide user name and password" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      user.save();
      return res.status(httpStatus.OK).json({ token });
    } else {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid Username or password" });
    }
  } catch (e) {
    res.status(400).json({ message: "something went wrong" });
  }
};

const register = async (req, res) => {
  let { username, password, name } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "user already exist" });
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      password: hashedPass,
      name: name,
    });
    await newUser.save();
    res.status(httpStatus.CREATED).json({ message: "new user created" });
  } catch (e) {
    res.json({ message: `something went wrong ${e}` });
  }
};
const getUserHistory = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token: token });
    const meetings = await Meeting.find({ user_id: user.username });
    res.json(meetings);
  } catch (e) {
    res.json(`something Wrong ${e}`);
  }
};
const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;
  try {
    const user = await User.findOne({ token: token });
    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meeting_code,
    });
    await newMeeting.save();
    res.status(httpStatus.CREATED).json({ message: "Added to History" });
  } catch (e) {
    res.json(`something Wrong ${e}`);
  }
};

export { register, login, addToHistory, getUserHistory };
