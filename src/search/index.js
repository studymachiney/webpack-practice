import React from 'react';
import ReactDOM from 'react-dom';
import './search.less';
import logo from './static/images/logo.png';
import { a } from './tree-shaking';
import { spec } from '../spec';

function Search() {
  spec();
  return (
    <div
      className="search-text"
      onClick={() => { a(); }}
    >
      Search Text
      <img src={logo} alt="" />
    </div>
  );
}

ReactDOM.render(
  <Search />,
  document.getElementById('root'),
);
