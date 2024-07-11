const JWT = require("jsonwebtoken");
const userModel = require("../model/userModel");

//Protected Routes token base
const requireSignIn = async (req:any, res:any, next:any) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    
    next();
  } catch (error) {
    console.log(error);
  }
};
//admin acceess
const isAdmin = async (req:any, res:any, next:any) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (user.role !== 0 || user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
};
module.exports = {
  requireSignIn,
  isAdmin,
};