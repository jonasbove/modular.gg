import {buildFile} from '../api/compiler/compileJSON.js';
import info from './case1.json' assert { type: 'json' };

console.log(buildFile(info));
