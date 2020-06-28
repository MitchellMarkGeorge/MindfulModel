// import fs from "fs";
// split trian and test into two arrays - 1 for comments and one for prediction (not for test)
import * as tf from "@tensorflow/tfjs-node";
// require('@tensorflow/tfjs-node');
// 
// import * as fs from 'f'
import train from "./data/train.json";
// import test from "./data/test.json";
import Tokenizer from "./tokenizer";
import { ToxicDataType } from "./types";
// import { Rank } from "@tensorflow/tfjs";

const MAX_FEATURES = 2000000;
const MAX_TEXT_LENGTH = 200;
const CLASS_LIST = [
  "toxic",
  "severe_toxic",
  "obscene",
  "threat",
  "insult",
  "identity_hate",
];

let trainData = <ToxicDataType[]>train;
// console.log(trainData.length);
// let testData = <ToxicDataType[]>test;

let y = trainData.map((item) => item.prediction);
// console.log(y.length);

let raw_train_text = trainData.map((item) => item.comment_text);
// let raw_test_text = testData.map((item) => item.comment_text);

const tokenizer = new Tokenizer();

tokenizer.fitOnTexts(raw_train_text);

let list_tokenized_train = tokenizer.textsToSequences(raw_train_text);
// let list_tokenized_test = tokenizer.textsToSequences(raw_test_text);
// 
// console.log(list_tokenized_test)
let xtrain = pad_array(list_tokenized_train);

(async function () {
  await tokenizer.saveTokenizer('tokenizer.json');
})
// let xtrain = padSequences(list_tokenized_train)
// let xtest = pad_array(list_tokenized_test);

// console.log(xtest)

// fs.writeFileSync('tokenizer.json', tokenizer.toJson())
// fs.writeFile('tokenizer.js', tokenizer.toJson(), (err) => {
//     if (err) console.log(err)
// }
// )

// tf.tidy(() => {
// let final_xtest_ = tf.tensor(xtest); // confirm shap
// console.log(final_xtest_.shape)

// console.log(xtrain.every((item) => item.length === MAX_TEXT_LENGTH))

let final_xtrain = tf.tensor(xtrain);
// console.log(final_xtrain.shape);

let final_ytrain = tf.tensor(y);
// console.log(final_ytrain.shape);

const model = tf.sequential({
  layers: [
    tf.layers.embedding({inputShape: [MAX_TEXT_LENGTH], inputDim: MAX_FEATURES, outputDim: 50 }),
    tf.layers.lstm({ units: 128, returnSequences: true }),
    tf.layers.dropout({ rate: 0.5}),
    tf.layers.lstm({units: 64}),
    tf.layers.dropout({ rate: 0.5}),
    tf.layers.dense({ units: 6, activation: "sigmoid" })

  ]
 });

//  final_xtrain.dispose();
//  final_ytrain.dispose();
// tokenizer.wordIndex
// console.log(Object.keys(tokenizer.wordIndex).length)
// // .embedding({ inputDim: MAX_FEATURES, outputDim: 128 })

// let inp = <tf.SymbolicTensor>tf.layers.input({ shape: [MAX_TEXT_LENGTH] });
// let embed = tf.layers
//   .embedding({ inputDim: MAX_FEATURES, outputDim: 128 })
//   .apply(inp);
// let lstm = tf.layers.lstm({ units: 60, returnSequences: true }).apply(embed);
// let gmp1d = tf.layers.globalMaxPool1d().apply(lstm);
// let dropout1 = tf.layers.dropout({ rate: 0.1 }).apply(gmp1d);
// let dense1 = tf.layers.dense({ units: 50, activation: "relu" }).apply(dropout1);
// let dropout2 = tf.layers.dropout({ rate: 0.1 }).apply(dense1);
// const dense2 = <tf.SymbolicTensor>(
//   tf.layers.dense({ units: 6, activation: "sigmoid" }).apply(dropout2)
// );

// const model = tf.model({ inputs: inp, outputs: dense2 });

model.compile({
  loss: "binaryCrossentropy",
  optimizer: "adam",
  metrics: ["accuracy"],
});

model
// @ts-ignore
  .fit(final_xtrain, final_ytrain, {
    batchSize: 32,
    epochs: 2,
    validationSplit: 0.1,
  })
  .then(() => {
    console.log("done!");
    model.save('file:///model.json');
    // tf.tidy(() => {
    // console.log(model.predict(final_xtest_));
    // });
    // console.log(model.predict(final_xtest_));
  })
  .catch((err) => console.log(err));

// });

// tokenizer.saveTokenizer().the
function pad_array(texts: number[][]) {
  // if (array.length < MAX_TEXT_LENGTH)

  // return array.fill(0, array.length, MAX_TEXT_LENGTH);
  // return array;

  return texts.map((text) => {
    if (text.length === MAX_TEXT_LENGTH) return text;
    if (text.length > MAX_TEXT_LENGTH) {
      return text.slice(0, MAX_TEXT_LENGTH);
      //   console.log(text.length)
      // could also do text.length = 200
    } else {
      while (text.length < MAX_TEXT_LENGTH) {
        text.push(0);
      }

      return text
  } });

  // for (let text of texts) {
  //   if (text.length === MAX_TEXT_LENGTH) continue;
  //   if (text.length > MAX_TEXT_LENGTH) {
  //     text = text.slice(0, MAX_TEXT_LENGTH);
  //     //   console.log(text.length)
  //     // could also do text.length = 200
  //   } else {
  //     while (text.length < MAX_TEXT_LENGTH) {
  //       text.push(0);
  //     }
  //     //   console.log(text.length)
  //   }
  // }

  // return texts;
}



// SAVE TOKENIZER - SAVE MODEL








 function padSequences(
  sequences,
  maxLen = MAX_TEXT_LENGTH,
  padding = "pre",
  truncating = "pre",
  value = 0
) {
  return sequences.map((seq) => {
    if (seq.length > maxLen) {
      if (truncating === "pre") {
        seq.splice(0, seq.length - maxLen);
      } else {
        seq.splice(maxLen, seq.length - maxLen);
      }
    }
    if (seq.length < maxLen) {
      const pad = [];
      for (let i = 0; i < maxLen - seq.length; ++i) {
        pad.push(value);
      }
      if (padding === "pre") {
        seq = pad.concat(seq);
      } else {
        seq = seq.concat(pad);
      }
    }
    return seq;
  });
}
