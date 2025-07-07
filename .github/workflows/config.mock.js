window.CONFIG = {
    SAFE_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~!$()*,:@;+&=\'<>[]"{}|`^\\',
    MAX_URL_LENGTH: 8000,
    SUPPORTED_INPUT_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/heic', 'image/heif', 'image/avif'],
    FORMAT_SIGNATURES: {
        'JPEG': { bytes: [0xFF, 0xD8, 0xFF], offset: 0, format: 'image/jpeg' },
        'PNG': { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0, format: 'image/png' }
    }
};