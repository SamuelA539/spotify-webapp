import { useState } from "react"
import NavBar from "../components/NavBar"
export default function ToListenToPage() {
    const [searchValue, setSearchValue] = useState()

    return(
        <>
            <NavBar/>   <br/><br/>
            toListenTo Page  <br/>

            {/* item type selecter? */}
            <div>
                Set to listen to playlist
            </div>

            {/* Posting info and formating response or useEffect */}
            <form>  
                form
                <input type="search" id="toListenToSearchBar"/>
                <button id="toListenToBtn" onClick={() => {
                    let searchbar = document.getElementById('toListenToSearchBar')
                    console.log(searchbar.value)
                    //setsearch()

                }}>Search</button>
            </form>

            {/* <div>
                <input type="search" id="toListenToSearchBar"/>
                <button id="toListenToBtn" onClick={() => {
                    let searchbar = document.getElementById('toListenToSearchBar')
                    console.log(searchbar.value)
                    //setsearch()

                }}>Search</button>
            </div> */}
            

            {/* search results component?*/}
        </>
    )
}