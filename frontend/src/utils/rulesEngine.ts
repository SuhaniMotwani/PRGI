/**
 * Deterministic PRGI Government Rules Engine (Member 4 Rules & RAG Layer)
 * Checks submitted titles against PRGI 2025 Verification Guidelines.
 */

import type { RuleViolation } from '../types';
import { normalizeTitle } from './similarity';

// Banned Government, UN & State Emblem keywords
const GOVT_RESERVED_WORDS = [
  'government', 'sarkari', 'sarkar', 'rashtrapati', 'parliament', 'sansad',
  'judiciary', 'supreme court', 'high court', 'police', 'cbi', 'cid', 'ed',
  'army', 'navy', 'air force', 'united nations', 'unicef', 'unesco', 'who',
  'official gazette', 'rajpatra', 'prashasan', 'mantralaya', 'ashoka'
];

// Commercial & Matrimonial terms
const COMMERCIAL_WORDS = [
  'matrimonial', 'vivah suchi', 'shaadi suchi', 'rishta', 'property bazaar',
  'classifieds', 'classified', 'shopping mart', 'tender bulletin', 'loan hub',
  'brokerage', 'yellow pages', 'directory', 'deals daily'
];

// Internet domains & web prefixes
const INTERNET_TERMS = [
  '.com', '.org', '.net', '.in', '.co', '.io', 'www.', 'http', 'https',
  '.gov', '.edu', 'dot com', 'dot in', '@'
];

// Single generic dictionary root words that cannot stand alone
const SINGLE_ROOT_WORDS = new Set([
  'news', 'times', 'today', 'express', 'patrika', 'samachar', 'gazette',
  'bulletin', 'magazine', 'journal', 'reporter', 'chronicle', 'post',
  'herald', 'media', 'press', 'sandesh', 'ujala', 'khabar', 'darpan'
]);

// Defamatory or offensive tokens
const DEFAMATORY_WORDS = [
  'hate', 'scam', 'fraud', 'terror', 'cheat', 'illegal', 'bribe'
];

/**
 * Executes deterministic rule evaluations on a title
 */
export function evaluateGovernmentRules(title: string): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const normalized = normalizeTitle(title);
  const rawLower = title.toLowerCase().trim();
  const tokens = normalized.split(/\s+/).filter(Boolean);

  // 1. Length validation (Rule 7.2a)
  const isLengthValid = title.trim().length >= 3 && title.trim().length <= 100;
  violations.push({
    ruleId: 'Rule-7.2a',
    ruleName: 'Title Character Length Constraints',
    severity: isLengthValid ? 'INFO' : 'CRITICAL',
    description: isLengthValid 
      ? 'Title length is compliant (3 - 100 characters).'
      : `Title length (${title.trim().length} chars) violates guidelines (Must be between 3 and 100 characters).`,
    clause: 'PRGI Title Verification Guidelines 2025, Section 7(2)(a)',
    passed: isLengthValid
  });

  // 2. UN / Government Reserved Terms (Rule 2.1a)
  let foundGovtWord: string | undefined;
  for (const w of GOVT_RESERVED_WORDS) {
    if (normalized.includes(w) || rawLower.includes(w)) {
      foundGovtWord = w;
      break;
    }
  }
  const passedGovt = !foundGovtWord;
  violations.push({
    ruleId: 'Rule-2.1a',
    ruleName: 'Government & National Emblem Reserved Names',
    severity: passedGovt ? 'INFO' : 'CRITICAL',
    description: passedGovt
      ? 'No protected government or state emblem terms detected.'
      : `Disallowed government/institutional term "${foundGovtWord}" detected. Titles cannot imply official government affiliation.`,
    clause: 'Emblems and Names (Prevention of Improper Use) Act & PRGI Clause 2.1(a)',
    passed: passedGovt,
    triggerPhrase: foundGovtWord
  });

  // 3. Commercial & Matrimonial terms (Rule 4.1a)
  let foundCommercialWord: string | undefined;
  for (const w of COMMERCIAL_WORDS) {
    if (normalized.includes(w) || rawLower.includes(w)) {
      foundCommercialWord = w;
      break;
    }
  }
  const passedCommercial = !foundCommercialWord;
  violations.push({
    ruleId: 'Rule-4.1a',
    ruleName: 'Commercial & Matrimonial Catalog Ban',
    severity: passedCommercial ? 'INFO' : 'CRITICAL',
    description: passedCommercial
      ? 'No purely commercial or classified/matrimonial catalog terms found.'
      : `Commercial listing keyword "${foundCommercialWord}" identified. Periodical titles cannot be dedicated advertising catalogs.`,
    clause: 'PRGI Guidelines 2025, Section 4.1(a) Commercial Publications',
    passed: passedCommercial,
    triggerPhrase: foundCommercialWord
  });

  // 4. Internet domains and web syntax (Rule 3.2b)
  let foundInternetTerm: string | undefined;
  for (const term of INTERNET_TERMS) {
    if (rawLower.includes(term)) {
      foundInternetTerm = term;
      break;
    }
  }
  const passedInternet = !foundInternetTerm;
  violations.push({
    ruleId: 'Rule-3.2b',
    ruleName: 'Internet Domain & URL Syntax Ban',
    severity: passedInternet ? 'INFO' : 'CRITICAL',
    description: passedInternet
      ? 'No URL suffixes or web protocols detected.'
      : `Internet domain or URL fragment "${foundInternetTerm}" found. Periodical print titles cannot be formatted as web domains.`,
    clause: 'PRGI Digital Alignment Guidelines 2025, Rule 3(2)(b)',
    passed: passedInternet,
    triggerPhrase: foundInternetTerm
  });

  // 5. Single Generic Root Word (Rule 1.1a)
  const isSingleGenericWord = tokens.length === 1 && SINGLE_ROOT_WORDS.has(tokens[0]);
  violations.push({
    ruleId: 'Rule-1.1a',
    ruleName: 'Single Generic Media Root Disallowance',
    severity: !isSingleGenericWord ? 'INFO' : 'CRITICAL',
    description: !isSingleGenericWord
      ? 'Title contains distinctive qualifiers or multi-word structure.'
      : `Single standalone generic word "${tokens[0]}" is disallowed without distinctive identifying prefix/sub-title.`,
    clause: 'Press and Registration of Periodicals Act, Section 5(1)',
    passed: !isSingleGenericWord,
    triggerPhrase: isSingleGenericWord ? tokens[0] : undefined
  });

  // 6. Defamatory / Public Order (Rule 6.1b)
  let foundDefamatory: string | undefined;
  for (const w of DEFAMATORY_WORDS) {
    if (normalized.includes(w)) {
      foundDefamatory = w;
      break;
    }
  }
  const passedDefamatory = !foundDefamatory;
  violations.push({
    ruleId: 'Rule-6.1b',
    ruleName: 'Public Decency & Defamation Compliance',
    severity: passedDefamatory ? 'INFO' : 'CRITICAL',
    description: passedDefamatory
      ? 'Title is compliant with public decency standards.'
      : `Sensitive or potentially defamatory term "${foundDefamatory}" flagged for mandatory legal review.`,
    clause: 'PRGI Ethical & Public Order Standards 2025, Rule 6(1)(b)',
    passed: passedDefamatory,
    triggerPhrase: foundDefamatory
  });

  return violations;
}
