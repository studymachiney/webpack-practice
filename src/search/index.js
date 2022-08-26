import React from 'react'
import ReactDOM from 'react-dom'
import './search.less'
import logo from './static/images/logo.png'
import { a } from './tree-shaking'
import {spec} from '../spec'

class Search extends React.Component {
    render() {
        spec()
        return <div className='search-text' onClick={a}>
            Search Text
            <img src={logo} />
            </div>
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('root')
)