/**
 * Multi-lingual script detection and transliteration for Indian languages.
 * Implements Stage 1 of the Verification Pipeline: put every script into Roman script.
 */

// Mapping of unicode blocks to Indian language scripts
export function detectScriptAndLanguage(text: string): { language: string; script: string; isIndic: boolean } {
  const clean = text.trim();
  
  // Devanagari (Hindi, Marathi, Sanskrit, Nepali)
  if (/[\u0900-\u097F]/.test(clean)) {
    // Simple heuristic for Marathi vs Hindi
    if (/[\u0933]/.test(clean) || clean.includes('च्या') || clean.includes('वार्ता')) {
      return { language: 'Marathi', script: 'Devanagari', isIndic: true };
    }
    return { language: 'Hindi', script: 'Devanagari', isIndic: true };
  }
  
  // Bengali / Assamese
  if (/[\u0980-\u09FF]/.test(clean)) {
    if (/[\u09F0\u09F1]/.test(clean)) {
      return { language: 'Assamese', script: 'Bengali', isIndic: true };
    }
    return { language: 'Bengali', script: 'Bengali', isIndic: true };
  }
  
  // Gurmukhi (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(clean)) {
    return { language: 'Punjabi', script: 'Gurmukhi', isIndic: true };
  }
  
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(clean)) {
    return { language: 'Gujarati', script: 'Gujarati', isIndic: true };
  }
  
  // Odia
  if (/[\u0B00-\u0B7F]/.test(clean)) {
    return { language: 'Odia', script: 'Odia', isIndic: true };
  }
  
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(clean)) {
    return { language: 'Tamil', script: 'Tamil', isIndic: true };
  }
  
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(clean)) {
    return { language: 'Telugu', script: 'Telugu', isIndic: true };
  }
  
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(clean)) {
    return { language: 'Kannada', script: 'Kannada', isIndic: true };
  }
  
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(clean)) {
    return { language: 'Malayalam', script: 'Malayalam', isIndic: true };
  }
  
  // Arabic / Urdu
  if (/[\u0600-\u06FF]/.test(clean)) {
    return { language: 'Urdu', script: 'Perso-Arabic', isIndic: true };
  }
  
  // Default Latin / English
  return { language: 'English', script: 'Latin', isIndic: false };
}

// Phonetic transliteration table for Devanagari to Roman
const devanagariMap: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gya', 'ळ': 'l',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', '्': '', '़': '', 'ँ': 'n'
};

// Known common translation dictionary for Indian media terms across languages
export const indicMediaDictionary: Record<string, { english: string; normalized: string }> = {
  // Hindi / Sanskrit / Marathi
  'दैनिक': { english: 'daily', normalized: 'dainik' },
  'समाचार': { english: 'news', normalized: 'samachar' },
  'जागरण': { english: 'awakening/times', normalized: 'jagran' },
  'भास्कर': { english: 'sun/herald', normalized: 'bhaskar' },
  'पत्रिका': { english: 'gazette/chronicle', normalized: 'patrika' },
  'प्रभात': { english: 'morning/herald', normalized: 'prabhat' },
  'संदेश': { english: 'message/post', normalized: 'sandesh' },
  'उजाला': { english: 'light/herald', normalized: 'ujala' },
  'नवभारत': { english: 'new india', normalized: 'navbharat' },
  'लोकमत': { english: 'public opinion', normalized: 'lokmat' },
  'सकाल': { english: 'morning', normalized: 'sakal' },
  'तरुण': { english: 'young/youth', normalized: 'tarun' },
  'वार्ता': { english: 'news/bulletin', normalized: 'varta' },
  'दर्पण': { english: 'mirror', normalized: 'darpan' },
  'आवाज': { english: 'voice', normalized: 'aawaz' },
  'जनता': { english: 'people/citizen', normalized: 'janata' },
  'भारत': { english: 'india', normalized: 'bharat' },
  'विवाह': { english: 'matrimonial', normalized: 'vivah' },
  'सूची': { english: 'list/catalogue', normalized: 'suchi' },
  
  // Bengali
  'আনন্দবাজার': { english: 'ananda bazaar', normalized: 'anandabazar' },
  'বর্তমান': { english: 'present/current', normalized: 'bartaman' },
  'সংবাদ': { english: 'news', normalized: 'sangbad' },
  'প্রতিদিন': { english: 'daily/everyday', normalized: 'pratidin' },
  
  // Tamil
  'தினமலர்': { english: 'daily flower', normalized: 'dinamalar' },
  'தினத்தந்தி': { english: 'daily telegram', normalized: 'dinathanthi' },
  'தினமணி': { english: 'daily gem', normalized: 'dinamani' },
  'செய்திகள்': { english: 'news', normalized: 'seithigal' },
  
  // Telugu
  'ఈనాడు': { english: 'today', normalized: 'eenadu' },
  'సాక్షి': { english: 'witness', normalized: 'sakshi' },
  'వార్త': { english: 'news', normalized: 'vaartha' },
  'ఆంధ్ర': { english: 'andhra', normalized: 'andhra' },
  'జ్యోతి': { english: 'light/flame', normalized: 'jyothi' }
};

/**
 * Transliterates text from Indic scripts to Romanized phonetic text
 */
export function transliterateToRoman(text: string): string {
  if (!text) return '';
  
  const { isIndic, language } = detectScriptAndLanguage(text);
  if (!isIndic) {
    return text.trim();
  }

  // Check known whole words first
  let result = text;
  for (const [indicWord, info] of Object.entries(indicMediaDictionary)) {
    if (result.includes(indicWord)) {
      result = result.replaceAll(indicWord, ` ${info.normalized} `);
    }
  }

  // Character-level transliteration for Devanagari
  if (language === 'Hindi' || language === 'Marathi') {
    let charOutput = '';
    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      if (devanagariMap[char]) {
        charOutput += devanagariMap[char];
      } else {
        charOutput += char;
      }
    }
    return charOutput.replace(/\s+/g, ' ').trim();
  }

  // Fallback for other scripts: return clean mapped or ascii
  return result
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
