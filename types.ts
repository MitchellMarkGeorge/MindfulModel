export interface TokenizerConfig {
    filters?: RegExp,
    lower?: boolean, 
    max_len?: number

}

export interface ToxicDataType {
    comment_text: string
    prediction: number[], 

}