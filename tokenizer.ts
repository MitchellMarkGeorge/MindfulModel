import { TokenizerConfig } from './types';
import fs from 'fs';
// Public Domain CC0 license. https://creativecommons.org/publicdomain/zero/1.0/
// https://gist.github.com/dlebech/5bbabaece36753f8a29e7921d8e5bfc7

class Tokenizer {
  // filters: RegExp
  // lower: boolean
  config: TokenizerConfig
  wordIndex: object
  indexWord: object
  wordCounts: object
    constructor(config: TokenizerConfig = {filters: /[\\.,/#!$%^&*;:{}=\-_`~()]/g, lower: true }) {
      // this.filters = config.filters || /[\\.,/#!$%^&*;:{}=\-_`~()]/g;
      // this.lower = typeof config.lower === 'undefined' ? true : config.lower;
      this.config = config
      // Primary indexing methods. Word to index and index to word.
      this.wordIndex = {};
      this.indexWord = {};
  
      // Keeping track of word counts
      this.wordCounts = {};
    }
  // look into this
    cleanText(text): number[] {
      if (this.config.lower) text = text.toLowerCase();
      // if (this.config.max_len) text
      return text
        .replace(this.config.filters, '')
        .replace(/\s{2,}/g, ' ')
        .split(' ');
      
      // return newText
    }

    // look into this
  
    fitOnTexts(texts) {
      texts.forEach(text => {
        text = this.cleanText(text);
        text.forEach(word => {
          this.wordCounts[word] = (this.wordCounts[word] || 0) + 1;
        });
      });
  
      Object.entries(this.wordCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([word, number], i) => {
          this.wordIndex[word] = i + 1;
          this.indexWord[i + 1] = word;
        });
    }
  
    textsToSequences(texts) {
      return texts.map(text => this.cleanText(text).map(word => this.wordIndex[word] || 0));
    }

    saveTokenizer(path: string) {
      return new Promise((resolve, reject) => {
        fs.writeFile(path, this.toJson(), (err) => {
          if (err) return reject(err);
          resolve() // do i need to do this
        })
      })
    }
  
    toJson() {
      return JSON.stringify({
        wordIndex: this.wordIndex,
        indexWord: this.indexWord,
        wordCounts: this.wordCounts
      })
    }
  }
  
  export const tokenizerFromJson = json_string => {
    const tokenizer = new Tokenizer();
    const js = JSON.parse(json_string);
    tokenizer.wordIndex = js.wordIndex;
    tokenizer.indexWord = js.indexWord;
    tokenizer.wordCounts = js.wordCounts;
    return tokenizer;
  };
  
  export default Tokenizer;