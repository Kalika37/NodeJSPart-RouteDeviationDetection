const User = require("../db/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const readline = require("readline");


// Create exactly ONE interface for the entire lifecycle
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// A flag to turn password masking on or off
let isPasswordMode = false;

// Override the single interface's output method
rl._writeToOutput = function _writeToOutput(stringToWrite) {
    if (!isPasswordMode) {
        rl.output.write(stringToWrite);
        return;
    }

    // Pass newlines through normally so hitting 'Enter' works
    if (stringToWrite === '\r\n' || stringToWrite === '\n' || stringToWrite === '\r') {
        rl.output.write(stringToWrite);
        return;
    }

    // \x1B[2K erases the entire current line
    // \x1B[200D moves the cursor completely to the left
    // then we reprint the prompt + the correct number of asterisks
    rl.output.write("\x1B[2K\x1B[200D" + rl.query + "*".repeat(rl.line.length));
};


// Standard text question
function closeInterface() {
    rl.close();
}

// Secure password question
function ask(question, mask = false) {
    return new Promise((resolve) => {
        isPasswordMode = mask; // Turn on masking
        rl.query = question;
        rl.question(question, (psw) => {
            isPasswordMode = false; // Turn off masking right after entry
            resolve(psw);
        });
    });
}





class Validator {
    isValidEmail(email) {
        const regex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }
    validatePassword = (password, userData) => {
        // Strong password regex
        const strongPassword =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

        if (!strongPassword.test(password)) {
            return {
                valid: false,
                field: "password",
                message:
                    "Password must contain at least 8 characters, uppercase, lowercase, number, and special character.",
            };
        }

        const passwordLower = password.toLowerCase();

        const forbiddenValues = [
            userData.name,
            userData.email?.split("@")[0], // email username
            userData.phone,
            userData.bio,
        ];

        for (const value of forbiddenValues) {
            if (!value) continue;

            const normalizedValue = value.toLowerCase().trim();

            if (
                passwordLower.includes(normalizedValue) ||
                normalizedValue.includes(passwordLower)
            ) {
                return {
                    valid: false,
                    field: "password",
                    message:
                        "Password must not contain your personal information such as name, email, phone, or bio.",
                };
            }
        }

        return {
            valid: true,
        };
    };
    validateAndFormatNepaliPhone(phone) {
        let cleaned = phone.replace(/[\s-]/g, "");

        if (!/^(?:\+977)?(98|97|96|95|94|90)\d{8}$/.test(cleaned)) {
            return { valid: false };
        }

        // normalize to local format
        if (cleaned.startsWith("+977")) {
            cleaned = cleaned.replace("+977", "");
        }

        return {
            valid: true,
            local: cleaned,
            international: "+977" + cleaned
        };
    }
}



class AdminManager {
    Validator = new Validator()
    RESET = "\x1b[0m";
    RED = "\x1b[31m";
    GREEN = "\x1b[32m";
    YELLOW = "\x1b[33m";
    constructor(constraint) {
        this.Command = constraint[3]


    }
    async init() {
        switch (this.Command) {
            case "createsuperuser":
                await this.GenerateAdminUser()
                break
            default:
                console.log("invalid command")
                break

        }
    }
    async GenerateAdminUser() {
        const user = await this.RegisterUser()
        console.log(user)
        if (!user) return
        user.adminAccess = true
        await user.save()
    }
    async UserName() {
        const input = await ask("UserName: ")
        if (input.trim().length < 3) {
            console.log(this.RED, "Length must greater or equal to 3 character.", this.RESET)
            return this.UserName()
        }
        return input
    }
    async Email() {
        const email = await ask("Email: ")

        if (!this.Validator.isValidEmail(email)) {
            console.log(this.RED, "Invalid Email..", this.RESET)
            return this.Email()
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log(this.YELLOW, 'Email already registered', this.RESET)
            return this.Email()
        }
        return email
    }
    async Phone() {
        const phone = await ask("Phone: ")
        const validphone = this.Validator.validateAndFormatNepaliPhone(phone)
        if (!validphone.valid) {
            console.log(this.RED, "Invalid phone..", this.RESET)
            return this.Phone()
        }
        const existingUser = await User.findOne({ phone: validphone.local });
        if (existingUser) {
            console.log(this.YELLOW, 'Phone already registered', this.RESET)
            return this.Phone()
        }
        return validphone.local
    }
    async getPassword(user) {
        const password = await ask("Password: ", true)
        const validatePassword = this.Validator.validatePassword(password, user)
        if (!validatePassword.valid) {
            console.log(this.YELLOW, validatePassword.message, this.RESET)
            return this.getPassword(user)
        }
        return password
    }
    async RegisterUser() {
        console.log(this.GREEN, `Fill Form To Register User`, this.RESET)
        const name = await this.UserName()
        const email = await this.Email()
        const phone = await this.Phone()
        const bio = await ask("Bio: ")
        const password = await this.getPassword({
            name,
            email,
            phone,
            bio
        })
        console.log(name, email, phone, bio, password)
        rl.close()
        let devices = [];
        // Validation
        if (!name || !email || !password) {
            consosle.log("All fields are required")
            return
        }

        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('Email already registered')
            return
        }
        const existingUserwithPhone = await User.findOne({ phone });

        if (existingUserwithPhone) {
            console.log('Number already registered')
            return
        }
        const validation = this.Validator.validatePassword(password, {
            name,
            email,
            phone,
            bio,
        });

        if (!validation.valid) {
            console.log(validation.message)
            return
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const uid = crypto.randomUUID();
        console.log(password)
        const user = await User.create({
            uid,
            name,
            email,
            phone,
            bio,
            password: hashedPassword,
 
        });
        return user
    }
    getUserConstraints() {

    }
}

module.exports = { AdminManager, closeInterface }