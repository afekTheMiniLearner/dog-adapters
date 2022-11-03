import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phoneNumber: { type: String },
        fullName: { type: String, default: 'Anonymous' },
        isAdmin: { type: Boolean, default: false },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10); // 10 = saltRounds
        const plaintextPassword = this.password;
        const hashed = bcrypt.hashSync(plaintextPassword, salt);

        this.password = hashed;
    }
    done();
});

/* userSchema.pre('findOneAndUpdate', async function (done) {
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10); // 10 = saltRounds
        const plaintextPassword = this.password;
        const hashed = bcrypt.hashSync(plaintextPassword, salt);

        this.password = hashed;
    }
    done();
}); */

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

userSchema.index({ username: 1 });

export const UserModel = mongoose.model('users', userSchema);
