const crypto = require("crypto");
var CryptoJS = require("crypto-js");
class Encrypter {
    constructor(encryptionKey) {
        this.algorithm = "aes-192-cbc";
        this.key = crypto.scryptSync(encryptionKey, "salt", 24);
    }

    encrypt(clearText) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        const encrypted = cipher.update(clearText, "utf8", "hex");
        return [
            encrypted + cipher.final("hex"),
            Buffer.from(iv).toString("hex"),
        ].join("|");
    }

    dencrypt(encryptedText) {
        var bytes = CryptoJS.AES.decrypt(encryptedText.replace(/\|\|\|/g,"+"), 'G4l01313');
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    }
}
module.exports = Encrypter