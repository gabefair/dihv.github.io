/**
 * Direct Base Conversion Encoder and Decoder
 *
 * This unified module uses a sliding window approach to convert binary data
 * directly to a base-N string and back. It avoids common byte boundary
 * issues and is optimized to prevent repetitive patterns in the output.
 */
class DirectBaseEncoder {
    constructor(safeChars) {
        if (!safeChars || typeof safeChars !== 'string' || safeChars.length === 0) {
            throw new Error('DirectBaseEncoder: Invalid safeChars parameter - must be a non-empty string');
        }
        const uniqueChars = new Set(safeChars);
        if (uniqueChars.size !== safeChars.length) {
            throw new Error('DirectBaseEncoder: safeChars contains duplicate characters');
        }
        this.SAFE_CHARS = safeChars;
        this.RADIX = safeChars.length;
        this.charToIndex = new Map();
        this.indexToChar = new Map();
        for (let i = 0; i < safeChars.length; i++) {
            this.charToIndex.set(safeChars[i], i);
            this.indexToChar.set(i, safeChars[i]);
        }
        this.BITS_PER_CHAR = Math.log2(this.RADIX);
        this.CHARS_PER_CHUNK = Math.floor(64 / this.BITS_PER_CHAR);
        this.BYTES_PER_CHUNK = Math.floor(this.CHARS_PER_CHUNK * this.BITS_PER_CHAR / 8);
        this.SMALL_DATA_THRESHOLD = (window.CONFIG?.ENCODE_SMALL_THRESHOLD) || 64;
        this.SMALL_DATA_PREFIX = this.indexToChar.get(0);

        console.log(`DirectBaseEncoder: ${this.RADIX} chars, ${this.BITS_PER_CHAR.toFixed(2)} bits/char, threshold=${this.SMALL_DATA_THRESHOLD}`);
    }

    encode(data) {
        const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
        if (bytes.length === 0) {
            return '';
        }
        if (bytes.length <= this.SMALL_DATA_THRESHOLD) {
            return this.encodeSmallOptimized(bytes);
        } else {
            return this.encodeLargeOptimized(bytes);
        }
    }

    decode(encodedStr) {
        if (!encodedStr || typeof encodedStr !== 'string') {
            throw new Error('DirectBaseEncoder: Invalid or empty encoded string provided.');
        }

        if (encodedStr.startsWith(this.SMALL_DATA_PREFIX)) {
            return this.decodeSmallOptimized(encodedStr);
        }

        const versionChar = encodedStr[0];
        const version = this.charToIndex.get(versionChar);

        if (version === undefined) {
            throw new Error('DirectBaseEncoder: Unknown encoding format or invalid version character.');
        }

        switch (version) {
            case 1:
                return this.decodeLargeOptimized(encodedStr);
            default:
                throw new Error(`DirectBaseEncoder: Unsupported format version: ${version}`);
        }
    }

    encodeSmallOptimized(bytes) {
        let value = 0n;
        for (let i = 0; i < bytes.length; i++) {
            value = (value << 8n) | BigInt(bytes[i]);
        }
        const digits = [];
        const radixBig = BigInt(this.RADIX);
        while (value > 0n) {
            const remainder = Number(value % radixBig);
            digits.push(this.indexToChar.get(remainder));
            value = value / radixBig;
        }
        const lengthEncoded = this.encodeVariableLength(bytes.length);
        const checksum = this.calculateChecksum(bytes);
        const checksumChar = this.indexToChar.get(checksum);
        return this.SMALL_DATA_PREFIX + lengthEncoded + checksumChar + digits.reverse().join('');
    }

    decodeSmallOptimized(encodedStr) {
        const { value: length, position } = this.decodeVariableLength(encodedStr, 1);
        const checksumChar = encodedStr[position];
        const expectedChecksum = this.charToIndex.get(checksumChar);
        let currentPos = position + 1;
        let value = 0n;
        const radixBig = BigInt(this.RADIX);
        for (let i = currentPos; i < encodedStr.length; i++) {
            const char = encodedStr[i];
            const digit = this.charToIndex.get(char);
            if (digit === undefined) {
                throw new Error(`Invalid character in data: ${char}`);
            }
            value = value * radixBig + BigInt(digit);
        }
        const bytes = [];
        while (value > 0n) {
            bytes.unshift(Number(value & 0xFFn));
            value >>= 8n;
        }
        const decodedData = new Uint8Array(bytes);
        if (this.calculateChecksum(decodedData) !== expectedChecksum) {
            throw new Error('Checksum mismatch, data may be corrupted.');
        }
        if (decodedData.length !== length) {
            // Pad with leading zeros if necessary
            const paddedData = new Uint8Array(length);
            paddedData.set(decodedData, length - decodedData.length);
            return paddedData;
        }
        return decodedData;
    }

    encodeLargeOptimized(bytes) {
        const encoded = [];
        const chunkSize = this.BYTES_PER_CHUNK;
        for (let offset = 0; offset < bytes.length; offset += chunkSize) {
            const chunkEnd = Math.min(offset + chunkSize, bytes.length);
            const chunk = bytes.slice(offset, chunkEnd);
            const mixed = this.mixWithEntropy(chunk, offset);
            const chunkEncoded = this.encodeChunk(mixed);
            encoded.push(chunkEncoded);
        }
        const metadata = this.encodeMetadataOptimized(bytes.length, this.calculateChecksum(bytes));
        return metadata + encoded.join('');
    }

