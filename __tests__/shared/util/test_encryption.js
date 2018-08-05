import { parseBool } from 'shared/util/lang';
import { bufferToHex } from 'shared/util/stringUtil';
import randomBytes from 'random-bytes';
import jsSHA from 'jssha';
import aesjs from 'aes-js';
// import pkcs7 from 'pkcs7-padding';
// import NodeRSA from 'node-rsa';
import forge from 'node-forge';

describe("Test Encryption", () => {
    
    test("Test parseBool with boolean input parameter", () => {
        // const publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCr4kdcqi+5hP0yYkpAPR9poOlPA+LOzkbvTVCbMUVJT9yFh9pATxDq4SjS2hfrhj0wtsvF5kT7l+M7LOaHsDy6BDGpcpqIqBcK0LrWYHW+gaQoIwqLemu+dyqSYrroEUI1j+N1lbc0OG+gfS3eBdgt3zXW7SJ4BBdRd43mnCiAqQIDAQAB"
        // const message = "B744B987C140F381DAC192B8DFB78C0B90913A9E2C21E7FCCAA59DAC05B71DB8"

        // const key = new NodeRSA({ ENVIRONMENT: 'browser' }) 
        // // for RSA/ECB/PKCS1Padding 
        // key.importKey(publicKey, 'pkcs8-public');
        // key.setOptions({encryptionScheme: 'pkcs1'});
        // console.log(key.encrypt(message, 'hex'))

        // const pem = "-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCnkjqf8YaeMutXMS/7UJQxubMv2Z7Pdjj3iwFsBakW6RLdo+Qw8aVeE8uVAWVnNjj0FBs3KopFT6DcucrIGK/7Y2hSjkwzdM6LUEVJYabC3+BH/74F66MAnD/4xDQv/yS8qcDUSbZTiyvgeo782g9UXcFigZe7ipRfdpLo8CHwWQIDAQAB-----END PUBLIC KEY-----"
        const pem = "-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD3ebDXPZMK+eWr1ebxusHwabqHQmY0C4zFZRR+vpNsMPvmQjcZlt2lBWPP5Sz6PyI874cMe0FN+rVpNZYQjhXtpoPDvnCQOJN+YfWH/5dfe2u91BMijWVO+HxfE1DI4pqU8deZo+OXgxH3PQazLpmuxhdKmj8gOQPaXms3EfkSKQIDAQAB-----END PUBLIC KEY-----"
        // const publicKeySrc = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCv5wu6XIq46VB4KDvzpwn2"
        // const module = ""
        // const exponent = "65537"
        // pki.rsa.setPublicKey(module, exponent)

        
        var buffer = forge.util.createBuffer('Something to encrypt', 'utf8');
        var bytes = buffer.getBytes();
        console.log(forge.util.bytesToHex(bytes)) 
        
        // encrypt data with a public key using RSAES PKCS#1 v1.5
        // const publicKey = forge.pki.rsa.setPublicKey(new Buffer(publicKeySrc).toString('base64'))
        const publicKey = forge.pki.publicKeyFromPem(pem);
        const encrypted = publicKey.encrypt(bytes, 'RSAES-PKCS1-V1_5');       
        // const encrypted = publicKey.encrypt(bytes);       
        console.log(forge.util.bytesToHex(encrypted)) 
        // console.log(publicKey.encrypt(new Buffer(message).toString('base64')))

        var md = forge.md.sha1.create();
        md.update('The quick brown fox jumps over the lazy dog');
        console.log(md.digest().toHex());        

        var md = forge.md.sha1.create();
        // buffer = Buffer.from('The quick brown fox jumps over the lazy dog').toString('binary')
        buffer = Buffer.from('54686520717569636b2062726f776e20666f78206a756d7073206f76657220746865206c617a7920646f67', 'hex').toString('binary')
        // md.update('54686520717569636b2062726f776e20666f78206a756d7073206f76657220746865206c617a7920646f67', 'hex');
        md.update(buffer);
        console.log(md.digest().toHex());        

    });

    
});