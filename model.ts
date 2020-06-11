// split trian and test into two arrays - 1 for comments and one for prediction (not for test)
import * as ts from '@tensorflow/tfjs-node';
import train from './data/train.json';
import test from './data/test.json';
import Tokenizer, { tokenizerFromJson } from './tokenizer'

