const {
  VerifyRefreshToken,
  setAccessToken,
  setRefreshToken,
} = require("../utils/functions");
const createError = require("http-errors");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const {
  validateSignupSchema,
  validateSigninSchema,
  validateUpdateProfileSchema,
} = require("../validators/auth.schema");
const bcrypt = require("bcrypt");
const UserModel = require("../models/user.models");

const checkUserExist = async (email) => {
  return await UserModel.findOne({ email });
};

const signup = async (req, res) => {
  await validateSignupSchema(req.body);
  const { name, email, password } = req.body;

  const existedUser = await checkUserExist(email);
  if (existedUser)
    throw createError.BadRequest("کاربری با این ایمیل وجود دارد");

  const salt = await bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hashSync(password, salt);

  const user = await UserModel.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
  });

  await setAccessToken(res, user);
  await setRefreshToken(res, user);

  return res.status(HttpStatus.OK).json({
    statusCode: HttpStatus.OK,
    data: { message: "ثبت نام با موفقیت انجام شد", user },
  });
};

const signin = async (req, res) => {
  await validateSigninSchema(req.body);
  const { email, password } = req.body;

  const user = await checkUserExist(email.toLowerCase());
  if (!user) throw createError.BadRequest("کاربری با این ایمیل وجود ندارد");

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) throw createError.BadRequest("ایمیل یا رمز عبور اشتباه است");

  await setAccessToken(res, user);
  await setRefreshToken(res, user);

  return res.status(HttpStatus.OK).json({
    statusCode: HttpStatus.OK,
    data: { message: "ورود با موفقیت انجام شد", user },
  });
};

const updateProfile = async (req, res) => {
  const { _id: userId } = req.user;
  await validateUpdateProfileSchema(req.body);
  const { name, email } = req.body;

  const updateResult = await UserModel.updateOne(
    { _id: userId },
    { $set: { name, email } }
  );
  if (!updateResult.modifiedCount)
    throw createError.BadRequest("اطلاعات ویرایش نشد");

  return res.status(HttpStatus.OK).json({
    statusCode: HttpStatus.OK,
    data: { message: "اطلاعات با موفقیت آپدیت شد" },
  });
};

const getUserProfile = async (req, res) => {
  const { _id: userId } = req.user;
  const user = await UserModel.findById(userId, { otp: 0 });

  return res.status(HttpStatus.OK).json({
    statusCode: HttpStatus.OK,
    data: { user },
  });
};

const refreshToken = async (req, res) => {
  const userId = await VerifyRefreshToken(req);
  const user = await UserModel.findById(userId);
  await setAccessToken(res, user);
  await setRefreshToken(res, user);

  return res.status(HttpStatus.OK).json({
    statusCode: HttpStatus.OK,
    data: { user },
  });
};

const logout = (req, res) => {
  const cookieOptions = {
    maxAge: 1,
    expires: Date.now(),
    httpOnly: true,
    signed: true,
    sameSite: "Lax",
    secure: true,
    path: "/",
    domain: process.env.DOMAIN,
  };
  res.cookie("accessToken", null, cookieOptions);
  res.cookie("refreshToken", null, cookieOptions);

  return res.status(HttpStatus.OK).json({
    statusCode: HttpStatus.OK,
    auth: false,
  });
};

module.exports = {
  signup,
  signin,
  updateProfile,
  getUserProfile,
  refreshToken,
  logout,
};
