const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: [true, 'email already exist'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    phote: String,
    role: {
        type: String,
        enum : ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(pass){
                return pass === this.password
            },
            message: 'Password are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
})



userSchema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password, 8);
    this.passwordConfirm = undefined;
    next();
})

userSchema.post('save', function(doc, next){
    next();
})

userSchema.methods.passwordChangedAfter = function(JWTTimestamp){
    // this.passwordChangedAt < JWTTimestamp 
    if(this.passwordChangedAt){
        const ChngedTimestamp = this.passwordChangedAt.getTime() / 1000;
        // console.log(ChngedTimestamp, JWTTimestamp)
        return ChngedTimestamp > JWTTimestamp;
    }
    // if user not changed password yet!
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 1000 * 60 * 10;
    //console.log(Date.now(), (this.passwordResetExpires).getTime())
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;