    decodeLargeOptimized(encodedStr) {
        const { length, expectedChecksum, dataStartIndex } = this.decodeMetadataOptimized(encodedStr);
        const decodedBytes = new Uint8Array(length);
        let dataCursor = dataStartIndex;
        let byteOffset = 0;
        while (byteOffset < length) {
            const remainingBytes = length - byteOffset;
            const bytesInChunk = Math.min(this.BYTES_PER_CHUNK, remainingBytes);
            const bitsInChunk = bytesInChunk * 8;
            const charsInChunk = Math.ceil(bitsInChunk / this.BITS_PER_CHAR);
            const encodedChunk = encodedStr.substring(dataCursor, dataCursor + charsInChunk);
            dataCursor += charsInChunk;
            const mixed = this.decodeChunk(encodedChunk, bytesInChunk);
            const chunk = this.demixWithEntropy(mixed, byteOffset);
            decodedBytes.set(chunk, byteOffset);
            byteOffset += bytesInChunk;
        }
        if (this.calculateChecksum(decodedBytes) !== expectedChecksum) {
            throw new Error('Checksum validation failed. Data is likely corrupted.');
        }
        return decodedBytes;
    }

    encodeVariableLength(value) {
        const digits = [];
        let remaining = value;
        const dataRadix = this.RADIX - 1;
        const terminator = this.indexToChar.get(this.RADIX - 1);
        while (remaining >= dataRadix) {
            digits.push(this.indexToChar.get(remaining % dataRadix));
            remaining = Math.floor(remaining / dataRadix);
        }
        digits.push(this.indexToChar.get(remaining));
        digits.push(terminator);
        return digits.join('');
    }

    decodeVariableLength(encodedStr, startPosition = 0) {
        let value = 0;
        let multiplier = 1;
        let position = startPosition;
        const dataRadix = this.RADIX - 1;
        const terminatorIndex = this.RADIX - 1;
        while (position < encodedStr.length) {
            const digit = this.charToIndex.get(encodedStr[position]);
            if (digit === terminatorIndex) {
                position++;
                break;
            }
            value += digit * multiplier;
            multiplier *= dataRadix;
            position++;
        }
        return { value, position };
    }

    mixWithEntropy(chunk, position) {
        const mixed = new Uint8Array(chunk.length);
        const hash1 = this.hashPosition(position);
        const hash2 = this.hashPosition(position + 1) ^ 0xAAAAAAAA;
        for (let i = 0; i < chunk.length; i++) {
            const entropy = (hash1 >> (i % 4) * 8) ^ (hash2 >> ((i + 2) % 4) * 8);
            mixed[i] = chunk[i] ^ (entropy & 0xFF);
        }
        return mixed;
    }

    demixWithEntropy(mixedChunk, position) {
        return this.mixWithEntropy(mixedChunk, position);
    }

    hashPosition(pos) {
        let hash = pos * 0x9E3779B9;
        hash = (hash ^ (hash >> 16)) * 0x85EBCA6B;
        hash = (hash ^ (hash >> 13)) * 0xC2B2AE35;
        hash = hash ^ (hash >> 16);
        hash ^= hash << 13;
        hash ^= hash >> 17;
        hash ^= hash << 5;
        return hash >>> 0;
    }

    encodeChunk(chunk) {
        let value = 0n;
        for (let i = 0; i < chunk.length; i++) {
            value = (value << 8n) | BigInt(chunk[i]);
        }
        const bitsUsed = chunk.length * 8;
        const charsNeeded = Math.ceil(bitsUsed / this.BITS_PER_CHAR);
        const digits = [];
        const radixBig = BigInt(this.RADIX);
        for (let i = 0; i < charsNeeded; i++) {
            const remainder = Number(value % radixBig);
            digits.push(this.indexToChar.get(remainder));
            value = value / radixBig;
        }
        return digits.join('');
    }

    decodeChunk(encodedChunk, expectedBytes) {
        let value = 0n;
        const radixBig = BigInt(this.RADIX);
        for (let i = encodedChunk.length - 1; i >= 0; i--) {
            const char = encodedChunk[i];
            const digit = this.charToIndex.get(char);
            value = value * radixBig + BigInt(digit);
        }
        const bytes = new Uint8Array(expectedBytes);
        for (let i = expectedBytes - 1; i >= 0; i--) {
            bytes[i] = Number(value & 0xFFn);
            value >>= 8n;
        }
        return bytes;
    }

    encodeMetadataOptimized(length, checksum) {
        const lengthEncoded = this.encodeVariableLength(length);
        const version = this.indexToChar.get(1);
        const checksumChar = this.indexToChar.get(checksum);
        return version + lengthEncoded + checksumChar;
    }

    decodeMetadataOptimized(encodedStr) {
        let position = 1;
        const { value: length, position: posAfterLength } = this.decodeVariableLength(encodedStr, position);
        position = posAfterLength;
        const checksumChar = encodedStr[position];
        const expectedChecksum = this.charToIndex.get(checksumChar);
        position++;
        return { length, expectedChecksum, dataStartIndex: position };
    }

    calculateChecksum(bytes) {
        let checksum = 0;
        let multiplier = 1;
        for (let i = 0; i < bytes.length; i++) {
            checksum = (checksum + bytes[i] * multiplier) % this.RADIX;
            multiplier = (multiplier * 31) % this.RADIX;
        }
        return checksum;
    }




    /**
     * Estimate encoding efficiency
     */
    getEfficiencyStats(dataSize) {
        const bitsPerChar = this.BITS_PER_CHAR;
        const overhead = dataSize <= this.SMALL_DATA_THRESHOLD ? 3 : 5; // Estimated overhead chars
        const dataBits = dataSize * 8;
        const encodedChars = Math.ceil(dataBits / bitsPerChar) + overhead;

        return {
            inputBytes: dataSize,
            outputChars: encodedChars,
            efficiency: dataBits / (encodedChars * bitsPerChar),
            bitsPerChar: bitsPerChar,
            compressionRatio: encodedChars / dataSize
        };
    }
}

// Module export support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DirectBaseEncoder;
}