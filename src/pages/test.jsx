import React, { useState } from 'react'

const Child = ({getData}) => {
    const [text, setText] = useState('')

    const handleChange = (e) => {
        setText(e.target.value)
        getData(e.target.value)
    }
    return (
        <div>
            <h1>Child</h1>
            <input value={text} onChange={handleChange} type="text" />
        </div>
    )
}


const test = () => {
    const [text, setText] = useState('')


    const handleClick = (e) => {
        let working = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(working);
    }

    const getData = (data) => {
        setText(data)
    }
    return (
        <div>
            <button onClick={handleClick}>{text}</button>

            <Child getData={(e) => getData(e)}/>
        </div>
    )
}

export default test