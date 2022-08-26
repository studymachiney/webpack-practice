import _ from 'lodash';
import { helloworld } from './helloworld';
import { spec } from '../spec';

console.log(helloworld());
const arr = [1, 2, 3];
_.forEach(arr, (item) => {
  console.log(item);
});
spec();
