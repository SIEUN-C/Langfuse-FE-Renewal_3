/**
 * @file JS version of prompt types (JSDoc typedefs for IDEs)
 */

/** @typedef {'system'|'user'|'assistant'} ChatRole */
/** @typedef {{ role: ChatRole, content: string }} ChatMessage */
/** @typedef {string | ChatMessage[]} PromptContentType */
/** @typedef {Object<string, any> | null} ConfigContent */
/** @typedef {{ python: string, jsTs: string }} UseContent */
/** @typedef {'chat'|'text'} PromptType */

/**
 * @typedef {Object} FetchedPrompt
 * @property {string} name
 * @property {PromptContentType} prompt
 * @property {PromptType} type
 * @property {number} version
 * @property {ConfigContent} config
 * @property {string[]} tags
 * @property {string} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string[]} labels
 * @property {string|null} commitMessage
 */

/**
 * @typedef {Object} DisplayPrompt
 * @property {string} id
 * @property {string} name
 * @property {number} versions
 * @property {PromptType} type
 * @property {string} latestVersionCreatedAt
 * @property {number} observations
 * @property {string[]} tags
 */

/**
 * @typedef {Object} Version
 * @property {number} id
 * @property {string} label
 * @property {string[]} labels
 * @property {string} details
 * @property {string} author
 * @property {{ system?: string, user: string }} prompt
 * @property {ConfigContent} config
 * @property {UseContent} useprompts
 * @property {string[]} tags
 * @property {string|null} commitMessage
 */

// No runtime exports; this file is for editor hints only.
export { };
