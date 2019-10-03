const mongoose = require('mongoose');
Schema = mongoose.Schema;

let userSchema = new Schema({

    userId: {
        type: String,
        unique: true,
        index: true,
        default: ''
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: 'password'
    },
    email: {
        type: String,
        default: '',
        unique: true
    },
    mobileNumber: {
        type: Number,
        default: 0
    },
    imageName: {
        type: String,
        default:''
    },
    imagePath: { 
        type: String, 
        default: '' 
    },
    createdOn: {
        type: Date,
        default: ""
    }

})

mongoose.model('User', userSchema);