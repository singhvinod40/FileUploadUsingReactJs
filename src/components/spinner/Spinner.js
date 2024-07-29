import React from 'react'
import loader from './spiner.gif';

const Spinner = () => {

    return (
        <div className='text-center'>
            <img src={loader} alt='loading' width={80} height={80}></img>
        </div>
    )

}

export default Spinner