import React from 'react'
import dynamic from 'next/dynamic'
const Lottie = dynamic(
    import('lottie-react').then((Lottie) => {
        return Lottie
    }),
    {
        ssr: false,
        loading: () => <p>Loading ...</p>,
    },
)
import selectTypeLottie from "./selectTypeLottie.json";

const SelectType = () => {
    return (
        <div>
            <Lottie style={{ width: 300, height: 300 }} animationData={selectTypeLottie} />

        </div>
    )
}

export default SelectType