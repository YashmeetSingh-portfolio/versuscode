const axios = require('axios');

const LANGUAGE_MAP = {
    'javascript': { language: 'js', version: '18.15.0' },
    'python': { language: 'python', version: '3.10.0' },
    'cpp': { language: 'cpp', version: '10.2.0' }
};

const executeCode = async (language, sourceCode, stdin = '') => {
    const langConfig = LANGUAGE_MAP[language];
    if (!langConfig) throw new Error('Unsupported language');

    try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: langConfig.language,
            version: langConfig.version,
            files: [{ content: sourceCode }],
            stdin: stdin
        });

        return response.data.run;
    } catch (error) {
        console.error('Piston API Error:', error);
        throw error;
    }
};

module.exports = { executeCode };
