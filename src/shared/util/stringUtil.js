// @flow
export function isNullOrEmpty(value?: string): boolean {
    return value == null || value.length == 0
}

export function hexToBuffer(hexString: string): Buffer {
    return Buffer.from(hexString, "hex")
}

export function bufferToHex(src: Buffer): string {
    return src.toString('hex')
}