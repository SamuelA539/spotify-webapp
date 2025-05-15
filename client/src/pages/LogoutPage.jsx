import { useEffect } from "react"

export default function LogoutPage() {
    useEffect(() => {
        fetch('http://localhost:5000/logout')
    },[])

    return(
        <>
            Done?
        </>
    )
}