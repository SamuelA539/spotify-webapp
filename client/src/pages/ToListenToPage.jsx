import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import TrackCard from "../components/TrackCard"
export default function ToListenToPage() {

    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState({})

    //getting search reuslts
    useEffect(() => {
        if (searchValue != '') {
            fetch(`http://localhost:5000/search?searchstr=${searchValue}`)
            .then( data => {
                    data.json()
                    .then(data => {
                        console.log(data)
                        setSearchResults(data.tracks)
                    })
                }
            )
            .catch(err => {
                console.error('Search Error: ', err)
            })
        }
    }, [searchValue])

    const [playlist, setPlaylists] = useState({})

    //get playlists for user to add to (later feature)
    // useEffect(() => {
    //     fetch('http://localhost:5000/playlists')
    //     .then(res => {
    //         res.json()
    //         .then(data => 
    //             console.log('Playlists: ',data)
    //         )
    //     })
    //     .catch(err => console.error("Playlist fetch error: ", err))

    // }, [])


    return(
        <>
            <NavBar/>   <br/><br/>
            toListenTo Page  <br/>

           
            <div>
                <p>adding to: {'toListenTo'}</p>
                {/*
                    <button>new</button>
                    <div><button>select</button>select bit</div>
                */}
            </div>

            {/* item type selecter? */}
            <div id="searchbarDiv">
                <input type="search" id="toListenToSearchBar"/>
                <button id="toListenToBtn" onClick={() => {
                    let searchbar = document.getElementById('toListenToSearchBar')
                    console.log(searchbar.value)
                    setSearchValue(searchbar.value)
                }}>Search</button>
            </div><br/><br/>

            {/* search results component?*/}

            
            <div id="search results">
                {searchResults == null? null :
                <ul>
                    {searchResults.items == null ? null : searchResults.items.map(t =>  
                        <li key={t.id}>
                            <TrackCard track={t}/> 
                            {t.uri == null? null: 
                            <form method="POST" action={'http://localhost:5000/toListenTo'}>
                                <input type="text" name="songURI" id={`${t.id} text`} value={String(t.uri)} required hidden/>
                                <input type="submit" value="listenToLater"/>
                            </form>
                            }
                            
                            
                        </li>
                    )}
                </ul>
                }   
            </div>
        </>
    )
}