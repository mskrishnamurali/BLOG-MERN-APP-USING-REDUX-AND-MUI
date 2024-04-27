const userModel = require('../models/userModel');
const bcrypt = require('bcrypt')

exports.registerController = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send({
                success: false,
                message: `Please fill all fields`
            });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(401).send({
                success: false,
                message: `User already exists`
            });
        }
        const hashedPassword=await bcrypt.hash(password,10)


        const user = new userModel({ username, email, password:hashedPassword });
        await user.save();

        return res.status(201).send({
            success: true,
            message: 'New User Created',
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: `Error in register callback`,
            success: false,
            error
        });
    }
};

exports.getAllUsers = async(req, res) => {
try{
    const users = await userModel.find({})
    return res.status(200).send({
        userCount:users.lenght,
        success:true,
        message:'all users data',
        users,
    })

}catch(error){
console.log(error)
return res.status(500).send({
    success:false,
    message:'Error in Get All Users',
    error
})
}
}

exports.loginController = async(req, res) => {
    try{
          const {email,password}=req.body
          if (!email || !password){
            return res.status(401).send({
                success:false,
                message:'Please provide email or password'
            })
          }
          const user = await userModel.findOne({email})
          if(!user){
            return res.status(200).send({
                success:false,
                message:'email is not registered'
            })
          }
          const isMatch = await bcrypt.compare(password,user.password)
          if(!isMatch){
            return res.status(401).send({
                success:false,
                message:'invalid username or password'
            })
          }
          return res.status(200).send({
            success:true,
            message:"login successfully",
            user
          })
    } catch(error){
        console.log(error)
        return res.status(500).send({
            success:false,
            message:'Error In Login Callback',
            error
        })
    }
};

