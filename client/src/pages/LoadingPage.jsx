import { useEffect, useState } from "react"
import LoginPage from "./LoginPage"

//handle Error messages from fetch loading(refresh) vs error
export default function LoadingPage({errMsg}) {
    //save refresh error state
    const [errFlg, setErrFlg] = useState(false)

    //errMsg -> loading vs error page
    useEffect(()=>{
        fetch('http://localhost:5000/refresh')
        .then(res => res.json()
            .then(res =>{
                console.log('Loading Reason: ', res)
            })
        )
        .catch(err => {
            //console.warn(err)
            setErrFlg(true)
        })
    },[])

    if (errFlg){
        return (
            <>
                <>Error</>
                <>Please Try Logging in Again</>
                <LoginPage/>
            </>
        )
    }

    return (
        <>Loading...</>
    )
}