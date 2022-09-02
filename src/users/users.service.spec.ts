import { ENVERONMENTS } from '../enveronments';

const CryptoJS = require('crypto-js')

function dectyptAndHash(encrypt: string, secretKey: string): string {
    try {
        const passwordStr = CryptoJS.AES.decrypt(encrypt, secretKey + ENVERONMENTS.passkey).toString(CryptoJS.enc.Utf8)
        console.log('passwordStr: ', passwordStr)
        return CryptoJS.HmacSHA1(secretKey, passwordStr).toString()
    }
    catch {
        return ''
    }
}

describe('UsersService', () => {


    it('UsersService dectyptAndHash', () => {
        const c = CryptoJS.AES.encrypt('Hello', '1234')
        expect(CryptoJS.AES.decrypt(c, '123')?.toString(CryptoJS.enc.Utf8)).toBe('Hello')
    }) 
});
